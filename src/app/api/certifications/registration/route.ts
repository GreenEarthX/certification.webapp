import { NextRequest, NextResponse } from "next/server";
import { certificationService } from "@/services/certifications/certificationService";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await certificationService.registerCertification(body);
    return NextResponse.json({ certification: result }, { status: 201 });
  } catch (error) {
    console.error("Certification registration error:", error);
    return NextResponse.json({ error: "Certification failed" }, { status: 500 });
  }
}

