/**
 * Mirrors certification_backend/src/modules/reports/dto/report.dto.ts.
 * Keep the two in sync — snake_case is deliberate, matching the API shape.
 */

export type ReportTypeId =
  | "plant_component_registry"
  | "process_flow_operations"
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

// ───────────────────────────── Process Flow Operations ─────────────────────

/** The report's Direction column; lowercase, matching the backend constant. */
export type StreamDirection = "upstream" | "downstream" | "—";

export type EconomicImpact = "Cost" | "Revenue" | "Neutral" | "—";

/**
 * The hours-per-day / days-per-year behind every per-day and per-year figure,
 * snapshotted into the document so a reopened report shows identical numbers
 * even after the plant's operating profile is edited.
 */
export interface TimeBasis {
  hours_per_day: number;
  days_per_year: number;
  hours_per_year: number;
  /** true when the plant declared no operating profile and 24/365 was assumed. */
  is_default: boolean;
}

/**
 * One stream at three time resolutions.
 *
 * Units are NEVER converted: the numerator is carried through exactly as the
 * operator wrote it (`t` stays `t`, `MWh` stays `MWh`) and only the time
 * denominator is rescaled. `null` means the declared unit carries no time
 * denominator, so the value cannot be placed on a time axis at all.
 */
export interface StreamValue {
  hourly: number | null;
  daily: number | null;
  yearly: number | null;
  /** Numerator as written by the operator, e.g. "t". "—" when unreadable. */
  unit: string;
  /** The unit exactly as the operator entered it, e.g. "t/h" or "m³/year". */
  declared_unit: string;
  /** Which resolution the operator actually typed; the other two are derived. */
  declared_basis: "hour" | "day" | "year" | null;
}

/**
 * One molecule carried by a boundary stream.
 *
 * A carrier declares one flow field per molecule — Biogas carries Methane,
 * Hydrogen and Carbon Dioxide at once — so a stream has a list of these rather
 * than a single quantity. They are NEVER summed: some are defined as subsets of
 * others ("Volatile Solids" is part of "Total Solids"), so a total would double
 * count.
 */
export interface StreamComponent {
  /** Field name exactly as stored, e.g. "Methane Mass Flow Rate". */
  field_name: string;
  /** Display label: the field name minus its trailing " Mass Flow Rate". */
  label: string;
  value: StreamValue;
}

/**
 * The quantity written on the connector itself — gate -> carrier for a supply,
 * carrier -> gate for an offtake. This is the figure the plant builder shows on
 * the link, and it is what each arrow in the system-boundary illustration is
 * labelled with. Printed exactly as stored: "0.09 t/day" and "7 kW" stay as
 * they are.
 */
export interface StreamFlow {
  quantity: number | null;
  /** Verbatim from the connector, e.g. "kg/h", "t/day", "kW". */
  unit: string;
}

/** One row per stream crossing the system boundary. */
export interface BoundaryStreamRow {
  id: string; // "S1"
  direction: StreamDirection;
  /** Same numbering as the Plant Component Registry — G3 is the same gate. */
  gate_id: string;
  gate: string;
  carrier: string;
  /** The quantity on the gate<->carrier connector, as the plant builder shows it. */
  flow: StreamFlow;
  /** One entry per molecule the carrier declares a flow for; may be empty. */
  components: StreamComponent[];
  economic_impact: EconomicImpact;
  /** null renders as "NA": either the impact is Neutral or no price was given. */
  price: number | null;
  /**
   * The unit exactly as the database holds it — the instance's own
   * "Economic Value_unit" when set, otherwise the canonical unit of the field's
   * unit_family (COST_PER_MASS_EUR -> "EUR/kg"). Printed verbatim: never
   * converted, never turned into a currency symbol.
   */
  price_unit: string | null;
}
// NOTE: no annual amount. The gate prices the stream as a whole while the
// carrier declares several molecules, so there is no defensible quantity to
// multiply the price by — see StreamComponent.

export interface ProcessFlowOperationsDto {
  report_type: "process_flow_operations";
  report_document_id: number;
  title: string;
  metadata: ReportMetadata;
  time_basis: TimeBasis;
  streams: BoundaryStreamRow[];
  warnings: string[];
}

/** Grows as report 3 lands. */
export type ReportBody = PlantComponentRegistryDto | ProcessFlowOperationsDto;

/** Every report body carries at least these; widens as report 3 lands. */
export interface ReportBodyBase {
  report_document_id: number;
  title: string;
  metadata: ReportMetadata;
  warnings: string[];
}
