// src/lib/auth.ts  

import { NextRequest } from "next/server";

const decodeJwt = (token: string): any => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export async function getSessionUser(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.slice(7);
  const payload = decodeJwt(token);

  if (!payload?.userId) {
    throw new Error("Unauthorized");
  }

  return payload.userId as string;
}

export async function getSessionFullUser(req: NextRequest): Promise<any> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

  const token = authHeader.slice(7);
  const payload = decodeJwt(token);
  if (!payload) throw new Error("Unauthorized");

  return {
    userId: payload.userId,
    sub: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role || "user",
    permissions: payload.permissions || [],
    verified: payload.verified ?? false,
  };
}

export function getUserRoles(user: any): string[] {
  return user?.permissions || [];
}

export function requireRole(user: any, allowedRoles: string[]) {
  const hasRole = allowedRoles.some((r: string) => getUserRoles(user).includes(r));
  if (!hasRole) throw new Error("Forbidden");
}