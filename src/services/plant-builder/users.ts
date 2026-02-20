"use client";

import { apiFetch } from "@/services/api-client";

export type BackendUserSummary = {
  id: number;
  email: string;
  name?: string | null;
  company?: string | null;
};

const USERS_PATH = "/users";

export async function fetchAllBackendUsers(): Promise<BackendUserSummary[]> {
  return apiFetch<BackendUserSummary[]>(USERS_PATH);
}
