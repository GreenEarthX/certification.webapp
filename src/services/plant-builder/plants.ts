// src/services/plant-builder/plants.ts
"use client";

import { apiFetch } from "./client";

export type Plant = {
  id: number;            // FIX: should be number, not string
  name: string;
  location?: string | null;
  status?: string | null;
  metadata?: Record<string, any> | null;
};

type UserWithPlantsResponse = {
  id: string;
  email: string;
  name?: string;
  plants?: Plant[];
};

const DEFAULT_USER_ID = "1";

export async function fetchPlantsForCurrentUser(): Promise<Plant[]> {
  const data = await apiFetch<UserWithPlantsResponse>(`/users/${DEFAULT_USER_ID}`);
  return data.plants || [];
}

export async function createPlant(payload: {
  name: string;
  user_id: number;
  location?: string;
  status?: string;
  metadata?: Record<string, any>;
}): Promise<Plant> {
  return apiFetch<Plant>("/plants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
