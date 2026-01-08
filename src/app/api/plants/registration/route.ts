import { NextRequest, NextResponse } from "next/server";
import { PlantRegistrationService } from "@/services/plant-registration/plantRegistrationService";
import { getSessionFullUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  
  try {
    const user = await getSessionFullUser(req);

    const data = await PlantRegistrationService.fetchFormData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch form data error:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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

    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: errorMessage || "Registration failed" },
      { status: errorMessage === "User not found" || errorMessage === "Address not found" ? 404 : 500 }
    );
  }
}
