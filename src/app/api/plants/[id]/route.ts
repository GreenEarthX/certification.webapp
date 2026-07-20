import { NextRequest, NextResponse } from "next/server";
import { plantService } from "@/services/plants/plantService";
import { getSessionUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Plant ID is required" },
      { status: 400 }
    );
  }

  try {
    const userSub = await getSessionUser(req);
    const plantId = parseInt(id);

    if (isNaN(plantId)) {
      return NextResponse.json({ error: "Invalid plant ID" }, { status: 400 });
    }

    await plantService.deletePlantById(userSub, plantId);
    return NextResponse.json(
      { message: "Plant deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting plant:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete plant" },
      { status: 500 }
    );
  }
}
