import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';
import {
  MAX_UPLOAD_BYTES,
  readLimitedArrayBuffer,
  payloadTooLargeResponse,
} from '@/lib/limits';

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8000';

/**
 * The only document types the OCR service exposes. `endpoint` is interpolated
 * into the upstream URL, so it MUST come from this allowlist: previously a
 * value like `../../admin` re-targeted the request at any path on the internal
 * OCR host (SSRF via path traversal).
 */
const ALLOWED_ENDPOINTS = ['pos', 'invoice', 'ppa', 'termsheet'] as const;
type AllowedEndpoint = (typeof ALLOWED_ENDPOINTS)[number];

function isAllowedEndpoint(value: unknown): value is AllowedEndpoint {
  return typeof value === 'string' && (ALLOWED_ENDPOINTS as readonly string[]).includes(value);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ endpoint: string }> }
) {
  try {
    await getSessionUser(req);

    const { endpoint } = await context.params;

    if (!isAllowedEndpoint(endpoint)) {
      return NextResponse.json({ error: 'Unknown OCR endpoint' }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') || '';
    const bodyBuffer = await readLimitedArrayBuffer(req, MAX_UPLOAD_BYTES);

    const externalRes = await fetch(`${OCR_SERVICE_URL}/api/v1/ocr/${endpoint}`, {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: bodyBuffer,
    });

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

    console.error('OCR proxy error:', err);
    return NextResponse.json({ error: 'OCR proxy failed' }, { status: 500 });
  }
}
