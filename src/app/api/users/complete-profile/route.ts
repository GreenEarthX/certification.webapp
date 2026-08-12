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
      // The email comes from the verified token; refuse to create a user
      // without one rather than inserting an empty/undefined address.
      if (!fullUser.email) {
        return NextResponse.json(
          { error: "Token is missing an email claim" },
          { status: 400 }
        );
      }
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
