// src/app/api/admin/test-gemini/route.ts
//
// DISABLED — 2026-08 security incident.
// Despite sitting under /api/admin/, this route had no authentication and
// forwarded an arbitrary caller-supplied prompt to Google Gemini using our
// paid GEMINI_API_KEY. That is a free, unmetered LLM proxy for anyone who
// finds it, billed to us.
//
// See src/lib/disabled-endpoint.ts for the re-enablement checklist.
// Previous implementation is in git history.

import { disabledEndpoint } from "@/lib/disabled-endpoint";

export async function POST() {
  return disabledEndpoint(
    "The Gemini test endpoint is suspended pending admin authentication and rate limiting."
  );
}
