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
    console.error("AI extraction failed:", error);

return NextResponse.json(
  {
    error: (error as Error).message || "AI extraction failed",
    fallback: true, 
    exampleData: {
      Certification_name: "French Low Carbon Label",
      Type: "",
      Entity: "World Resources Institute (WRI)",
      Certification_Body: "WRI & Accredited Bodies",
      Issue_Date: "01/01/2024",
      Validity_Date: "01/01/2028",
      Certificate_Number: "XYZ123456",
      Complies_with: "EU Climate Policies",
    },
  },
  { status: 200 }
);

  }
}