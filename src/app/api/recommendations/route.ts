import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { recommendationService } from "@/services/recommendations/recommendationService";

export async function GET(req: NextRequest) {
  try {
    // FIXED: Check if requireRole returns a result
    const authResult = await requireRole(req, ['PlantOperator']);
    
    if (!authResult || !authResult.payload?.sub) {
      return NextResponse.json(
        { error: "Unauthorized or invalid token" },
        { status: 401 }
      );
    }

    const userSub: string = authResult.payload.sub;
    const recommendations = await recommendationService.getAllRecommendations(userSub);

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}