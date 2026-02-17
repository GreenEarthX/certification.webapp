// src/services/plant-builder/plants.ts
"use client";

import { apiFetch } from "@/services/api-client";

export type Plant = {
  id: number;            // FIX: should be number, not string
  name: string;
  location?: string | null;
  status?: string | null;
  metadata?: Record<string, any> | null;
};

const PLANTS_PATH = "/plants";

export async function fetchPlantsForCurrentUser(): Promise<Plant[]> {
  return apiFetch<Plant[]>(PLANTS_PATH);
}

export async function fetchPlantById(plantId: number): Promise<Plant> {
  return apiFetch<Plant>(`${PLANTS_PATH}/${plantId}`);
}

export async function createPlant(payload: {
  name: string;
  location?: string;
  status?: string;
  metadata?: Record<string, any>;
}): Promise<Plant> {
  return apiFetch<Plant>(PLANTS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePlant(
  plantId: number,
  payload: Partial<{
    name: string;
    location?: string;
    status?: string;
    metadata?: Record<string, any>;
  }>
): Promise<Plant> {
  return apiFetch<Plant>(`${PLANTS_PATH}/${plantId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
