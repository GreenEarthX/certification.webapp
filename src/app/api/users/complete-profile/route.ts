import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { UserService } from "@/services/users/userService";

export async function POST(req: NextRequest) {
  try {
    const auth0Sub = await getSessionUser(req);
    const body = await req.json();

    await UserService.completeUserProfile(auth0Sub, body);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("complete-profile error:", err);
    return NextResponse.json({ error: "Failed to complete profile" }, { status: 500 });
  }
}
