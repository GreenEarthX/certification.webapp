// src/services/plant-builder/digitalTwins.ts
"use client";

import { apiFetch } from "../api-client";

export type DigitalTwinDto = {
  id: number;
  plant_id: number;
  name: string;
  version?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // you can add relations later if needed
};

export async function fetchDigitalTwins(plantId?: number): Promise<DigitalTwinDto[]> {
  const query = plantId ? `?plantId=${plantId}` : "";
  return apiFetch<DigitalTwinDto[]>(`/digital-twins${query}`);
}

export async function fetchDigitalTwinById(id: number): Promise<DigitalTwinDto> {
  return apiFetch<DigitalTwinDto>(`/digital-twins/${id}`);
}

export async function createDigitalTwin(payload: Partial<DigitalTwinDto>): Promise<DigitalTwinDto> {
  return apiFetch<DigitalTwinDto>("/digital-twins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* 🔹 NEW: digital-twin-json per plant 🔹 */

export type DigitalTwinJson = {
  components: {
    id: string | number;
    name: string;
    type: "equipment" | "carrier" | "gate" | string;
    category: string;
    position: { x: number; y: number };
    data?: any;
  }[];
  connections: {
    id: string | number;
    from: string | number;
    to: string | number;
    data?: any;
    type?: string;
    reason?: string;
  }[];
};

export type DigitalTwinJsonRecord = {
  id: string;
  digital_twin_json: DigitalTwinJson;
};

export async function fetchDigitalTwinJsonForPlant(
  plantId: number
): Promise<DigitalTwinJsonRecord[]> {
  return apiFetch<DigitalTwinJsonRecord[]>(
    `/digital-twins/digital-twin-json/plant/${plantId}`
  );
}
