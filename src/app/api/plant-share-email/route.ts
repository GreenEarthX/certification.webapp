// src/app/api/plant-share-email/route.ts
//
// DISABLED — 2026-08 security incident.
// This route sent mail through our Microsoft Graph account to an
// attacker-controlled `toEmail`, with no authentication and with
// `displaySharer` / `sharedByEmail` / `plantName` / `toName` interpolated
// UNESCAPED into the HTML body. That is an open relay that will send phishing
// signed by our own domain's DKIM.
//
// Before re-enabling: authenticate the caller, validate + HTML-escape every
// interpolated field, and rate limit per user.
//
// See src/lib/disabled-endpoint.ts for the re-enablement checklist.
// Previous implementation is in git history.

import { disabledEndpoint } from "@/lib/disabled-endpoint";

export const runtime = "nodejs";

export async function POST() {
  return disabledEndpoint(
    "Plant sharing by email is suspended pending authentication and template escaping."
  );
}
