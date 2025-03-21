import { NextResponse } from "next/server";
import { fetchPlantData } from "@/services/plantRegistration/getPlantDataService";

export async function GET() {
  try {
    const data = await fetchPlantData();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
