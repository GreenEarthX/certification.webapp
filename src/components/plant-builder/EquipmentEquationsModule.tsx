'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Info, Loader2, Play, RefreshCw, Sigma } from "lucide-react";
import toast from "react-hot-toast";
import {
  computeEquipment,
  fetchEquipmentEquations,
  fetchResolutionPreview,
  type CalculationResult,
  type EquationDefinition,
  type EquationDefParameter,
  type EquipmentPreview,
} from "@/services/plant-builder/massBalance";
import { formatValue, resultStatusBadge, toNumber } from "@/lib/plant-builder/equations";
import { updateComponentInstance } from "@/services/plant-builder/componentInstances";

type Props = {
  /** Business component id of the equipment type, e.g. "E166". */
  componentId?: string;
  /** component_instances.id — required to run. */
  instanceId?: number;
  /** Current (possibly unsaved) form values; saved before each run. */
  getFieldValues: () => Record<string, any>;
  /** Push computed outputs back into the visible form fields. */
  onComputedFields: (fields: Record<string, number>) => void;
};

const roleBadge = (role?: string) =>
  role === "output"
    ? "bg-[#0F766E]/10 text-[#0F766E]"
    : "bg-slate-100 text-slate-600";

type SourceHint = {
  /** short origin label */
  origin: string;
  /** the concrete field/target the user should look at, if any */
  field?: string;
  /** true when the USER must type this value into the equipment form */
  userInput: boolean;
};

/**
 * Turn a parameter's resolution source into human guidance: where the value
 * comes from and — crucially — the exact field name to fill or look at.
 */
const describeSource = (
  source: EquationDefParameter["source"] | undefined
): SourceHint | null => {
  if (!source) return null;
  const f = source.field_name && source.field_name !== "-" ? source.field_name : undefined;
  const port = source.port_id ? ` · port ${source.port_id}` : "";
  switch (source.param_source) {
    case "equipment_dictionary":
      return { origin: "Equipment form field", field: f, userInput: true };
    case "carrier_dictionary":
      return { origin: `Connected carrier${port}`, field: f, userInput: false };
    case "stream_flow_value":
      return { origin: `Stream flow${port}`, field: undefined, userInput: false };
    case "plant_settings":
      return { origin: "Plant settings", field: f, userInput: false };
    case "default_library":
      return {
        origin: "Default library (constant)",
        field: source.param_id || source.symbol,
        userInput: false,
      };
    case "equation_result":
      return {
        origin: "Computed by another equation",
        field: source.produced_by
          ? `${source.produced_by} → ${source.symbol ?? ""}`.trim()
          : source.symbol,
        userInput: false,
      };
    case "intermediate":
      return { origin: "Computed in this run", field: undefined, userInput: false };
    default:
      return { origin: source.param_source ?? "Unknown source", field: f, userInput: false };
  }
};

/** One equation: definition + (optional) latest result.
 *  Two independent disclosures: the row expands to "show the math" (resolved
 *  inputs); the (i) icon reveals the plain-language description + what every
 *  symbol means (parameter definitions from equipment_equations). */
const EquationRow = ({
  def,
  result,
}: {
  def: EquationDefinition | null;
  result: CalculationResult | null;
}) => {
  const [open, setOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const status = result?.status ?? null;
  const rb = status ? resultStatusBadge(status) : null;
  const isProblem = status === "failed" || status === "warning";
  const inputs = Object.entries(result?.inputs ?? {});
  const expression = def?.expression ?? result?.symbol ?? "";
  const equationId = def?.equation_id ?? result?.equation_id ?? "";
  const params = def?.parameters ?? [];
  const paramBySymbol = useMemo(
    () => new Map(params.map((p) => [p.symbol, p])),
    [params]
  );
  const hasInfo = Boolean(def?.description) || params.length > 0;
  const hasResults = inputs.length > 0 || Boolean(result?.message);

  return (
    <div
      className={`rounded-md border ${
        isProblem ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2 px-2.5 py-2">
        <button
          type="button"
          onClick={() => hasResults && setOpen((v) => !v)}
          className={`flex items-start gap-1.5 min-w-0 text-left flex-1 ${
            hasResults ? "cursor-pointer" : "cursor-default"
          }`}
        >
          {hasResults ? (
            open ? (
              <ChevronDown className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-slate-400 shrink-0" />
            )
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <div className="min-w-0">
            <div className="font-mono text-[11px] text-slate-800 break-words">
              {expression}
            </div>
            {result?.status === "success" && (
              <div className="font-mono text-xs font-semibold text-[#0F766E] mt-0.5">
                {result.symbol} = {formatValue(result.value, result.canonical_unit)}
              </div>
            )}
          </div>
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-slate-400">{equationId}</span>
          {rb ? (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${rb.className}`}
            >
              {rb.label}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
              Not run
            </span>
          )}
          {hasInfo && (
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              aria-label="What this equation means"
              title="What this equation means"
              className={`rounded-full p-0.5 transition-colors ${
                showInfo
                  ? "text-[#0F766E] bg-[#0F766E]/10"
                  : "text-slate-400 hover:text-[#0F766E] hover:bg-slate-100"
              }`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Info disclosure: description + meaning of every symbol. */}
      {showInfo && hasInfo && (
        <div className="mx-2.5 mb-2 rounded border border-[#0F766E]/20 bg-[#0F766E]/5 px-2.5 py-2 space-y-2">
          {def?.description && (
            <p className="text-[11px] leading-snug text-slate-700">{def.description}</p>
          )}
          {def?.equation_type && (
            <div className="text-[10px] text-slate-400">
              Type: <span className="text-slate-500">{def.equation_type}</span>
            </div>
          )}
          {params.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                Parameters — where each value comes from
              </div>
              {params.map((p) => {
                const hint = describeSource(p.source);
                return (
                  <div
                    key={p.symbol}
                    className="text-[11px] leading-snug rounded border border-slate-200 bg-white px-2 py-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-slate-800 font-semibold">
                        {p.symbol}
                      </span>
                      <span
                        className={`px-1 py-0.5 rounded text-[9px] font-medium ${roleBadge(
                          p.role
                        )}`}
                      >
                        {p.role}
                      </span>
                      {p.unit_family && (
                        <span className="text-[9px] text-slate-400">{p.unit_family}</span>
                      )}
                      {hint?.userInput && (
                        <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-700">
                          You input this
                        </span>
                      )}
                    </div>
                    {p.definition && (
                      <p className="text-slate-600 mt-0.5">{p.definition}</p>
                    )}
                    {hint && (
                      <div className="mt-1 flex flex-wrap items-baseline gap-1 text-[10px]">
                        <span className="text-slate-400">Source:</span>
                        <span className="font-medium text-slate-600">{hint.origin}</span>
                        {hint.field && (
                          <>
                            <span className="text-slate-300">→</span>
                            <span className="font-mono text-[#0F766E]">{hint.field}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Results disclosure: the actual substitution + what's still missing. */}
      {open && hasResults && (
        <div className="px-2.5 pb-2.5 space-y-1.5">
          {result?.message && (
            <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              {result.message}
            </div>
          )}
          {inputs.length > 0 && (
            <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                Inputs
              </div>
              <div className="space-y-0.5">
                {inputs.map(([sym, snap]) => {
                  const resolved =
                    snap.value !== null && snap.value !== undefined;
                  const p = paramBySymbol.get(sym);
                  const hint = describeSource(p?.source);
                  return (
                    <div
                      key={sym}
                      className="flex flex-wrap items-baseline gap-x-1.5 text-[10px]"
                    >
                      <span className="font-mono text-slate-700">{sym}</span>
                      {resolved ? (
                        <span className="font-mono font-semibold text-[#0F766E]">
                          = {formatValue(snap.value)}
                        </span>
                      ) : (
                        <>
                          <span className="font-semibold text-red-600">missing</span>
                          {hint && (
                            <span className="text-slate-500">
                              — {hint.origin}
                              {hint.field ? (
                                <span className="font-mono text-red-600"> → {hint.field}</span>
                              ) : (
                                ""
                              )}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EquipmentEquationsModule = ({
  componentId,
  instanceId,
  getFieldValues,
  onComputedFields,
}: Props) => {
  const [definitions, setDefinitions] = useState<EquationDefinition[]>([]);
  const [preview, setPreview] = useState<EquipmentPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const twinId = useMemo(() => {
    const id = Number((window as any).currentTwinId);
    return id && !Number.isNaN(id) ? id : null;
  }, []);

  // Save the current form (so the engine resolves against what the user sees),
  // then dry-run the resolver and show live values / missing-input hints.
  const refreshPreview = useCallback(
    async (opts?: { saveForm?: boolean; silent?: boolean }) => {
      if (!twinId || !instanceId) return;
      if (!opts?.silent) setIsRefreshing(true);
      try {
        if (opts?.saveForm) {
          await updateComponentInstance(instanceId, {
            field_values: getFieldValues(),
          });
        }
        const p = await fetchResolutionPreview(twinId, instanceId);
        setPreview(p);
      } catch {
        /* preview is best-effort */
      } finally {
        if (!opts?.silent) setIsRefreshing(false);
      }
    },
    [twinId, instanceId, getFieldValues]
  );

  // Load equation definitions (by equipment type) + an initial live preview.
  useEffect(() => {
    if (!componentId) return;
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const defs = await fetchEquipmentEquations(componentId);
        if (!cancelled) setDefinitions(defs);
      } catch {
        if (!cancelled) setDefinitions([]);
      }
      await refreshPreview({ silent: true });
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [componentId, instanceId, twinId, refreshPreview]);

  const handleRun = useCallback(async () => {
    if (!twinId) {
      toast.error("No digital twin loaded. Save or reload the plant model first.");
      return;
    }
    if (!instanceId) {
      toast.error("Save the component first, then run its equations.");
      return;
    }
    setIsRunning(true);
    try {
      // Persist the form so the run resolves exactly what the user sees.
      await updateComponentInstance(instanceId, { field_values: getFieldValues() });
      await computeEquipment(twinId, instanceId);
      const p = await fetchResolutionPreview(twinId, instanceId);
      setPreview(p);

      // Reflect computed equipment outputs into the visible form fields.
      const computed: Record<string, number> = {};
      for (const r of p.results) {
        const n = toNumber(r.value);
        if (
          r.status === "success" &&
          n !== null &&
          r.target?.source === "equipment_dictionary" &&
          r.target?.field_name
        ) {
          computed[r.target.field_name] = n;
        }
      }
      if (Object.keys(computed).length > 0) onComputedFields(computed);

      const { success, skipped, failed } = p.counts;
      if (failed > 0) toast.error(`${success} computed · ${failed} failed.`);
      else if (skipped > 0)
        toast(`${success} computed · ${skipped} skipped (missing inputs).`);
      else toast.success(`${success} equation${success === 1 ? "" : "s"} computed.`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to run the equations.");
    } finally {
      setIsRunning(false);
    }
  }, [twinId, instanceId, getFieldValues, onComputedFields]);

  // Merge: definitions drive the list; live preview results matched by equation_id.
  const rows = useMemo(() => {
    const byEq = new Map<string, CalculationResult>();
    for (const r of preview?.results ?? []) {
      if (r.equation_id) byEq.set(r.equation_id, r);
    }
    const out: Array<{ key: string; def: EquationDefinition | null; result: CalculationResult | null }> =
      definitions.map((d) => {
        const result = byEq.get(d.equation_id) ?? null;
        byEq.delete(d.equation_id);
        return { key: d.equation_id, def: d, result };
      });
    for (const [eqId, r] of byEq.entries()) {
      out.push({ key: eqId, def: null, result: r });
    }
    return out;
  }, [definitions, preview]);

  const okCount = preview?.counts.success ?? 0;

  if (!componentId) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 flex items-center gap-2 text-xs text-slate-500">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-[#0F766E]" />
        Loading equipment definition…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col min-h-0">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <Sigma className="h-4 w-4 text-[#0F766E] shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">
              Mass Balance Equations
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {isLoading
                ? "Loading…"
                : `${rows.length} equation${rows.length === 1 ? "" : "s"}`}
              {preview
                ? ` · ${okCount} resolvable${preview.counts.skipped ? ` · ${preview.counts.skipped} need inputs` : ""}`
                : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => refreshPreview({ saveForm: true })}
            disabled={isRefreshing || isRunning || isLoading}
            title="Save the form and re-check which inputs resolve (no run saved)"
            className={`flex items-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold ${
              isRefreshing || isRunning || isLoading
                ? "border-slate-200 text-slate-400 cursor-not-allowed"
                : "border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Preview
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || isLoading || rows.length === 0}
            title="Save the form and run this equipment's mass-balance equations"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm ${
              isRunning || isLoading || rows.length === 0
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-[#0F766E] hover:bg-[#0C5F59]"
            }`}
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {isRunning ? "Running…" : "Run"}
          </button>
        </div>
      </div>

      <div className="p-2.5 space-y-1.5 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 px-1 py-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-[#0F766E]" />
            Loading equations…
          </div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-slate-500 px-1 py-2">
            No equations defined for this equipment type yet.
          </p>
        ) : (
          rows.map(({ key, def, result }) => (
            <EquationRow key={key} def={def} result={result} />
          ))
        )}
      </div>
    </div>
  );
};

export default EquipmentEquationsModule;
