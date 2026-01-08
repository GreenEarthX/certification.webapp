import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { recommendationService } from "@/services/recommendations/recommendationService";

export async function GET(req: NextRequest) {
  try {
    const userSub = await getSessionUser(req);
    const recommendations = await recommendationService.getAllRecommendations(userSub);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("API error:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
