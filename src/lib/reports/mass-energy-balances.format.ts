import { DASH } from "./format";
import type {
  EquationOperand,
  SpecTriplet,
  SpecValue,
  SpecificationBlock,
  StreamKind,
  StreamSpecification,
  StreamSummaryRow,
} from "./types";

/**
 * Row definitions and formatting shared by the Mass & Energy Balances preview
 * components and their PDF renderers, so the screen and the page cannot drift.
 *
 * The Specification table is TRANSPOSED: attributes are rows, streams are
 * columns. Every row below is declared once here and consumed by both
 * renderers; the only per-renderer logic is how a cell is drawn.
 */

/**
 * A figure as these three documents print it: up to 4 decimals at any
 * magnitude, grouped thousands. The backend already rounds to 6 significant
 * digits, and 1031.25 kg/h must not lose its ".25" just because it is above a
 * thousand — the Equations annex is the proof behind every other number.
 * Below 0.0001 it goes exponential rather than reading as "0".
 */
export function formatFigure(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return DASH;
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 0.0001) return n.toExponential(3);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(n);
}

// ───────────────────────────── main report ─────────────────────────────────

export const KIND_LABEL: Record<StreamKind, string> = {
  material: "Material",
  electricity: "Electricity",
  heat: "Heat",
};

/** "15 t/day", "20.8333 kW", or a dash when the connector carries nothing. */
export const summaryValueText = (row: StreamSummaryRow): string =>
  formatFigure(row.value);

export const summaryUnitText = (row: StreamSummaryRow): string =>
  row.value === null ? DASH : row.unit || DASH;

/** "Shredder (E148)" — the reference token is what the reader cross-checks. */
export const endpointText = (label: string, ref: string): string =>
  ref === DASH ? label : `${label} (${ref})`;

// ───────────────────────────── specification ───────────────────────────────

/** An empty cell is the document's way of saying "no value declared". */
export const specNumber = (n: number | null): string =>
  n === null ? "" : formatFigure(n);

export const specText = (s: string | null): string => s ?? "";

export type SpecCell =
  | { kind: "text"; text: string; mono?: boolean }
  | { kind: "triplet"; min: string; norm: string; max: string }
  | { kind: "composition"; label: string | null; value: string };

export interface SpecRowDef {
  key: string;
  label: string;
  /** Printed once, in the attribute column, never in a stream cell. */
  unit?: string;
  cell: (s: StreamSpecification) => SpecCell;
  /**
   * Rows that exist only for a phase (volume flows) are dropped from a block
   * where no stream has that phase, per the "omit the Volume Flow Rate line
   * for any phase not present" rule.
   */
  optional?: boolean;
}

export interface SpecSection {
  /** "Section 1", "Section 2", ...; empty for the description block. */
  index: number | null;
  title: string;
  rows: SpecRowDef[];
}

const text = (t: string, mono = false): SpecCell => ({ kind: "text", text: t, mono });

const triplet = (t: SpecTriplet | null): SpecCell =>
  t
    ? {
        kind: "triplet",
        min: specNumber(t.min),
        norm: specNumber(t.norm),
        max: specNumber(t.max),
      }
    : { kind: "triplet", min: "", norm: "", max: "" };

const value = (v: SpecValue): SpecCell => text(specNumber(v.value), true);

/** True when at least one stream in the block carries the row. */
const present = (
  block: SpecificationBlock,
  pick: (s: StreamSpecification) => SpecTriplet | null
) => block.streams.some((s) => pick(s) !== null);

/**
 * The unit a row prints: the first stream that carries one. Units are fixed
 * per attribute by the backend, so any stream is as good as another.
 */
const unitOf = (
  block: SpecificationBlock,
  pick: (s: StreamSpecification) => { unit: string } | null,
  fallback: string
) => {
  for (const s of block.streams) {
    const u = pick(s)?.unit;
    if (u) return u;
  }
  return fallback;
};

export const COMPOSITION_ROWS = 20;

/** Every row of the transposed Specification table, in document order. */
export function specSections(block: SpecificationBlock): SpecSection[] {
  const o = (s: StreamSpecification) => s.operational;
  const c = (s: StreamSpecification) => s.characteristics;

  const volumeRows: SpecRowDef[] = [
    {
      key: "vfl",
      label: "Volume Flow Rate - Liquid (min | norm | max)",
      unit: "m3/h",
      optional: true,
      cell: (s) => triplet(o(s).volume_flow_rate_liquid),
    },
    {
      key: "vfls",
      label: "Volume Flow Rate - Liquid (min | norm | max)",
      unit: "Std m3/h",
      optional: true,
      cell: (s) => triplet(o(s).volume_flow_rate_liquid_std),
    },
    {
      key: "vfg",
      label: "Volume Flow Rate - Gas (min | norm | max)",
      unit: "m3/h",
      optional: true,
      cell: (s) => triplet(o(s).volume_flow_rate_gas),
    },
    {
      key: "vfgn",
      label: "Volume Flow Rate - Gas (min | norm | max)",
      unit: "Nm3/h",
      optional: true,
      cell: (s) => triplet(o(s).volume_flow_rate_gas_normal),
    },
  ];
  const pickers: Record<string, (s: StreamSpecification) => SpecTriplet | null> = {
    vfl: (s) => o(s).volume_flow_rate_liquid,
    vfls: (s) => o(s).volume_flow_rate_liquid_std,
    vfg: (s) => o(s).volume_flow_rate_gas,
    vfgn: (s) => o(s).volume_flow_rate_gas_normal,
  };
  const keptVolumeRows = volumeRows.filter((r) => present(block, pickers[r.key]));

  const composition: SpecRowDef[] = Array.from(
    { length: COMPOSITION_ROWS },
    (_, i) => ({
      key: `comp${i + 1}`,
      label: `${i + 1}.`,
      cell: (s) => {
        const row = s.composition.rows[i];
        return {
          kind: "composition",
          label: row?.label ?? null,
          value: specNumber(row?.value ?? null),
        };
      },
    })
  );

  return [
    {
      index: null,
      title: "Stream Description",
      rows: [
        { key: "d-carrier", label: "Carrier", cell: (s) => text(s.description.carrier) },
        { key: "d-from", label: "From", cell: (s) => text(s.description.from) },
        { key: "d-to", label: "To", cell: (s) => text(s.description.to) },
      ],
    },
    {
      index: 1,
      title: "Stream Characteristics",
      rows: [
        { key: "carrier", label: "Carrier", cell: (s) => text(c(s).carrier) },
        { key: "carrier_id", label: "Carrier ID", cell: (s) => text(c(s).carrier_id, true) },
        {
          key: "opcond",
          label: "Operating Conditions",
          cell: (s) => text(specText(c(s).operating_conditions)),
        },
        {
          key: "state",
          label: "Physical State",
          cell: (s) => text(specText(c(s).physical_state)),
        },
        { key: "solid", label: "Solid Fraction", unit: "%", cell: (s) => text(specNumber(c(s).solid_fraction), true) },
        { key: "liquid", label: "Liquid Fraction", unit: "%", cell: (s) => text(specNumber(c(s).liquid_fraction), true) },
        { key: "gas", label: "Gas Fraction", unit: "%", cell: (s) => text(specNumber(c(s).gas_fraction), true) },
      ],
    },
    {
      index: 2,
      title: "Composition",
      rows: [
        ...composition,
        {
          key: "total",
          label: "Total",
          unit: "%",
          cell: (s) => text(specNumber(s.composition.total), true),
        },
      ],
    },
    {
      index: 3,
      title: "Stream Operational Parameters",
      rows: [
        { key: "mode", label: "Operating Mode", cell: (s) => text(specText(o(s).operating_mode)) },
        {
          key: "mass",
          label: "Mass Flow Rate (min | norm | max)",
          unit: unitOf(block, (s) => o(s).mass_flow_rate, "kg/h"),
          cell: (s) => triplet(o(s).mass_flow_rate),
        },
        ...keptVolumeRows,
        {
          key: "pressure",
          label: "Pressure (min | norm | max)",
          unit: unitOf(block, (s) => o(s).pressure, "bar"),
          cell: (s) => triplet(o(s).pressure),
        },
        {
          key: "temperature",
          label: "Temperature (min | norm | max)",
          unit: unitOf(block, (s) => o(s).temperature, "°C"),
          cell: (s) => triplet(o(s).temperature),
        },
        { key: "enthalpy", label: "Enthalpy", unit: unitOf(block, (s) => o(s).enthalpy, "kJ/kg"), cell: (s) => value(o(s).enthalpy) },
        { key: "mw", label: "Molecular Weight", unit: unitOf(block, (s) => o(s).molecular_weight, "kg/kmol"), cell: (s) => value(o(s).molecular_weight) },
        { key: "ldens", label: "Liquid Density", unit: unitOf(block, (s) => o(s).liquid_density, "kg/m3"), cell: (s) => value(o(s).liquid_density) },
        { key: "vdens", label: "Vapor Density", unit: unitOf(block, (s) => o(s).vapor_density, "kg/m3"), cell: (s) => value(o(s).vapor_density) },
        { key: "bp", label: "Boiling Point", unit: unitOf(block, (s) => o(s).boiling_point, "°C"), cell: (s) => value(o(s).boiling_point) },
        { key: "mp", label: "Melting Point", unit: unitOf(block, (s) => o(s).melting_point, "°C"), cell: (s) => value(o(s).melting_point) },
        { key: "pp", label: "Pour Point", unit: unitOf(block, (s) => o(s).pour_point, "°C"), cell: (s) => value(o(s).pour_point) },
        { key: "notes", label: "Notes", cell: (s) => text(specText(o(s).notes)) },
      ],
    },
  ];
}

/** "— | 625 | —": the PDF's one-line rendering of a triplet cell. */
export const tripletText = (cell: Extract<SpecCell, { kind: "triplet" }>) =>
  [cell.min, cell.norm, cell.max].map((v) => v || DASH).join("  |  ");

/** A cell flattened to text, for the PDF and for tests. */
export function specCellText(cell: SpecCell): string {
  switch (cell.kind) {
    case "text":
      return cell.text;
    case "triplet":
      return tripletText(cell);
    case "composition":
      return cell.label ? `${cell.label}\n${cell.value}` : cell.value;
  }
}

/** Streams per Specification table: the landscape page fits this many columns. */
export const SPEC_COLUMNS_PER_TABLE = 6;

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// ───────────────────────────── energy tables ───────────────────────────────

/** Annual figures are whole kWh; grouped so 2,873,448 reads at a glance. */
export const kwText = (n: number | null): string => formatFigure(n);

export const kwhText = (n: number | null): string =>
  n === null ? DASH : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

// ───────────────────────────── equations ───────────────────────────────────

/** "1031.25 kg/h", "0.99", or a dash. */
export function operandValueText(op: EquationOperand): string {
  if (op.value === null) return DASH;
  const n = formatFigure(op.value);
  return op.unit ? `${n} ${op.unit}` : n;
}

/** "Substrate Blend Stream Flow = 1031.25 kg/h (computed in EQ43)" */
export function operandText(op: EquationOperand): string {
  const base = `${op.label} = ${operandValueText(op)}`;
  return op.computed_in ? `${base} (computed in ${op.computed_in})` : base;
}

/** "E148 - Shredder", plus the instance name when the operator renamed it. */
export function equipmentHeading(e: {
  equipment_id: string;
  equipment: string;
  instance: string;
}): string {
  const head = `${e.equipment_id} - ${e.equipment}`;
  return e.instance && e.instance !== e.equipment ? `${head} (${e.instance})` : head;
}
