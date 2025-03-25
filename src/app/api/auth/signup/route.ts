import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/users/userService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, auth0Sub } = body;

    // Validate the input
    if (!email || !auth0Sub) {
      return NextResponse.json({ error: "Missing email or auth0Sub" }, { status: 400 });
    }

    // Ensure the user doesn't exist before creating
    const existingUser = await UserService.getUserBySub(auth0Sub);
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    // Create user in DB
    const newUser = await UserService.createUser(email, auth0Sub);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error in Signup Callback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}