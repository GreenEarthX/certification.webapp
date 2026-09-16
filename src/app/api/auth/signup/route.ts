import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/users/userService";
import { getSessionFullUser } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    // Previously this accepted `email` and `auth0Sub` from the request body
    // with no authentication, so anyone could pre-create a user row under an
    // arbitrary auth0Sub and claim an identity before the real user signed up.
    //
    // Both values now come from the verified token. The body is ignored.
    // The existing caller (src/app/post-signup/page.tsx) already sent its own
    // session values, so this is behaviourally identical for real users.
    const user = await getSessionFullUser(req);

    if (!user.email) {
      return NextResponse.json(
        { error: "Token is missing an email claim" },
        { status: 400 }
      );
    }

    const existingUser = await UserService.getUserBySub(user.userId);
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    const newUser = await UserService.createUser(user.email, user.userId);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    console.error("Error in Signup Callback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
