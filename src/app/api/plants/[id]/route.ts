import { NextRequest, NextResponse } from "next/server";
import { plantService } from "@/services/plants/plantService";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const userSub = await getSessionUser(req);
    const plantId = parseInt(context.params.id);

    if (isNaN(plantId)) {
      return NextResponse.json({ error: "Invalid plant ID" }, { status: 400 });
    }

    await plantService.deletePlantById(userSub, plantId);
    return NextResponse.json({ message: "Plant deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting plant:", error);
    return NextResponse.json({ error: "Failed to delete plant" }, { status: 500 });
  }
}
