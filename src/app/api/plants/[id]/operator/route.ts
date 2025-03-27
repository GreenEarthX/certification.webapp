import { NextRequest, NextResponse } from "next/server";
import { getOperatorByPlantId } from "@/services/plantRegistration/getOperatorByPlantId";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  const { id: plantId } = await context.params;
  try {
    const operatorId = await getOperatorByPlantId(plantId);
    return NextResponse.json({ operator_id: operatorId });
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.message === "Plant not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
