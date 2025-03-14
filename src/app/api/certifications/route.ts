import { NextResponse } from "next/server";
import { getCertifications } from "@/services/certifications/certificationService";

export async function GET() {
  try {
    const certifications = await getCertifications();
    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
