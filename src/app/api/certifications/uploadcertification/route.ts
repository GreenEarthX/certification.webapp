import { NextRequest, NextResponse } from "next/server";
import { certificationService } from '@/services/certifications/certificationService';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get('file') as Blob;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const result = await certificationService.uploadFileToExtractAPI(file);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Upload failed" }, { status: 500 });
  }
}