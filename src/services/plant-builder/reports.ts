// src/services/plant-builder/reports.ts
"use client";

import { apiFetch } from "@/services/api-client";
import type { PlantComponentRegistryDto } from "@/lib/reports/types";

const REPORTS_PATH = "/reports";

/**
 * Generates a Plant Component Registry for one digital twin (the plant
 * variation). Every call mints a new document reference and writes an audit
 * row, so callers must guard against double submission.
 */
export async function generatePlantComponentRegistry(
  digitalTwinId: number
): Promise<PlantComponentRegistryDto> {
  return apiFetch<PlantComponentRegistryDto>(`${REPORTS_PATH}/generate`, {
    method: "POST",
    body: JSON.stringify({
      report_type: "plant_component_registry",
      digital_twin_id: digitalTwinId,
    }),
  });
}

export type ReportDocumentHeader = {
  id: number;
  report_type: string;
  document_reference: string;
  revision_number: number;
  project_reference: string;
  project_name: string;
  project_variation: string;
  user_name: string;
  generated_at: string;
  warning_count: number;
};

/** Past documents issued for a twin, newest first. */
export async function listReports(
  digitalTwinId: number
): Promise<ReportDocumentHeader[]> {
  return apiFetch<ReportDocumentHeader[]>(
    `${REPORTS_PATH}?digitalTwinId=${digitalTwinId}`
  );
}

/** Re-opens a past document from its snapshot; mints no new reference. */
export async function fetchReport(
  reportDocumentId: number
): Promise<PlantComponentRegistryDto> {
  return apiFetch<PlantComponentRegistryDto>(
    `${REPORTS_PATH}/${reportDocumentId}`
  );
}
