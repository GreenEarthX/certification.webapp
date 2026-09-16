// src/app/api/mint-nft/route.ts
//
// DISABLED — 2026-08 security incident.
// This route minted Hedera NFTs using the server's operator key and uploaded
// attacker-supplied files to Pinata/IPFS, with no authentication, no file size
// limit and no content validation. Anyone on the internet could mint against
// our token IDs and burn HBAR.
//
// See src/lib/disabled-endpoint.ts for the re-enablement checklist.
// Previous implementation is in git history.

import { disabledEndpoint } from "@/lib/disabled-endpoint";

export async function POST() {
  return disabledEndpoint(
    "NFT minting is suspended pending authentication, upload limits and spend caps."
  );
}
