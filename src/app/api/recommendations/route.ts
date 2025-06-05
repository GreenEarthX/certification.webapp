import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { recommendationService } from "@/services/recommendations/recommendationService";

export async function GET(req: NextRequest) {
  try {
    const { payload } = await requireRole(req, ['PlantOperator']);

    if (!payload.sub) {
      return NextResponse.json({ error: "User ID missing in token" }, { status: 400 });
    }

    const userSub: string = payload.sub; 
    const recommendations = await recommendationService.getAllRecommendations(userSub);

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("API error:", error);
    return error instanceof Response
      ? error
      : NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
