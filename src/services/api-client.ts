"use client";

import {
  clearTokens,
  getRefreshToken,
  getToken,
  setTokens,
} from "@/lib/shared-auth";

// Backends reading bearers live on CERT_API; tokens are minted by onboarding app.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_CERT_API_URL ?? "http://localhost:5000";
const AUTH_APP_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_APP_URL ?? "http://localhost:3000";
const REFRESH_ENDPOINT = `${AUTH_APP_BASE_URL}/api/auth/refresh-token`;

// Deduplicate concurrent refreshes so only one network call runs at a time.
let refreshPromise: Promise<string | null> | null = null;

// Ask onboarding for a new access token using the saved refresh token.
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn("[apiFetch] No refresh token available to renew session.");
    return null;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(REFRESH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      if (!res.ok) {
        console.error(
          `[apiFetch] Refresh request failed: ${res.status} ${res.statusText}`
        );
        clearTokens();
        return null;
      }

      const data = (await res.json().catch(() => null)) as
        | { accessToken?: string; refreshToken?: string }
        | null;

      if (!data?.accessToken || !data?.refreshToken) {
        console.error("[apiFetch] Refresh endpoint returned invalid payload.");
        clearTokens();
        return null;
      }

      setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch (err) {
      console.error("[apiFetch] Error refreshing token:", err);
      clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Single entry point for every backend request (handles auth + retries).
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Get token from shared auth store
  let token = getToken();

  if (!token) {
    console.error(
      "[apiFetch] No authentication token found. User may not be logged in."
    );
    throw new Error("Not authenticated. Please log in first.");
  }

  try {
    const url = `${API_BASE_URL}${path}`;
    let hasRetried = false;

    while (true) {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const rawBody = await res.text().catch(() => "");
      const contentType = res.headers.get("content-type") || "";

      // ✅ Success
      if (res.ok) {
        if (!rawBody) {
          return undefined as T;
        }

        if (contentType.includes("application/json")) {
          try {
            return JSON.parse(rawBody) as T;
          } catch (parseErr) {
            console.error(
              `[apiFetch] Failed to parse JSON response from ${path}:`,
              parseErr
            );
            throw new Error("Received malformed JSON from server.");
          }
        }

        return rawBody as unknown as T;
      }

      if (res.status === 401 && !hasRetried) {
        const newToken = await refreshAccessToken();
        hasRetried = true;
        if (newToken) {
          token = newToken;
          continue;
        }
      }

      // ❌ Handle specific HTTP error statuses
      const errorBody = rawBody;

      switch (res.status) {
        case 400:
          console.error(`[apiFetch] 400 Bad Request on ${path}:`, errorBody);
          throw new Error("Invalid request. Please check your input.");

        case 401:
          console.error(
            `[apiFetch] 401 Unauthorized on ${path}. Token may be invalid or expired.`
          );
          throw new Error(
            "Session expired or token invalid. Please log in again."
          );

        case 403:
          console.error(
            `[apiFetch] 403 Forbidden on ${path}. User lacks permission.`
          );
          throw new Error(
            "You don't have permission to access this resource."
          );

        case 404:
          console.error(`[apiFetch] 404 Not Found: ${path}`);
          throw new Error(`Resource not found: ${path}`);

        case 409:
          console.error(`[apiFetch] 409 Conflict on ${path}:`, errorBody);
          throw new Error(
            "Resource conflict. Please refresh and try again."
          );

        case 422:
          console.error(
            `[apiFetch] 422 Unprocessable Entity on ${path}:`,
            errorBody
          );
          throw new Error("Validation error. Please check your data.");

        default:
          if (res.status >= 500) {
            console.error(
              `[apiFetch] ${res.status} Server error on ${path}:`,
              errorBody
            );
            throw new Error(
              `Server error (${res.status}). Please try again later.`
            );
          }

          console.error(
            `[apiFetch] ${res.status} ${res.statusText} on ${path}:`,
            {
              url,
              status: res.status,
              statusText: res.statusText,
              body: errorBody,
            }
          );
          throw new Error(
            `API request failed: ${res.status} ${res.statusText}`
          );
      }
    }
  } catch (err) {
    // Network errors
    if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
      console.error(
        `[apiFetch] Network error calling ${API_BASE_URL}${path}. Backend may be unreachable.`
      );
      throw new Error(
        `Network error. Check that the backend is running at ${API_BASE_URL}`
      );
    }

    // Re-throw any already formatted errors
    if (err instanceof Error) {
      throw err;
    }

    // Unknown error
    console.error("[apiFetch] Unknown error:", err);
    throw new Error("An unexpected error occurred. Please try again.");
  }
}
