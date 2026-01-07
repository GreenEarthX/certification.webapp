import { NextRequest, NextResponse } from "next/server";
import { RecommendationService } from "@/services/plant-dashboard/recommendations/recommendationService";

export async function GET(req: NextRequest) {
  try {
    const recommendations = await RecommendationService.getRecommendationsByPlant(req);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((error as Error).message === "Unauthorized access") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
