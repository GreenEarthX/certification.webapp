// src/services/plant-builder/plants.ts
"use client";

import { apiFetch } from "@/services/api-client";

export type FuelEntry = {
  fuel_type: string;
  capacity?: number;
  capacity_unit?: string;
};

export type PlantAddress = {
  street?: string;
  region?: string;
  city?: string;
  postal_code?: string;
};

export type Plant = {
  id: number;            // FIX: should be number, not string
  name: string;
  location?: string | null;
  status?: string | null;
  pathway?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  publish_to_ecosystem?: boolean | null;
  address?: PlantAddress | null;
  fuels?: FuelEntry[] | null;
  archived_at?: string | null;
  active?: boolean | null;
  metadata?: Record<string, any> | null;
};

export type PlantPayload = {
  name: string;
  location?: string;
  status?: string;
  pathway?: string;
  latitude?: number;
  longitude?: number;
  publish_to_ecosystem?: boolean;
  address?: PlantAddress;
  fuels?: FuelEntry[];
  metadata?: Record<string, any>;
};

// Shared form shape used by the New Plant wizard and the edit form.
export type PlantFuelRow = {
  fuel_type: string;
  capacity: string;
  capacity_unit: string;
};

export type PlantFormValues = {
  plantName: string;
  pathway: string;
  plantConfiguration: string;
  siteEnvironment: string;
  country: string;
  region: string;
  city: string;
  postalCode: string;
  street: string;
  latitude: string;
  longitude: string;
  publishToEcosystem: boolean;
  maturityStage: string;
  certificationPhase: string;
  commercialOperationDate: string;
  projectLifetimeYears: string;
  fuels: PlantFuelRow[];
};

const trimOrUndefined = (v?: string) => {
  const t = (v ?? "").trim();
  return t ? t : undefined;
};

const toNumberOrUndefined = (v?: string) => {
  const t = (v ?? "").trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Map the wizard/edit form state to the backend payload, applying the
 * column-vs-jsonb split: scalar columns, a structured `address` object,
 * a `fuels` array (0..many), and loose descriptive scalars in `metadata`.
 */
export function buildPlantPayload(form: PlantFormValues): PlantPayload {
  const address: PlantAddress = {
    street: trimOrUndefined(form.street),
    region: trimOrUndefined(form.region),
    city: trimOrUndefined(form.city),
    postal_code: trimOrUndefined(form.postalCode),
  };

  const fuels: FuelEntry[] = (form.fuels || [])
    .filter((row) => row.fuel_type)
    .map((row) => ({
      fuel_type: row.fuel_type,
      capacity: toNumberOrUndefined(row.capacity),
      capacity_unit: trimOrUndefined(row.capacity_unit),
    }));

  const metadata: Record<string, any> = {
    plant_configuration: trimOrUndefined(form.plantConfiguration),
    site_environment: trimOrUndefined(form.siteEnvironment),
    certification_phase: trimOrUndefined(form.certificationPhase),
    commercial_operation_date: trimOrUndefined(form.commercialOperationDate),
    project_lifetime_years: toNumberOrUndefined(form.projectLifetimeYears),
  };

  return {
    name: form.plantName.trim(),
    location: trimOrUndefined(form.country),
    status: trimOrUndefined(form.maturityStage),
    pathway: trimOrUndefined(form.pathway),
    latitude: toNumberOrUndefined(form.latitude),
    longitude: toNumberOrUndefined(form.longitude),
    publish_to_ecosystem: form.publishToEcosystem,
    address,
    fuels,
    metadata,
  };
}

export type PlantUser = {
  id: number;
  email: string;
  name?: string | null;
  company?: string | null;
};

const PLANTS_PATH = "/plants";

export async function fetchPlantsForCurrentUser(): Promise<Plant[]> {
  return apiFetch<Plant[]>(PLANTS_PATH);
}

export async function fetchArchivedPlantsForCurrentUser(): Promise<Plant[]> {
  return apiFetch<Plant[]>(`${PLANTS_PATH}/archived`);
}

export async function fetchPlantById(plantId: number): Promise<Plant> {
  return apiFetch<Plant>(`${PLANTS_PATH}/${plantId}`);
}

export async function fetchPlantUsers(plantId: number): Promise<PlantUser[]> {
  return apiFetch<PlantUser[]>(`${PLANTS_PATH}/${plantId}/users`);
}

export async function createPlant(payload: PlantPayload): Promise<Plant> {
  return apiFetch<Plant>(PLANTS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePlant(
  plantId: number,
  payload: Partial<PlantPayload>
): Promise<Plant> {
  return apiFetch<Plant>(`${PLANTS_PATH}/${plantId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function archivePlant(plantId: number): Promise<void> {
  await apiFetch<void>(`${PLANTS_PATH}/${plantId}/archive`, {
    method: "PATCH",
  });
}

export async function unarchivePlant(plantId: number): Promise<void> {
  await apiFetch<void>(`${PLANTS_PATH}/${plantId}/unarchive`, {
    method: "PATCH",
  });
}

export async function deactivatePlant(plantId: number): Promise<void> {
  await apiFetch<void>(`${PLANTS_PATH}/${plantId}/deactivate`, {
    method: "PATCH",
  });
}

export async function addUserToPlant(plantId: number, userId: number): Promise<void> {
  await apiFetch<void>(`${PLANTS_PATH}/${plantId}/users`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}
