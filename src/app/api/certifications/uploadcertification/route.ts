import { NextRequest, NextResponse } from "next/server";
import { certificationService } from '@/services/certifications/certificationService';
import { getSessionUser } from '@/lib/auth';
import { authErrorResponse } from '@/lib/api-auth';
import { MAX_UPLOAD_BYTES, PAYLOAD_TOO_LARGE, payloadTooLargeResponse } from '@/lib/limits';

/**
 * Document types the extraction service accepts. Mirrors the `accept`
 * attributes on the upload inputs in the UI.
 */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

export async function POST(req: NextRequest) {
  try {
    // Previously unauthenticated, with no size or type checking, forwarding
    // whatever it received to an internal extraction service.
    await getSessionUser(req);

    // Reject oversized uploads before formData() buffers the whole body.
    const declared = req.headers.get('content-length');
    if (declared && Number(declared) > MAX_UPLOAD_BYTES) {
      throw new Error(PAYLOAD_TOO_LARGE);
    }

    const data = await req.formData();
    const file = data.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(PAYLOAD_TOO_LARGE);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 415 }
      );
    }

    const result = await certificationService.uploadFileToExtractAPI(file);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    const tooLarge = payloadTooLargeResponse(error);
    if (tooLarge) return tooLarge;

    console.error('Certification upload failed:', error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
