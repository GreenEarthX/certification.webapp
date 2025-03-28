import {  NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth0sub = await getSessionUser(req);
    console.log("auth0sub:", auth0sub);

    if (!auth0sub) {
      return NextResponse.json({ needsCompletion: false });
    }

    const result = await pool.query(
      'SELECT first_name FROM users WHERE auth0sub = $1',
      [auth0sub]
    );

    const needsCompletion = !result.rows[0]?.first_name;
    return NextResponse.json({ needsCompletion });
  } catch (err) {
    console.error("check-profile error:", err);
    return NextResponse.json({ needsCompletion: false }, { status: 500 });
  }
}
