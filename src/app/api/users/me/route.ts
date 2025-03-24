import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/users/userService";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth0Sub = await getSessionUser(req);
    const user = await UserService.getUserBySub(auth0Sub);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 });
  }
}
