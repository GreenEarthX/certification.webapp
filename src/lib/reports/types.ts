/**
 * Mirrors certification_backend/src/modules/reports/dto/report.dto.ts.
 * Keep the two in sync — snake_case is deliberate, matching the API shape.
 */

export type ReportTypeId =
  | "plant_component_registry"
  | "process_flow_operations"
  | "mass_energy_balances"
  | "mass_energy_balances_specification"
  | "mass_energy_balances_equations";

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

// ───────────────────────────── Mass & Energy Balances ──────────────────────

/**
 * How a stream is classified on the Mass & Energy Balances documents.
 * `material` streams get a Specification column; `electricity` and `heat`
 * carry a duty (kW) and go to the energy tables instead.
 */
export type StreamKind = "material" | "electricity" | "heat";

/**
 * One row of the main report: a carrier instance between two flow components.
 * `from_id` / `to_id` are the definition's component_id (E148, G3), type-level
 * by design; `carrier_id` is the per-instance C-number shared with the Plant
 * Component Registry.
 */
export interface StreamSummaryRow {
  id: string; // "S1"
  kind: StreamKind;
  carrier: string;
  carrier_id: string;
  from: string;
  from_id: string;
  to: string;
  to_id: string;
  /** The connector quantity as the plant builder stored it; null when none. */
  value: number | null;
  /** Verbatim from the connector, e.g. "t/day", "kW". Empty when none. */
  unit: string;
}

export interface MassEnergyBalancesDto {
  report_type: "mass_energy_balances";
  report_document_id: number;
  title: string;
  metadata: ReportMetadata;
  streams: StreamSummaryRow[];
  warnings: string[];
}

/** A single attribute value with the unit the document prints it in. */
export interface SpecValue {
  value: number | null;
  unit: string;
}

/** min | norm | max; a missing segment is null and still rendered as a slot. */
export interface SpecTriplet {
  min: number | null;
  norm: number | null;
  max: number | null;
  unit: string;
}

export interface CompositionRow {
  index: number; // 1..20
  /** Component name from the carrier dictionary; null for an unused slot. */
  label: string | null;
  /** Mass percentage, 0-100; null when the carrier declares no value. */
  value: number | null;
}

/** One Specification column. Energy streams never get one. */
export interface StreamSpecification {
  id: string; // "S1"
  description: { carrier: string; from: string; to: string };
  characteristics: {
    carrier: string;
    carrier_id: string;
    operating_conditions: string | null;
    physical_state: string | null;
    solid_fraction: number | null;
    liquid_fraction: number | null;
    gas_fraction: number | null;
  };
  composition: {
    rows: CompositionRow[]; // always 20 entries
    /** Sum of the populated rows; null when none is populated. */
    total: number | null;
  };
  operational: {
    operating_mode: string | null;
    mass_flow_rate: SpecTriplet; // kg/h
    /** null = phase absent from the stream, so the row is omitted. */
    volume_flow_rate_liquid: SpecTriplet | null;
    volume_flow_rate_liquid_std: SpecTriplet | null;
    volume_flow_rate_gas: SpecTriplet | null;
    volume_flow_rate_gas_normal: SpecTriplet | null;
    pressure: SpecTriplet;
    temperature: SpecTriplet; // °C
    enthalpy: SpecValue;
    molecular_weight: SpecValue;
    liquid_density: SpecValue;
    vapor_density: SpecValue;
    boiling_point: SpecValue;
    melting_point: SpecValue;
    pour_point: SpecValue;
    notes: string | null;
  };
}

export interface SpecificationBlock {
  block: string;
  description: string;
  streams: StreamSpecification[];
}

export interface ElectricityRow {
  stream_id: string;
  equipment: string;
  equipment_id: string;
  /** Design (norm) draw in kW; null when the connector carries no quantity. */
  consumption_kw: number | null;
  /** consumption_kw × time_basis.hours_per_year. */
  annual_kwh: number | null;
}

export interface HeatRow {
  stream_id: string;
  from: string;
  from_id: string;
  to: string;
  to_id: string;
  heat_duty_kw: number | null;
  annual_kwh: number | null;
}

export interface MassEnergyBalancesSpecificationDto {
  report_type: "mass_energy_balances_specification";
  report_document_id: number;
  title: string;
  metadata: ReportMetadata;
  time_basis: TimeBasis;
  blocks: SpecificationBlock[];
  energy: {
    electricity: ElectricityRow[];
    heat: HeatRow[];
  };
  warnings: string[];
}

/** One operand of an equation card, as it was resolved in the stored run. */
export interface EquationOperand {
  /** Comprehensive label: the parameter's field_name, or its nearest equivalent. */
  label: string;
  symbol: string;
  value: number | null;
  /** Canonical unit of the parameter's unit_family; null when dimensionless. */
  unit: string | null;
  /** Equation this input was computed in; null for a form value or constant. */
  computed_in: string | null;
}

export interface EquationCard {
  id: string; // "EQ43" — the stored, plant-global equation_id
  /** The expression with every symbol replaced by its label. */
  labelled_expression: string;
  /** The symbolic expression verbatim from the equation library. */
  expression: string;
  description: string | null;
  equation_type: string | null;
  output: EquationOperand;
  inputs: EquationOperand[];
}

export interface EquipmentEquations {
  /** component_definitions.component_id, e.g. "E148". */
  equipment_id: string;
  /** Definition name, e.g. "Shredder". */
  equipment: string;
  instance_id: string;
  /** The operator's own name for this instance. */
  instance: string;
  equations: EquationCard[];
}

export interface EquationCategory {
  id: string; // "Cat1" or "Uncategorised"
  chapter: number; // 1-based, over the categories present only
  category: string;
  equipment: EquipmentEquations[];
}

export interface MassEnergyBalancesEquationsDto {
  report_type: "mass_energy_balances_equations";
  report_document_id: number;
  title: string;
  metadata: ReportMetadata;
  categories: EquationCategory[];
  warnings: string[];
}

export type ReportBody =
  | PlantComponentRegistryDto
  | ProcessFlowOperationsDto
  | MassEnergyBalancesDto
  | MassEnergyBalancesSpecificationDto
  | MassEnergyBalancesEquationsDto;

/** Every report body carries at least these. */
export interface ReportBodyBase {
  report_document_id: number;
  title: string;
  metadata: ReportMetadata;
  warnings: string[];
}
