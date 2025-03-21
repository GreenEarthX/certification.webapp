import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth"; 
import { plantService } from "@/services/plants/plantService";

export async function GET(req: NextRequest) {
  try {
    const userSub = await getSessionUser(req);
    const plants = await plantService.getPlants(userSub);

    return NextResponse.json(plants, { status: 200 });
  } catch (error) {
    console.error("Error fetching plant data:", error);

    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Failed to fetch plant data" }, { status: 500 });
  }
}
