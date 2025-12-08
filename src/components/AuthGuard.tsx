// src/components/AuthGuard.tsx 
// This is the BRAIN of authentication in Certification app
// It runs ONCE per page load (client-side) and does 4 critical jobs

"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getToken, setTokens } from "@/lib/shared-auth";

// On déclare la fonction globale proprement
declare global {
  interface Window {
    handleGlobalLogout?: () => void;
  }
}

export default function AuthGuard() {
  const pathname = usePathname();   // Current URL path (e.g. /dashboard)
  const searchParams = useSearchParams();  // URL query params (?token=...)

  useEffect(() => {
    // ==================================================================
    // 1. HANDLE RETURN FROM ONBOARDING (first login or redirect back)
    // ==================================================================
    // When user logs in on localhost:3000, Onboarding redirects back with:
    // ?token=eyJhbGci...&refresh_token=eyJhbGci...
    const urlToken = searchParams.get("token");
    const urlRefresh = searchParams.get("refresh_token");

    if (urlToken && urlRefresh) {
      // Save tokens to localStorage so we have them on next visits
      setTokens(urlToken, urlRefresh);
      window.history.replaceState({}, "", pathname);
    }

    // ==================================================================
    // 2. GET CURRENT TOKEN (from localStorage or just saved from URL)
    // ==================================================================
    const token = getToken();

    // ==================================================================
    // 3. IF NO TOKEN → REDIRECT TO ONBOARDING LOGIN PAGE
    // ==================================================================
    // This prevents access to the app when not logged in
    // We allow /public and /unauthorized pages (for error pages)
    if (!token && !pathname.startsWith("/public") && !pathname.startsWith("/unauthorized")) {
      const redirectUrl = encodeURIComponent(window.location.href);
      window.location.href = `http://localhost:3000/auth/authenticate?redirect=${redirectUrl}`;
      return;
    }

    // 3. Monkey-patch fetch
    const originalFetch = window.fetch;
    window.fetch = async (input: any, init: any = {}) => {
      if (token && typeof input === "string" && input.startsWith("/api/")) {
        const headers = new Headers(init.headers || {});
        headers.set("x-auth-token", token);
        init = { ...init, headers };
      }
      return originalFetch(input, init);
    };

   
  }, [pathname, searchParams]);

  return null;
}