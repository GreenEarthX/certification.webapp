import { NextRequest, NextResponse } from "next/server";
import { PlantService } from "@/services/plantDashboard/plants/plantService";

export async function GET(req: NextRequest) {
  try {
    const plants = await PlantService.getUserPlants(req);
    return NextResponse.json(plants);
  } catch (error) {
    console.error("Error fetching plants:", error);
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 });
  }
}
