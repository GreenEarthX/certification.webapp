"use client";

// Forces newly-signed-up users through /onboarding until the minimum
// (Personal Details + Organization Identity) is complete. Mounted next to
// <AuthGuard /> in the root layout; runs only when an auth token is present.

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/shared-auth";
import { getOnboardingStatus } from "@/services/onboarding/onboardingService";

// Paths that must never be gated (auth handoff, public pages, the flow itself).
const EXEMPT_PREFIXES = ["/onboarding", "/public", "/unauthorized"];

export default function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return;
    if (!getToken()) return; // AuthGuard handles unauthenticated users.

    let active = true;
    (async () => {
      try {
        const status = await getOnboardingStatus();
        if (active && !status.complete) {
          router.replace("/onboarding");
        }
      } catch {
        // Don't block the app if the status check fails; fail open.
      }
    })();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  return null;
}
