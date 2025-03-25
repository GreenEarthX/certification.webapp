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
    const plant = await PlantRegistrationService.registerPlant(req);
    return NextResponse.json({ plant }, { status: 201 });
  } catch (error) {
    console.error("Plant registration error:", error);

    const errorMessage = (error as Error).message;

    return NextResponse.json(
      { error: errorMessage || "Registration failed" },
      { status: errorMessage === "User not found" || errorMessage === "Address not found" ? 404 : 500 }
    );
  }
}



export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await PlantRegistrationService.registerCertification(body);
    return NextResponse.json({ certification: result }, { status: 201 });
  } catch (error) {
    console.error("Certification registration error:", error);
    return NextResponse.json({ error: "Certification failed" }, { status: 500 });
  }
}

