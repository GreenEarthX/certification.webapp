// src/lib/api-auth.ts
//
// Maps the errors thrown by src/lib/auth.ts onto HTTP responses so every route
// reports authentication and authorization failures the same way.

import { NextResponse } from "next/server";

/**
 * Returns a 401/403 response if `error` came from an auth guard, otherwise
 * null so the caller can handle it as a normal server error.
 *
 * Usage:
 *   catch (err) {
 *     const denied = authErrorResponse(err);
 *     if (denied) return denied;
 *     // ...route-specific error handling
 *   }
 */
export function authErrorResponse(error: unknown): NextResponse | null {
  const message = error instanceof Error ? error.message : undefined;

  if (message === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (message === "Forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
