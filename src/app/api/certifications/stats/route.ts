import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { statsService } from "@/services/stats/statsService";


export async function GET(req: NextRequest) {
  try {
    // Validate session and get the user information
    const userSub = await getSessionUser(req);

    if (!userSub) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch stats based on plantId parameter or general stats
    const plantIdParam = req.nextUrl.searchParams.get("plantId");

    const stats = plantIdParam
      ? await statsService.getStatsByPlant(userSub, Number(plantIdParam))
      : await statsService.getStats(userSub);

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching certification stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch certification stats" },
      { status: 500 }
    );
  }
}
