import { NextResponse } from "next/server";
import { coverageService } from "@/services/coverage/coverageService";

export async function GET() {
  try {
    const coverages = await coverageService.getAllCoverages();
    return NextResponse.json(coverages);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to load coverage data" }, { status: 500 });
  }
}
