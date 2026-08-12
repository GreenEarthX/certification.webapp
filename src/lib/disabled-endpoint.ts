// src/lib/disabled-endpoint.ts
//
// Temporary kill-switch for endpoints taken offline during the 2026-08
// security incident response.
//
// These routes were reachable UNAUTHENTICATED and either spent real money
// (Hedera operator key), sent mail as us (Microsoft Graph), or proxied a paid
// API key. They are disabled until they are put behind real authentication,
// rate limiting and spend caps.
//
// To re-enable one: restore its handler from git history (the implementation
// is intact in the commit that introduced this file), then add
//   1. authentication via getSessionFullUser / requireRole
//   2. schema validation of the request body
//   3. a rate limit and, where funds are involved, a spend cap
//
// Grep for `disabledEndpoint` to find every route still switched off.

import { NextResponse } from "next/server";

export function disabledEndpoint(reason: string) {
  return NextResponse.json(
    {
      error: "This endpoint is temporarily disabled.",
      reason,
    },
    { status: 410 }
  );
}
