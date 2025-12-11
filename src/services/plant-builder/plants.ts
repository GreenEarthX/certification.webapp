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

export async function fetchPlantsForCurrentUser(): Promise<Plant[]> {
  return apiFetch<Plant[]>("/plants");
}

export async function createPlant(payload: {
  name: string;
  location?: string;
  status?: string;
  metadata?: Record<string, any>;
}): Promise<Plant> {
  return apiFetch<Plant>("/plants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
