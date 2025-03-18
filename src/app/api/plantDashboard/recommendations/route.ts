import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/services/plantDashboard/recommendations/recommendationService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plantId = searchParams.get("plantId");

  if (!plantId) {
    return NextResponse.json({ error: "Missing plant ID" }, { status: 400 });
  }

  try {
    const recommendations = await getRecommendations(plantId);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
