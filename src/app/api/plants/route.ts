import { NextResponse } from "next/server";
import { getPlants } from "@/services/plants/plantService";

export async function GET() {
  try {
    const plants = await getPlants();
    return NextResponse.json(plants, { status: 200 });
  } catch (error) {
    console.error("Error fetching plant data:", error);
    return NextResponse.json({ error: "Failed to fetch plant data" }, { status: 500 });
  }
}
