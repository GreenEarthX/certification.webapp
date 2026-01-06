// src/components/AuthGuard.tsx 
// This is the BRAIN of authentication in Certification app
 
"use client";
 
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getToken, setTokens } from "@/lib/shared-auth";
 
declare global {
  interface Window {
    handleGlobalLogout?: () => void;
    __fetchPatched?: boolean;
  }
}
 
// ==================================================================
// PATCH FETCH IMMEDIATELY (outside component, runs on module load)
// ==================================================================
if (typeof window !== "undefined" && !window.__fetchPatched) {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const token = getToken(); // Get fresh token on each request
    if (token && typeof input === "string" && input.startsWith("/api/")) {
      const headers = new Headers(init.headers || {});
      headers.set("x-auth-token", token);
      init = { ...init, headers };
    }
    return originalFetch(input, init);
  };
  window.__fetchPatched = true;
  console.log("[AuthGuard] Fetch patched successfully");
}
 
export default function AuthGuard() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);
 
  useEffect(() => {
    // ==================================================================
    // 1. HANDLE RETURN FROM ONBOARDING (first login or redirect back)
    // ==================================================================
    const urlToken = searchParams.get("token");
    const urlRefresh = searchParams.get("refresh_token");
 
    if (urlToken && urlRefresh) {
      setTokens(urlToken, urlRefresh);
      window.history.replaceState({}, "", pathname);
    }
 
    // ==================================================================
    // 2. GET CURRENT TOKEN
    // ==================================================================
    const token = getToken();
 
    // ==================================================================
    // 3. IF NO TOKEN → REDIRECT TO ONBOARDING LOGIN PAGE
    // ==================================================================
    if (!token && !pathname.startsWith("/public") && !pathname.startsWith("/unauthorized")) {
      const redirectUrl = encodeURIComponent(window.location.href);
      const onboardingUrl = process.env.NEXT_PUBLIC_ONBOARDING_URL;
 
      if (!onboardingUrl) {
        console.error("NEXT_PUBLIC_ONBOARDING_URL is not defined");
        return;
      }
 
      window.location.href = `${onboardingUrl}/auth/authenticate?redirect=${redirectUrl}`;
      return;
    }
 
    setIsReady(true);
  }, [pathname, searchParams]);
 
  return null;
}