import { NextRequest, NextResponse } from "next/server";
import { PlantService } from "@/services/plant-dashboard/plants/plantService";

export async function GET(req: NextRequest) {
  try {
    const plants = await PlantService.getUserPlants(req);
    return NextResponse.json(plants);
  } catch (error) {
    console.error("Error fetching plants:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 });
  }
}
