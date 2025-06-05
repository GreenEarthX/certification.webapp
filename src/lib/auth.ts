import { getSession } from "@auth0/nextjs-auth0/edge";
import { initAuth0 } from "@auth0/nextjs-auth0/edge";
import { NextRequest,NextResponse } from "next/server";

const ROLE_NAMESPACE = "https://your-app.com/roles";


export async function getSessionUser(req: NextRequest) {
  const session = await getSession(req, NextResponse.next());

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return session.user.sub;
}


export async function getSessionFullUser(req: NextRequest) {
  const res = new NextResponse(); // ✅ Add this
  const session = await getSession(req, res); // ✅ Pass both req and res

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

// ✅ Extract roles from user
export function getUserRoles(user: any): string[] {
  return user?.[ROLE_NAMESPACE] || [];
}

// ✅ Enforce required roles
export function requireRole(user: any, allowedRoles: string[]) {
  const roles = getUserRoles(user);
  const hasAccess = allowedRoles.some((r) => roles.includes(r));
  if (!hasAccess) throw new Error("Forbidden");
}

