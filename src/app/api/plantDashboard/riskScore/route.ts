import { NextRequest, NextResponse } from "next/server";
import { RiskProfileService } from "@/services/plantDashboard/riskScore/riskProfileService";

export async function GET(req: NextRequest) {
  try {
    const data = await RiskProfileService.getRiskScoreByPlant(req);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching risk score:", error);
    return NextResponse.json({ error: "Failed to fetch risk score" }, { status: 500 });
  }
}
