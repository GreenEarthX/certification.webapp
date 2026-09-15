// src/services/plant-builder/reports.ts
"use client";

import { apiFetch } from "@/services/api-client";
import type {
  MassEnergyBalancesDto,
  MassEnergyBalancesEquationsDto,
  MassEnergyBalancesSpecificationDto,
  PlantComponentRegistryDto,
  ProcessFlowOperationsDto,
  ReportBody,
  ReportTypeId,
} from "@/lib/reports/types";

const REPORTS_PATH = "/reports";

/**
 * Every call mints a new document reference and writes an audit row, so callers
 * must guard against double submission.
 */
async function generateReport<T extends ReportBody>(
  reportType: ReportTypeId,
  digitalTwinId: number
): Promise<T> {
  return apiFetch<T>(`${REPORTS_PATH}/generate`, {
    method: "POST",
    body: JSON.stringify({
      report_type: reportType,
      digital_twin_id: digitalTwinId,
    }),
  });
}

/** Type-level inventory of one digital twin (the plant variation). */
export async function generatePlantComponentRegistry(
  digitalTwinId: number
): Promise<PlantComponentRegistryDto> {
  return generateReport<PlantComponentRegistryDto>(
    "plant_component_registry",
    digitalTwinId
  );
}

/** Every stream crossing the system boundary, with its declared economics. */
export async function generateProcessFlowOperations(
  digitalTwinId: number
): Promise<ProcessFlowOperationsDto> {
  return generateReport<ProcessFlowOperationsDto>(
    "process_flow_operations",
    digitalTwinId
  );
}

/** Main report: every stream of the process flow, direction and value. */
export async function generateMassEnergyBalances(
  digitalTwinId: number
): Promise<MassEnergyBalancesDto> {
  return generateReport<MassEnergyBalancesDto>(
    "mass_energy_balances",
    digitalTwinId
  );
}

/** Annex: per-stream attributes by block, plus the electricity and heat tables. */
export async function generateMassEnergyBalancesSpecification(
  digitalTwinId: number
): Promise<MassEnergyBalancesSpecificationDto> {
  return generateReport<MassEnergyBalancesSpecificationDto>(
    "mass_energy_balances_specification",
    digitalTwinId
  );
}

/** Annex: equation cards per equipment, grouped by engineering category. */
export async function generateMassEnergyBalancesEquations(
  digitalTwinId: number
): Promise<MassEnergyBalancesEquationsDto> {
  return generateReport<MassEnergyBalancesEquationsDto>(
    "mass_energy_balances_equations",
    digitalTwinId
  );
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
): Promise<ReportBody> {
  return apiFetch<ReportBody>(`${REPORTS_PATH}/${reportDocumentId}`);
}
