import type {
  BoundaryStreamRow,
  ComponentRef,
  EconomicImpact,
  RefKind,
  StreamComponent,
  TimeBasis,
} from "./types";

/**
 * Shared by the on-screen preview and the jsPDF renderer so the two cannot
 * drift on formatting.
 */

/** "2026-09-01 14:32" — 24-hour, viewer's local timezone. */
export function formatReportTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}`
  );
}

/** Explicit hex — the Tailwind theme in this app defines almost no tokens. */
export const REF_COLORS: Record<RefKind, string> = {
  equipment: "#0F766E",
  gate: "#F59E0B",
  carrier: "#475569",
  unknown: "#94A3B8",
};

export const BRAND = {
  primary: "#0F766E",
  primaryHover: "#0C5F59",
  primaryLight: "#14B8A6",
  ink: "#1E293B",
  muted: "#64748B",
  hairline: "#E2E8F0",
  zebra: "#F8FAFC",
} as const;

export const refText = (r: ComponentRef) => `${r.label} (${r.ref})`;

export const refListText = (refs: ComponentRef[]) =>
  refs.length ? refs.map(refText).join(", ") : "—";

/**
 * Colour for a single whitespace-delimited word, or null to leave it as body
 * text. Matching per word (rather than by index into the ref array) is what
 * keeps the PDF colouring correct after autoTable wraps a long From/To cell.
 */
const REF_TOKEN = /^\((E|G|C)\d+\)[,;]?$/;

export function wordColor(word: string): string | null {
  const m = REF_TOKEN.exec(word);
  if (!m) return null;
  if (m[1] === "E") return REF_COLORS.equipment;
  if (m[1] === "G") return REF_COLORS.gate;
  return REF_COLORS.carrier;
}

// ───────────────────────────── Process Flow Operations ─────────────────────

/** The document's placeholder for a value that could not be resolved. */
export const DASH = "—";
/** Distinct from DASH: the value is knowable but was not declared/priced. */
export const NA = "NA";

/**
 * Illustration palette, straight from the report's visual specification.
 *
 * Separate from BRAND: the two system-boundary illustrations are specified in
 * their own token set (deeper teal, coral/leaf/royal semantics) and must not
 * drift with the document chrome.
 */
export const DIAGRAM = {
  boxStroke: "#206A5D",
  boxFill: "#EAF4F0",
  heading: "#205A53",
  containerStroke: "#B7D9CF",
  containerHeaderFill: "#EAF4F0",
  arrow: "#000000",
  body: "#4A5568",
  cardFill: "#FFFFFF",
  cost: "#D9534F",
  costTint: "#F5C2C2",
  revenue: "#2E7D32",
  revenueTint: "#A3E0C1",
  neutral: "#1A73E8",
  neutralTint: "#C6DAFB",
} as const;

/** Stream colour is driven by economic impact, never by direction. */
export const IMPACT_STYLE: Record<
  EconomicImpact,
  { color: string; tint: string; label: string }
> = {
  Cost: { color: DIAGRAM.cost, tint: DIAGRAM.costTint, label: "COST" },
  Revenue: {
    color: DIAGRAM.revenue,
    tint: DIAGRAM.revenueTint,
    label: "REVENUE",
  },
  Neutral: {
    color: DIAGRAM.neutral,
    tint: DIAGRAM.neutralTint,
    label: "NEUTRAL",
  },
  // An unresolved impact reads as neutral rather than inventing a third colour.
  [DASH]: { color: DIAGRAM.neutral, tint: DIAGRAM.neutralTint, label: DASH },
};

const grouped = (n: number, decimals: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(n);

/**
 * A quantity as the document prints it.
 *
 * Never rounds a small number to nothing: below 0.001 it goes exponential
 * rather than reading as "0", which in a mass-balance document would be a lie.
 * Above 1e9 it goes exponential too, so a yearly column cannot blow its width.
 */
export function formatQuantity(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return DASH;
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e9 || abs < 0.001) return n.toExponential(3);
  if (abs >= 1000) return grouped(n, 0);
  return grouped(n, 3);
}

/** "6 kg/h" — the hourly figure, which is what both illustrations show. */
export function rateText(component: StreamComponent): string {
  if (component.value.hourly === null) return DASH;
  return `${formatQuantity(component.value.hourly)} ${component.value.unit}/h`;
}

/**
 * "30 kg/h" — the quantity on the gate<->carrier connector, which is what each
 * arrow in the system-boundary illustration is labelled with. The unit is
 * printed exactly as stored, so "t/day" and "kW" stay as they are.
 */
export function flowText(row: BoundaryStreamRow): string {
  if (row.flow.quantity === null) return DASH;
  const unit = flowUnitText(row);
  return unit === DASH
    ? formatQuantity(row.flow.quantity)
    : `${formatQuantity(row.flow.quantity)} ${unit}`;
}

/** The connector quantity on its own, for the table's Stream Value column. */
export const flowValueText = (row: BoundaryStreamRow): string =>
  formatQuantity(row.flow.quantity);

/** The connector unit on its own, verbatim, for the Stream Unit column. */
export const flowUnitText = (row: BoundaryStreamRow): string =>
  row.flow.unit.trim() || DASH;

/** "Methane 6 kg/h" — one molecule, as the illustrations label it. */
export function componentText(component: StreamComponent): string {
  return `${component.label} ${rateText(component)}`;
}

/**
 * "30 EUR/kg", or NA when the gate declared no price.
 *
 * The unit is printed exactly as the database holds it — no currency symbols,
 * no conversion. `EUR` stays `EUR`.
 */
export function priceText(row: BoundaryStreamRow): string {
  if (row.price === null) return NA;
  return row.price_unit
    ? `${formatQuantity(row.price)} ${row.price_unit}`
    : formatQuantity(row.price);
}

export const DIRECTION_LABEL: Record<string, string> = {
  upstream: "upstream",
  downstream: "downstream",
  [DASH]: DASH,
};

/** Two frames, so a React state change actually paints before blocking work. */
export const nextPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
