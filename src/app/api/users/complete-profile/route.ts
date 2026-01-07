import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getSessionFullUser } from "@/lib/auth";
import { UserService } from "@/services/users/userService";

export async function POST(req: NextRequest) {
  try {
    const auth0Sub = await getSessionUser(req);
    const fullUser = await getSessionFullUser(req); // to get the email
    const body = await req.json();

    // 🔍 Check if user already exists
    const existingUser = await UserService.getUserBySub(auth0Sub);
    if (!existingUser) {
      console.log("Registering user before completing profile:", fullUser.email, auth0Sub);
      await UserService.createUser(fullUser.email, auth0Sub);
    }

    // ✅ Proceed to complete profile
    await UserService.completeUserProfile(auth0Sub, body);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("complete-profile error:", err);
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to complete profile" }, { status: 500 });
  }
}
