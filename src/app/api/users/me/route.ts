import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/users/userService";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionUserId = await getSessionUser(req);
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await UserService.getUserBySub(sessionUserId);
    return user 
      ? NextResponse.json(user, { status: 200 })
      : NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching user:", error);
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
