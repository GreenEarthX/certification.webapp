// src/app/api/certifications/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { statsService } from "@/services/stats/statsService";

export async function GET(req: NextRequest) {
  try {
    const userSub = await getSessionUser(req);
    const stats = await statsService.getStats(userSub);
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching certification stats:", error);
    return NextResponse.json({ error: "Failed to fetch certification stats" }, { status: 500 });
  }
}
