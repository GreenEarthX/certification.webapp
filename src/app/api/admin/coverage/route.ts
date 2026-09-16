import { NextRequest, NextResponse } from "next/server";
import { coverageService } from "@/services/coverage/coverageService";
import { requireAdminUser } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const coverages = await coverageService.getAllCoverages();
    return NextResponse.json(coverages);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to load coverage data" }, { status: 500 });
  }
}
