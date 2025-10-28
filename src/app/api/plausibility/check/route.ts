import { NextRequest, NextResponse } from 'next/server';

const PLAUSIBILITY_SERVICE_URL = process.env.PLAUSIBILITY_SERVICE_URL || 'http://localhost:8001';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const externalRes = await fetch(`${PLAUSIBILITY_SERVICE_URL}/api/v1/plausibility/check`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body,
    });

    const text = await externalRes.text();
    const headers: Record<string, string> = {};
    const ct = externalRes.headers.get('content-type');
    if (ct) headers['content-type'] = ct;

    return new NextResponse(text, { status: externalRes.status, headers });
  } catch (err) {
    console.error('Plausibility proxy error:', err);
    return NextResponse.json({ error: 'Plausibility proxy failed' }, { status: 500 });
  }
}
