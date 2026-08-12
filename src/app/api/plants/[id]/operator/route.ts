import { NextRequest, NextResponse } from "next/server";
import { getOperatorByPlantId } from "@/services/plant-registration/getOperatorByPlantId";
import { getSessionUser } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Previously unauthenticated: operator ids were enumerable by plant id.
    // Authentication only - callers legitimately use this to discover who
    // operates a plant, so it is not scoped to the caller's own plants.
    await getSessionUser(req);

    const { id: plantId } = await context.params;
    const operatorId = await getOperatorByPlantId(plantId);
    return NextResponse.json({ operator_id: operatorId });
  } catch (error: any) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    console.error("Error:", error?.message);
    if (error?.message === "Plant not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
