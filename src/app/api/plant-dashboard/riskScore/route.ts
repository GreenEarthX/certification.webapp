import { NextRequest, NextResponse } from "next/server";
import { RiskProfileService } from "@/services/plant-dashboard/riskScore/riskProfileService";

export async function GET(req: NextRequest) {
  try {
    const data = await RiskProfileService.getRiskScoreByPlant(req);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching risk score:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((error as Error).message === "Unauthorized access") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch risk score" }, { status: 500 });
  }
}
