import type {
  CalculationResult,
  EquationResultStatus,
  EquipmentRun,
} from "@/services/plant-builder/massBalance";

/** A minimal reference to an equipment node on the canvas. */
export type EquipmentRef = {
  /** backend component_instances.id */
  instanceId: number;
  /** display name */
  name: string;
  /** component_definition business id, e.g. "E166" */
  componentId?: string;
  /** canvas node id (used for focus-on-canvas) */
  nodeId: string;
};

/** instanceId → latest run+results. The panel's whole data model. */
export type EquipmentRunMap = Record<number, EquipmentRun>;

export type EquationGroupStatus =
  | "computed" // all results succeeded
  | "partial" // some succeeded, some failed/warning
  | "failed" // all results failed
  | "skipped" // only skipped results
  | "not_run"; // equipment never computed (no persisted run)

export type EquationGroup = {
  instanceId: number;
  name: string;
  componentId?: string;
  nodeId?: string;
  status: EquationGroupStatus;
  run: EquipmentRun | null;
  results: CalculationResult[];
};

export type RunSummary = {
  computed: number;
  needsAttention: number;
  skipped: number;
  notRun: number;
  total: number;
  /** overall tone for the header */
  tone: "ok" | "attention" | "failed" | "idle";
};

/** Coerce a NUMERIC value (which may arrive as a string) to a number or null. */
export const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Compact, human-friendly value formatting with an optional unit. */
export const formatValue = (
  value: number | string | null | undefined,
  unit?: string | null
): string => {
  const n = toNumber(value);
  if (n === null) return "—";
  const abs = Math.abs(n);
  let text: string;
  if (abs !== 0 && (abs >= 1e6 || abs < 1e-3)) {
    text = n.toExponential(3);
  } else {
    // up to 4 significant-ish decimals, trimmed
    text = Number(n.toFixed(4)).toString();
  }
  return unit ? `${text} ${unit}` : text;
};

const groupStatusFrom = (
  run: EquipmentRun | null
): EquationGroupStatus => {
  if (!run || !run.run) return "not_run";
  const results = run.results;
  if (results.length === 0) return "not_run";
  const has = (s: EquationResultStatus) => results.some((r) => r.status === s);
  const anySuccess = has("success");
  const anyFailed = has("failed");
  const anyWarning = has("warning");
  const anySkipped = has("skipped");
  if (anyFailed || anyWarning) return anySuccess ? "partial" : "failed";
  if (anySuccess) return anySkipped ? "partial" : "computed";
  return "skipped"; // only skipped
};

/**
 * Join the placed equipment with each one's latest run so every equipment
 * appears exactly once — including those never computed ("not_run").
 */
export const buildEquationGroups = (
  runs: EquipmentRunMap,
  equipment: EquipmentRef[]
): EquationGroup[] => {
  const groups: EquationGroup[] = equipment.map((eq) => {
    const run = runs[eq.instanceId] ?? null;
    return {
      instanceId: eq.instanceId,
      name: eq.name,
      componentId: eq.componentId,
      nodeId: eq.nodeId,
      status: groupStatusFrom(run),
      run,
      results: run?.results ?? [],
    };
  });

  // Attention first, then computed, then skipped, then never-run.
  const rank: Record<EquationGroupStatus, number> = {
    failed: 0,
    partial: 1,
    computed: 2,
    skipped: 3,
    not_run: 4,
  };
  return groups.sort((a, b) => rank[a.status] - rank[b.status]);
};

export const summarizeGroups = (groups: EquationGroup[]): RunSummary => {
  let computed = 0;
  let needsAttention = 0;
  let skipped = 0;
  let notRun = 0;
  for (const g of groups) {
    if (g.status === "computed") computed += 1;
    else if (g.status === "partial" || g.status === "failed") needsAttention += 1;
    else if (g.status === "skipped") skipped += 1;
    else notRun += 1;
  }
  const tone: RunSummary["tone"] =
    computed + needsAttention + skipped === 0
      ? "idle"
      : needsAttention > 0
        ? "attention"
        : "ok";
  return { computed, needsAttention, skipped, notRun, total: groups.length, tone };
};

/** Collect resolver warnings across all runs, deduplicated. */
export const collectWarnings = (runs: EquipmentRunMap): string[] => {
  const seen = new Set<string>();
  for (const er of Object.values(runs)) {
    for (const w of er.run?.summary?.warnings ?? []) seen.add(w);
  }
  return Array.from(seen);
};

/** Flatten every equipment's results (for the report table / download). */
export const flattenResults = (runs: EquipmentRunMap): CalculationResult[] =>
  Object.values(runs).flatMap((er) => er.results);

type BadgeTone = { label: string; className: string };

/** Explicit static colors (per the webapp static-theme rule — no semantic tokens). */
export const groupStatusBadge = (status: EquationGroupStatus): BadgeTone => {
  switch (status) {
    case "computed":
      return { label: "Computed", className: "bg-green-100 text-green-700" };
    case "partial":
      return { label: "Needs attention", className: "bg-amber-100 text-amber-700" };
    case "failed":
      return { label: "Failed", className: "bg-red-100 text-red-700" };
    case "skipped":
      return { label: "Skipped", className: "bg-slate-100 text-slate-600" };
    case "not_run":
    default:
      return { label: "Not run yet", className: "bg-slate-100 text-slate-500" };
  }
};

export const resultStatusBadge = (status: EquationResultStatus): BadgeTone => {
  switch (status) {
    case "success":
      return { label: "OK", className: "bg-green-100 text-green-700" };
    case "warning":
      return { label: "Warning", className: "bg-amber-100 text-amber-700" };
    case "failed":
      return { label: "Failed", className: "bg-red-100 text-red-700" };
    case "skipped":
    default:
      return { label: "Skipped", className: "bg-slate-100 text-slate-600" };
  }
};

/** Build the equipment reference list from placed components. */
export const equipmentRefsFromComponents = (
  components: Array<{
    id: string;
    name: string;
    type: string;
    category?: string;
    instanceId?: number | string | null;
  }>
): EquipmentRef[] =>
  components
    .filter((c) => c.type === "equipment" && c.instanceId != null)
    .map((c) => ({
      instanceId: Number(c.instanceId),
      name: c.name,
      componentId: c.category,
      nodeId: c.id,
    }))
    .filter((e) => Number.isFinite(e.instanceId));
