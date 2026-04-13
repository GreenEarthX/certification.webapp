// src/services/plant-builder/digitalTwins.ts
"use client";

import { apiFetch } from "@/services/api-client";

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

const DIGITAL_TWINS_PATH = "/digital-twins";

export async function fetchDigitalTwins(
  plantId?: number
): Promise<DigitalTwinDto[]> {
  const query = plantId ? `?plantId=${plantId}` : "";
  return apiFetch<DigitalTwinDto[]>(`${DIGITAL_TWINS_PATH}${query}`);
}

export async function fetchDigitalTwinById(
  id: number
): Promise<DigitalTwinDto> {
  return apiFetch<DigitalTwinDto>(`${DIGITAL_TWINS_PATH}/${id}`);
}

export async function createDigitalTwin(
  payload: Partial<DigitalTwinDto>
): Promise<DigitalTwinDto> {
  return apiFetch<DigitalTwinDto>(DIGITAL_TWINS_PATH, {
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

export type DigitalTwinValidationError = {
  componentId: string;
  componentName: string;
  componentType: string;
  errorCode: string;
  errorMessage: string;
  relatedConnectionId?: string;
  relatedComponentId?: string;
};

export type DigitalTwinValidationResult = {
  valid: boolean;
  digitalTwinId: number;
  checkedAt: string;
  errors: DigitalTwinValidationError[];
};

export async function fetchDigitalTwinJsonForPlant(
  plantId: number
): Promise<DigitalTwinJsonRecord[]> {
  return apiFetch<DigitalTwinJsonRecord[]>(
    `${DIGITAL_TWINS_PATH}/digital-twin-json/plant/${plantId}`
  );
}

export async function validateDigitalTwinHighLevel(
  digitalTwinId: number
): Promise<DigitalTwinValidationResult> {
  return apiFetch<DigitalTwinValidationResult>(
    `${DIGITAL_TWINS_PATH}/${digitalTwinId}/validate-high-level`,
    { method: "POST" }
  );
}

export async function validateDigitalTwinPortConnections(
  digitalTwinId: number
): Promise<DigitalTwinValidationResult> {
  return apiFetch<DigitalTwinValidationResult>(
    `${DIGITAL_TWINS_PATH}/${digitalTwinId}/validate-ports`,
    { method: "POST" }
  );
}

// ─── Stream Units ─────────────────────────────────────────────────────────────

export type StreamUnitOption = {
  allowed_unit: string;
  factor_to_canonical: number | null;
  offset_to_canonical: number | null;
  requires_context: boolean;
  notes: string | null;
};

export type StreamInfo = {
  connection_id: string;
  from: string;
  to: string;
  carrier: { instance_id: string; name: string; carrier_id: string } | null;
  canonical_unit_family: string | null;
  canonical_unit: string | null;
  units: StreamUnitOption[];
  current_quantity: number | null;
  current_unit: string | null;
};

export type DigitalTwinStreamUnits = {
  digital_twin_id: number;
  streams: StreamInfo[];
};

export async function fetchDigitalTwinStreamUnits(
  digitalTwinId: number
): Promise<DigitalTwinStreamUnits> {
  return apiFetch<DigitalTwinStreamUnits>(
    `${DIGITAL_TWINS_PATH}/${digitalTwinId}/stream-units`
  );
}

export async function updateDigitalTwinConnectionData(
  digitalTwinId: number,
  connectionId: string,
  payload: { quantity: number; unit: string }
): Promise<{ id: string; from: string; to: string; data: Record<string, any> }> {
  return apiFetch(
    `${DIGITAL_TWINS_PATH}/${digitalTwinId}/connections/${connectionId}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
}

export async function convertDigitalTwinConnectionUnit(
  digitalTwinId: number,
  connectionId: string,
  payload: { from_unit: string; to_unit: string; value: number }
): Promise<{ converted_value: number; formula: string; [key: string]: any }> {
  return apiFetch(
    `${DIGITAL_TWINS_PATH}/${digitalTwinId}/connections/${connectionId}/convert`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}
