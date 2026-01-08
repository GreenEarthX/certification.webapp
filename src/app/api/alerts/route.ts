import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { alertService } from "@/services/alerts/alertService";

export async function GET(req: NextRequest) {
  try {
    const userSub = await getSessionUser(req);
    const alerts = await alertService.getAlerts(userSub);
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
