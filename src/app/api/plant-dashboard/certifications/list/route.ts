import { NextRequest, NextResponse } from "next/server";
import { CertificationsService } from "@/services/plant-dashboard/certifications/certificationService";

export async function GET(req: NextRequest) {
  try {
    const certifications = await CertificationsService.getList(req);
    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
  }
}