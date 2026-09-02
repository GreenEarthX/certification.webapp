/**
 * Mirrors certification_backend/src/modules/reports/dto/report.dto.ts.
 * Keep the two in sync — snake_case is deliberate, matching the API shape.
 */

export type ReportTypeId =
  | "plant_component_registry"
  | "mass_balance_summary"
  | "compliance_dossier";

export type GateRole =
  | "Upstream"
  | "Downstream"
  | "Upstream / Downstream"
  | "—";

export interface ReportMetadata {
  /** Always 0 today; revision logic is not wired yet. */
  revision_number: number;
  user_name: string;
  /** ISO 8601 with offset — format with formatReportTimestamp(). */
  generated_at: string;
  project_name: string;
  project_variation: string;
  document_reference: string;
  project_reference: string;
  /** Self-declared during onboarding. There is no KYB verification. */
  company_name: string;
}
// NOTE: no `status` field. Draft/Complete was deliberately removed.

export type RefKind = "equipment" | "gate" | "carrier" | "unknown";

export interface ComponentRef {
  label: string;
  ref: string;
  kind: RefKind;
}

export interface EquipmentRow {
  id: string;
  equipment: string;
  quantity: number;
}

export interface GateRow {
  id: string;
  gate: string;
  role: GateRole;
}

export interface CarrierRow {
  id: string;
  carrier: string;
  from: ComponentRef[];
  to: ComponentRef[];
}

export interface PlantComponentRegistryDto {
  report_type: "plant_component_registry";
  report_document_id: number;
  title: string;
  metadata: ReportMetadata;
  equipment: EquipmentRow[];
  gates: GateRow[];
  carriers: CarrierRow[];
  warnings: string[];
}

/** Every report body carries at least these; widens as reports 2/3 land. */
export interface ReportBodyBase {
  report_document_id: number;
  title: string;
  metadata: ReportMetadata;
  warnings: string[];
}
