import { NextRequest, NextResponse } from "next/server";
import { certificationService } from "@/services/certifications/certificationService";
import { getSessionUser } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    // Reference data, but only ever requested from authenticated pages -
    // no reason to expose the certification scheme catalogue anonymously.
    await getSessionUser(req);

    const options = await certificationService.fetchCertificationOptions();
    return NextResponse.json(options);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    console.error("❌ Error fetching certification options:", error);
    return NextResponse.json(
      { error: "Failed to fetch options" },
      { status: 500 }
    );
  }
}