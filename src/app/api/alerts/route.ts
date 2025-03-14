import { NextResponse } from "next/server";
import { getAlerts } from "@/services/alerts/alertService";

export async function GET() {
  try {
    const alerts = await getAlerts(); 
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch alerts"}), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
