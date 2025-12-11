"use client";

import { apiFetch } from "./api-client";
import { getToken } from "@/lib/shared-auth";
import { decodeJwtPayload } from "@/lib/jwt";

export type BackendUser = {
  id: number;
  email: string;
  name?: string | null;
  company?: string | null;
  authid: string;
  created_at?: string;
  updated_at?: string;
};

let cachedUser: BackendUser | null = null;
let inflight: Promise<BackendUser> | null = null;

export function clearCachedBackendUser() {
  cachedUser = null;
  inflight = null;
}

export async function fetchCurrentBackendUser(): Promise<BackendUser> {
  if (cachedUser) return cachedUser;
  if (inflight) return inflight;

  const token = getToken();
  if (!token) {
    throw new Error("geomap-auth-token missing. Please sign in.");
  }

  const payload = decodeJwtPayload<{ userId?: string }>(token);
  if (!payload?.userId) {
    throw new Error("Session token missing user identifier.");
  }

  inflight = apiFetch<BackendUser>(`/users/authid/${payload.userId}`)
    .then((user) => {
      cachedUser = user;
      return user;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
