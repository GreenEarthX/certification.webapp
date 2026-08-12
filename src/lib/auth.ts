// src/lib/auth.ts
//
// Server-side session extraction from the JWT issued by the onboarding app.
//
// SECURITY: this module previously base64-decoded the JWT payload and trusted
// it WITHOUT VERIFYING THE SIGNATURE, which let anyone forge any identity
// (including role/permissions) with a hand-crafted header. It now performs a
// real `jwt.verify`. See the 2026-08 incident review.
//
// Token contract (issued by onboarding: src/app/lib/jwt.ts):
//   secret     GEOMAP_JWT_SECRET   algorithm HS256
//   issuer     "onboarding-app"    audience  "geomap-app"
//   payload    { userId, email, verified, permissions[], name, role, type }
//   role       "PLANT_OPERATOR" | "ADMIN"   (Prisma enum Role)
//   type       "access" (1h) | "refresh" (7d)

import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_ISSUER = "onboarding-app";
const JWT_AUDIENCE = "geomap-app";

/** Thrown for any authentication failure. Routes map this message to a 401. */
const UNAUTHORIZED = "Unauthorized";
/** Thrown when authenticated but not permitted. Routes map this to a 403. */
const FORBIDDEN = "Forbidden";

export interface SessionUser {
  userId: string;
  sub: string;
  email?: string;
  name?: string;
  role: string;
  permissions: string[];
  verified: boolean;
}

interface TokenPayload extends jwt.JwtPayload {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  verified?: boolean;
  type?: "access" | "refresh";
}

/**
 * Reads the bearer token. Accepts the standard `Authorization: Bearer <t>`
 * header and the `x-auth-token` header that the patched client-side fetch in
 * AuthGuard.tsx sends. Both are verified identically below.
 */
function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  const legacy = req.headers.get("x-auth-token")?.trim();
  if (legacy) return legacy;

  return null;
}

/**
 * Verifies signature, issuer, audience and expiry. Fails closed.
 *
 * `algorithms` is pinned to HS256 so a token presented as `alg: none` or as an
 * asymmetric algorithm cannot bypass verification.
 */
function verifyToken(token: string): TokenPayload {
  const secret = process.env.GEOMAP_JWT_SECRET;
  if (!secret) {
    // Fail closed rather than silently accepting unverified tokens.
    console.error(
      "[auth] GEOMAP_JWT_SECRET is not set - refusing to authenticate any request."
    );
    throw new Error(UNAUTHORIZED);
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as TokenPayload;
  } catch {
    // Covers bad signature, wrong issuer/audience, and expired tokens.
    throw new Error(UNAUTHORIZED);
  }

  // A refresh token must never be accepted as an access token. Tokens with no
  // `type` claim predate the access/refresh split and are still accepted.
  if (payload.type === "refresh") {
    throw new Error(UNAUTHORIZED);
  }

  if (!payload.userId) {
    throw new Error(UNAUTHORIZED);
  }

  return payload;
}

/** Returns the authenticated user's id, or throws `Unauthorized`. */
export async function getSessionUser(req: NextRequest): Promise<string> {
  const token = extractToken(req);
  if (!token) throw new Error(UNAUTHORIZED);

  return verifyToken(token).userId as string;
}

/** Returns the full verified session, or throws `Unauthorized`. */
export async function getSessionFullUser(req: NextRequest): Promise<SessionUser> {
  const token = extractToken(req);
  if (!token) throw new Error(UNAUTHORIZED);

  const payload = verifyToken(token);

  return {
    userId: payload.userId as string,
    sub: payload.userId as string,
    email: payload.email,
    name: payload.name,
    role: payload.role || "PLANT_OPERATOR",
    permissions: payload.permissions || [],
    verified: payload.verified ?? false,
  };
}

/**
 * Capability grants from the token (`read` / `edit`).
 * NOTE: these are capabilities, not roles - use `requireRole` for role checks.
 */
export function getUserPermissions(user: SessionUser): string[] {
  return user?.permissions || [];
}

/** Throws `Forbidden` unless the user holds one of `allowedRoles`. */
export function requireRole(user: SessionUser, allowedRoles: string[]) {
  const role = (user?.role || "").toUpperCase();
  const allowed = allowedRoles.map((r) => r.toUpperCase());

  if (!role || !allowed.includes(role)) {
    throw new Error(FORBIDDEN);
  }
}

/** Throws `Forbidden` unless the user is an ADMIN. */
export function requireAdmin(user: SessionUser) {
  requireRole(user, ["ADMIN"]);
}

/** Throws `Forbidden` unless the user holds the given capability. */
export function requirePermission(user: SessionUser, permission: string) {
  if (!getUserPermissions(user).includes(permission)) {
    throw new Error(FORBIDDEN);
  }
}

/** Convenience: authenticate and require ADMIN in one step. */
export async function requireAdminUser(req: NextRequest): Promise<SessionUser> {
  const user = await getSessionFullUser(req);
  requireAdmin(user);
  return user;
}
