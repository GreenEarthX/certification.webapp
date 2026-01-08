// src/components/AuthGuard.tsx 
// This is the BRAIN of authentication in Certification app
 
"use client";
 
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  clearTokens,
  getRefreshToken,
  getToken,
  setTokens,
} from "@/lib/shared-auth";
 
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
  const REFRESH_ENDPOINT = "/api/auth/refresh-token";
  let refreshPromise: Promise<string | null> | null = null;

  const getRequestUrl = (input: RequestInfo | URL) => {
    try {
      if (typeof input === "string") {
        return new URL(input, window.location.origin);
      }
      if (input instanceof URL) return input;
      if (input instanceof Request) return new URL(input.url);
    } catch {
      return null;
    }
    return null;
  };

  const isApiRequest = (input: RequestInfo | URL) => {
    const url = getRequestUrl(input);
    if (!url) return { isApi: false, isAuthRoute: false, url: null };
    const isApi = url.origin === window.location.origin && url.pathname.startsWith("/api/");
    const isAuthRoute = isApi && url.pathname.startsWith("/api/auth/");
    return { isApi, isAuthRoute, url };
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!REFRESH_ENDPOINT) {
      console.warn("[AuthGuard] Refresh endpoint not configured.");
      return null;
    }

    if (refreshPromise) {
      return refreshPromise;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.warn("[AuthGuard] No refresh token available to renew session.");
      return null;
    }

    refreshPromise = (async () => {
      try {
        const res = await originalFetch(REFRESH_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
        });

        if (!res.ok) {
          console.error(
            `[AuthGuard] Refresh request failed: ${res.status} ${res.statusText}`
          );
          clearTokens();
          return null;
        }

        const data = (await res.json().catch(() => null)) as
          | { accessToken?: string; refreshToken?: string }
          | null;

        if (!data?.accessToken || !data?.refreshToken) {
          console.error("[AuthGuard] Refresh endpoint returned invalid payload.");
          clearTokens();
          return null;
        }

        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      } catch (err) {
        console.error("[AuthGuard] Error refreshing token:", err);
        clearTokens();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const token = getToken();
    const { isApi, isAuthRoute, url } = isApiRequest(input);

    const headers = new Headers(
      init.headers || (input instanceof Request ? input.headers : undefined)
    );
    if (token && isApi && !isAuthRoute) {
      headers.set("x-auth-token", token);
    }

    const requestInit = { ...init, headers };
    const firstInput = input instanceof Request ? input.clone() : input;
    const retryInput = input instanceof Request ? input.clone() : input;

    let res = await originalFetch(firstInput, requestInit);

    if (
      res.status === 401 &&
      isApi &&
      !isAuthRoute &&
      (!url || url.href !== REFRESH_ENDPOINT)
    ) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retryHeaders = new Headers(requestInit.headers);
        retryHeaders.set("x-auth-token", newToken);
        res = await originalFetch(retryInput, {
          ...requestInit,
          headers: retryHeaders,
        });
      }
    }

    return res;
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
