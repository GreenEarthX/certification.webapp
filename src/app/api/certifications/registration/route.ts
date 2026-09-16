import { NextRequest, NextResponse } from "next/server";
import { certificationService } from "@/services/certifications/certificationService";
import { getSessionUser } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-auth";

export async function PUT(req: NextRequest) {
  try {
    // Previously unauthenticated: anyone could create certification records.
    await getSessionUser(req);

    const body = await req.json();
    const result = await certificationService.registerCertification(body);
    return NextResponse.json({ certification: result }, { status: 201 });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    console.error("Certification registration error:", error);
    return NextResponse.json({ error: "Certification failed" }, { status: 500 });
  }
}
