// src/services/plant-builder/massBalance.ts
"use client";

import { apiFetch } from "@/services/api-client";

/**
 * Types mirror the v2 backend mass-balance module exactly (snake_case).
 *
 * v2 model: every run is scoped to ONE equipment instance
 * (`scope: "equipment"`). "Run all" uses the twin endpoint, which executes
 * each equipment in topological order server-side and returns one run header
 * per equipment. Results are fetched per equipment and reflect the latest
 * persisted run — so they survive page reloads.
 */

export type CalculationRunStatus =
  | "pending"
  | "success"
  | "partial"
  | "failed";
export type EquationResultStatus = "success" | "skipped" | "warning" | "failed";

export type CalculationRunSummary = {
  success?: number;
  skipped?: number;
  failed?: number;
  warnings?: string[];
};

export type CalculationRun = {
  id: number;
  digital_twin_id: number;
  /** v2: the equipment instance this run computed (null for legacy rows). */
  equipment_instance_id: number | null;
  scope: "equipment" | "twin";
  status: CalculationRunStatus;
  triggered_by?: number | null;
  summary?: CalculationRunSummary | null;
  error?: string | null;
  started_at?: string;
  finished_at?: string | null;
};

export type EquationResultTarget = {
  source?: string;
  field_name?: string;
  port_id?: string;
  connection_id?: string;
} | null;

/** Per-input snapshot the engine records for each equation (the substitution). */
export type ResolvedInput = {
  value: number | string | null;
  status: "ok" | "fallback" | "zeroed" | "missing";
  /** human trace of the source, e.g. "carrier_dictionary:Volatile Solids...:P1". */
  via: string;
};

export type CalculationResult = {
  id: number;
  run_id: number;
  equipment_instance_id: number | null;
  equation_id: string | null;
  symbol: string | null;
  /** NUMERIC column — Postgres/TypeORM may serialize it as a string. */
  value: number | string | null;
  canonical_unit: string | null;
  target: EquationResultTarget;
  /** Snapshot of every resolved input (symbol → {value,status,via}). */
  inputs: Record<string, ResolvedInput> | null;
  status: EquationResultStatus;
  message?: string | null;
  created_at?: string;
};

/** Dry-run resolution preview — same result shape as a run, not persisted. */
export type EquipmentPreview = {
  instance_id: number;
  equipment_component_id: string;
  counts: { success: number; skipped: number; failed: number };
  warnings: string[];
  results: CalculationResult[];
};

/** Latest persisted run + its per-equation results for one equipment. */
export type EquipmentRun = {
  run: CalculationRun | null;
  results: CalculationResult[];
};

/** One parameter of an equation definition (as authored by the experts). */
export type EquationDefParameter = {
  symbol: string;
  role: "input" | "output";
  unit_family?: string;
  definition?: string;
  source?: {
    param_source?: string;
    field_name?: string;
    port_id?: string;
    param_id?: string;
    produced_by?: string;
    symbol?: string;
  } | null;
};

/** An equation definition row (equipment_equations table). */
export type EquationDefinition = {
  id: number;
  equipment_component_id: string;
  equation_id: string;
  expression: string;
  equation_type?: string | null;
  description?: string | null;
  parameters: EquationDefParameter[];
  is_active?: boolean;
};

const MASS_BALANCE_PATH = "/mass-balance";

/**
 * Runs the engine for ONE equipment instance. Resilient by contract: returns
 * a run header whose status may be "partial"/"failed" — it does not throw for
 * missing parameters, only for an unknown twin/equipment.
 */
export async function computeEquipment(
  digitalTwinId: number,
  instanceId: number
): Promise<CalculationRun> {
  return apiFetch<CalculationRun>(
    `${MASS_BALANCE_PATH}/digital-twins/${digitalTwinId}/equipment/${instanceId}/compute`,
    { method: "POST" }
  );
}

/**
 * Runs every equipment in the twin in topological order (upstream first) —
 * the correct way to "run all", since downstream equations consume upstream
 * outputs. Returns one run header per equipment.
 */
export async function computeTwin(
  digitalTwinId: number
): Promise<CalculationRun[]> {
  return apiFetch<CalculationRun[]>(
    `${MASS_BALANCE_PATH}/digital-twins/${digitalTwinId}/compute`,
    { method: "POST" }
  );
}

/** Latest persisted results for one equipment (empty run:null if never ran). */
export async function fetchEquipmentResults(
  digitalTwinId: number,
  instanceId: number
): Promise<EquipmentRun> {
  return apiFetch<EquipmentRun>(
    `${MASS_BALANCE_PATH}/digital-twins/${digitalTwinId}/equipment/${instanceId}/results`
  );
}

/** Compute one equipment, then fetch its detailed results in one call. */
export async function runEquipment(
  digitalTwinId: number,
  instanceId: number
): Promise<EquipmentRun> {
  await computeEquipment(digitalTwinId, instanceId);
  return fetchEquipmentResults(digitalTwinId, instanceId);
}

/** Dry-run resolve one equipment against current state (no run persisted). */
export async function fetchResolutionPreview(
  digitalTwinId: number,
  instanceId: number
): Promise<EquipmentPreview> {
  return apiFetch<EquipmentPreview>(
    `${MASS_BALANCE_PATH}/digital-twins/${digitalTwinId}/equipment/${instanceId}/preview`
  );
}

/** Equation definitions for an equipment type (business id, e.g. "E166"). */
export async function fetchEquipmentEquations(
  equipmentComponentId: string
): Promise<EquationDefinition[]> {
  return apiFetch<EquationDefinition[]>(
    `${MASS_BALANCE_PATH}/equations/${encodeURIComponent(equipmentComponentId)}`
  );
}

/** Lists run history headers for a digital twin (most recent first). */
export async function listMassBalanceRuns(
  digitalTwinId: number
): Promise<CalculationRun[]> {
  return apiFetch<CalculationRun[]>(
    `${MASS_BALANCE_PATH}/digital-twins/${digitalTwinId}/runs`
  );
}
