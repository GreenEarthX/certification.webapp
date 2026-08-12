import { NextRequest, NextResponse } from "next/server";
import { recommendationService } from "@/services/recommendations/recommendationService";
import { getSessionUser } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only requested from authenticated recommendation pages.
  try {
    await getSessionUser(request);
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;
    throw error;
  }

  const { id: recommendationId } = await params;

  if (!recommendationId) {
    return NextResponse.json({ error: "Missing recommendation ID" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section"); // "overview", "requirements", "process"
  const type = searchParams.get("type");       // "score" | undefined

  try {
    if (type === "score") {
      const data = await recommendationService.getComplianceScore(recommendationId);
      return NextResponse.json(data); // { complianceScore, schemeName }
    }

    const data = await recommendationService.getSchemeDetailsByRecommendationId(recommendationId);

    if (!data) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    const validSections: Record<string, string | string[]> = {
      overview: data.overview,
      requirements: data.requirements,
      process: data.process,
    };

    if (section && validSections[section]) {
      return NextResponse.json(validSections[section]);
    }

    if (section) {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
