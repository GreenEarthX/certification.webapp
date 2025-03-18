import { NextRequest, NextResponse } from "next/server";
import { getCertifications } from "@/services/plantDashboard/certifications/list/certificationListService";

export async function GET(req: NextRequest) {
  console.log("🚀 API route /api/plantDashboard/certifications/list called!"); 
  const { searchParams } = new URL(req.url);
  const plantId = searchParams.get("plantId");

  if (!plantId) {
    return NextResponse.json({ error: "Missing plant ID" }, { status: 400 });
  }

  try {
    const certifications = await getCertifications(plantId);
    console.log("Fetched Certifications:", certifications); // Debugging line
    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
  }
}
