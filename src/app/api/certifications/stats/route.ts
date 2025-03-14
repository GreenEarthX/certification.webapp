import { NextResponse } from "next/server";
import { getStats } from "@/services/stats/statsService";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching certification stats:", error);
    return NextResponse.json({ error: "Failed to fetch certification stats" }, { status: 500 });
  }
}
