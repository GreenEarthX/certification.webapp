import { NextRequest, NextResponse } from 'next/server';

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8000';

export async function POST(req: NextRequest, context: any) {
  const endpoint = context?.params?.endpoint;

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  try {
    // Forward the incoming multipart/form-data body to the external OCR service
    const contentType = req.headers.get('content-type') || '';

    // Read raw body as ArrayBuffer and forward
    const bodyBuffer = await req.arrayBuffer();

    const externalRes = await fetch(`${OCR_SERVICE_URL}/api/v1/ocr/${endpoint}`, {
      method: 'POST',
      headers: {
        'content-type': contentType,
      },
      body: bodyBuffer,
    });

    const text = await externalRes.text();

    // Mirror status and content-type
    const headers: Record<string, string> = {};
    const ct = externalRes.headers.get('content-type');
    if (ct) headers['content-type'] = ct;

    return new NextResponse(text, { status: externalRes.status, headers });
  } catch (err) {
    console.error('OCR proxy error:', err);
    return NextResponse.json({ error: 'OCR proxy failed' }, { status: 500 });
  }
}
