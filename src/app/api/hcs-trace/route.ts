// src/app/api/hcs-trace/route.ts
//
// DISABLED — 2026-08 security incident.
// This route submitted a message to our Hedera consensus topic signed with
// OPERATOR_PRIVATE_KEY, with setMaxTransactionFee(2 HBAR), and had no
// authentication whatsoever. Anyone on the internet could drain the operator
// account and write arbitrary entries to the topic.
//
// See src/lib/disabled-endpoint.ts for the re-enablement checklist.
// Previous implementation is in git history.

import { disabledEndpoint } from "@/lib/disabled-endpoint";

export async function POST() {
  return disabledEndpoint(
    "Hedera consensus writes are suspended pending authentication and spend caps."
  );
}
