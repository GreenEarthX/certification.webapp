import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';
import {
  MAX_JSON_BYTES,
  readLimitedArrayBuffer,
  payloadTooLargeResponse,
} from '@/lib/limits';

const PLAUSIBILITY_SERVICE_URL =
  process.env.PLAUSIBILITY_SERVICE_URL || 'http://localhost:8001';

export async function POST(req: NextRequest) {
  try {
    // Previously unauthenticated: an unbounded body was relayed straight to
    // an internal service.
    await getSessionUser(req);

    const body = await readLimitedArrayBuffer(req, MAX_JSON_BYTES);

    const externalRes = await fetch(
      `${PLAUSIBILITY_SERVICE_URL}/api/v1/plausibility/check`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      }
    );

    const text = await externalRes.text();
    const headers: Record<string, string> = {};
    const ct = externalRes.headers.get('content-type');
    if (ct) headers['content-type'] = ct;

    return new NextResponse(text, { status: externalRes.status, headers });
  } catch (err) {
    const denied = authErrorResponse(err);
    if (denied) return denied;

    const tooLarge = payloadTooLargeResponse(err);
    if (tooLarge) return tooLarge;

    console.error('Plausibility proxy error:', err);
    return NextResponse.json({ error: 'Plausibility proxy failed' }, { status: 500 });
  }
}
