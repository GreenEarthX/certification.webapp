import { NextRequest, NextResponse } from "next/server";
import { PlantRegistrationService } from "@/services/plantRegistration/plantRegistrationService";

export async function GET() {
  try {
    const data = await PlantRegistrationService.fetchFormData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch form data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plant = await PlantRegistrationService.registerPlant(req, body);
    return NextResponse.json({ plant }, { status: 201 });
  } catch (error) {
    console.error("Plant registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}