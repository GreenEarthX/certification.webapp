import { NextResponse } from "next/server";
import { getRecommendations } from "@/services/recommendations/recommendationService";

export async function GET() {
  try {
    const recommendations = await getRecommendations();
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
