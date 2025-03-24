// src/app/api/certifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { certificationService } from "@/services/certifications/certificationService";

export async function GET(req: NextRequest) {
  try {
    const userSub = await getSessionUser(req);
    const certifications = await certificationService.getCertifications(userSub);
    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
