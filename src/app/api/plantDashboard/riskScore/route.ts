import { NextRequest, NextResponse } from "next/server";
import { getRiskScore } from "@/services/plantDashboard/riskScore/riskProfileService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plantId = searchParams.get("plantId");

  if (!plantId) {
    return NextResponse.json({ error: "Missing plant ID" }, { status: 400 });
  }

  try {
    const riskScore = await getRiskScore(plantId);
    return NextResponse.json(riskScore);
  } catch (error) {
    console.error("Error fetching risk score:", error);
    return NextResponse.json({ error: "Failed to fetch risk score" }, { status: 500 });
  }
}
