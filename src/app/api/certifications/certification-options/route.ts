import { NextResponse } from "next/server";
import { certificationService } from "@/services/certifications/certificationService";

export async function GET() {
  try {
    const options = await certificationService.fetchCertificationOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("❌ Error fetching certification options:", error);
    return NextResponse.json(
      { error: "Failed to fetch options" },
      { status: 500 }
    );
  }
}