import { NextRequest, NextResponse } from "next/server";
import { recommendationService } from "@/services/recommendations/recommendationService";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id: recommendationId } = context.params;

  if (!recommendationId) {
    return NextResponse.json({ error: "Missing recommendation ID" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section"); // "overview", "requirements", "process"
  const type = searchParams.get("type");       // "score" | undefined

  try {
    // 📌 If the request is for the compliance score (same as previous score route)
    if (type === "score") {
      const data = await recommendationService.getComplianceScore(recommendationId);
      return NextResponse.json(data); // { complianceScore, schemeName }
    }

    // 📌 If the request is for scheme details (optionally filtered by section)
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
      console.log("❌ Invalid section requested:", section);
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    // Return all scheme details (with compliance_score) if no type/section is specified
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
