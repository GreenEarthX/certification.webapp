"use client";

// Forces newly-signed-up users through /onboarding until the minimum
// (Personal Details + Organization Identity) is complete. Mounted next to
// <AuthGuard /> in the root layout (same Suspense boundary — do NOT move it, or
// AuthGuard's URL token capture races and login breaks).
//
// It renders a full-screen branded overlay ON TOP of the app while the onboarding
// status is being resolved for a gated route, so a not-yet-onboarded user never
// sees a flash of the dashboard/plant builder before being redirected. It never
// gates/wraps children — the overlay is purely visual.

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { getToken } from "@/lib/shared-auth";
import { getOnboardingStatus } from "@/services/onboarding/onboardingService";

// Paths that must never be gated (auth handoff, public pages, the flow itself).
const EXEMPT_PREFIXES = ["/onboarding", "/public", "/unauthorized"];
// Remembers a confirmed-complete check so returning users aren't covered each load.
const COMPLETE_KEY = "gex-onboarding-complete";

const isExempt = (pathname: string) =>
  EXEMPT_PREFIXES.some((p) => pathname.startsWith(p));

export default function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();
  // Seed from pathname only (stable SSR/client → no hydration mismatch). Gated
  // routes start covered so the app never paints before the check resolves.
  const [blocking, setBlocking] = useState(() => !isExempt(pathname));

  useEffect(() => {
    if (isExempt(pathname)) {
      setBlocking(false);
      return;
    }
    if (!getToken()) {
      setBlocking(false); // AuthGuard handles unauthenticated users.
      return;
    }
    // Fast path: already confirmed complete before — reveal immediately, re-verify
    // in the background.
    if (localStorage.getItem(COMPLETE_KEY) === "1") {
      setBlocking(false);
    }

    let active = true;
    (async () => {
      try {
        const status = await getOnboardingStatus();
        if (!active) return;
        if (status.complete) {
          localStorage.setItem(COMPLETE_KEY, "1");
          setBlocking(false);
        } else {
          localStorage.removeItem(COMPLETE_KEY);
          // Keep the overlay up through the redirect so the dashboard never shows;
          // it clears once pathname becomes the exempt /onboarding.
          router.replace("/onboarding");
        }
      } catch {
        // Don't hard-block the app if the status check fails; fail open.
        if (active) setBlocking(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!blocking) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <Image
          src="/logoGEX.png"
          alt="GreenEarthX"
          width={36}
          height={36}
          className="rounded-full"
        />
      </div>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#0F766E]" />
      <p className="text-sm text-slate-500">Loading your workspace…</p>
    </div>
  );
}
