// src/services/plant-builder/unitFamilies.ts
"use client";

import { apiFetch } from "@/services/api-client";

export type UnitFamilyRow = {
  id: number;
  unit_family: string;
  canonical_unit: string;
  allowed_unit: string;
  factor_to_canonical: number | null;
  offset_to_canonical: number | null;
  requires_context: boolean;
  notes: string | null;
};

export type UnitConversionResult = {
  unit_family: string;
  canonical_unit: string;
  from_unit: string;
  to_unit: string;
  input_value: number;
  converted_value: number;
  formula: string;
};

const STREAM_DICTIONARY_PATH = "/stream-dictionary";

/** Fetch all allowed units for a given unit family (e.g., "PRESSURE_GAUGE"). */
export async function fetchUnitFamilyOptions(
  familyName: string
): Promise<UnitFamilyRow[]> {
  return apiFetch<UnitFamilyRow[]>(
    `${STREAM_DICTIONARY_PATH}/unit-families/${encodeURIComponent(familyName)}`
  );
}

/** Convert a value between two units within a unit family. */
export async function convertUnitByFamily(
  familyName: string,
  payload: { from_unit: string; to_unit: string; value: number }
): Promise<UnitConversionResult> {
  return apiFetch<UnitConversionResult>(
    `${STREAM_DICTIONARY_PATH}/unit-families/${encodeURIComponent(familyName)}/convert`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
