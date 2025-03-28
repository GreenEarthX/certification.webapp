import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { UserService } from "@/services/users/userService";

export async function GET(req: NextRequest) {
  try {
    const auth0Sub = await getSessionUser(req);

    if (!auth0Sub) {
      return NextResponse.json({ needsCompletion: false });
    }

    const needsCompletion = await UserService.needsProfileCompletion(auth0Sub);
    return NextResponse.json({ needsCompletion });
  } catch (err) {
    console.error("check-profile error:", err);
    return NextResponse.json({ needsCompletion: false }, { status: 500 });
  }
}
