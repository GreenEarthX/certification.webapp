import { NextResponse } from "next/server";
import { getPlants } from "@/services/plantDashboard/plants/plantService";

export async function GET() {
  try {
    const plants = await getPlants();
    return NextResponse.json(plants);
  } catch (error) {
    console.error("Error fetching plants:", error);
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 });
  }
}
