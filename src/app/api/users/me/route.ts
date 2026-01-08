import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/users/userService";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth0User = await getSessionUser(req);
    if (!auth0User) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Auth0 User:", auth0User);
    const user = await UserService.getUserBySub(auth0User);
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
