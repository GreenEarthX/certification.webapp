import { getSession } from "@auth0/nextjs-auth0/edge";
import { NextRequest, NextResponse } from "next/server";

export async function getSessionUser(req: NextRequest) {
  const session = await getSession(req, NextResponse.next());

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return session.user.sub;
}
