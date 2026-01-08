import { NextRequest, NextResponse } from "next/server";
import { CertificationsService } from "@/services/plant-dashboard/certifications/certificationService";

export async function GET(req: NextRequest) {
  try {
    const summary = await CertificationsService.getSummary(req);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error in certification summary route:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
