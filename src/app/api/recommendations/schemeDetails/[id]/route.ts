import { NextResponse } from "next/server";
import { getSchemeDetailsByRecommendationId } from "@/services/recommendations/schemeDetailsService";

// Define the type for the scheme details
type SchemeDetails = {
  overview: string;
  requirements: string[];
  process: string[];
};

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id: recommendationId } = context.params;

  if (!recommendationId) {
    return NextResponse.json({ error: "Missing recommendation ID" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section"); // "overview", "requirements", "process"

  try {
    // Use the SchemeDetails type to define the return type of getSchemeDetailsByRecommendationId
    const data: SchemeDetails = await getSchemeDetailsByRecommendationId(recommendationId);

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

    console.log("❌ Invalid section requested");
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}