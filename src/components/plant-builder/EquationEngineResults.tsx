import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Play } from "lucide-react";
import type { CalculationResult } from "@/services/plant-builder/massBalance";
import {
  EquipmentRef,
  EquationGroup,
  EquipmentRunMap,
  buildEquationGroups,
  collectWarnings,
  formatValue,
  groupStatusBadge,
  resultStatusBadge,
  summarizeGroups,
  toNumber,
} from "@/lib/plant-builder/equations";

type Props = {
  runs: EquipmentRunMap;
  equipment: EquipmentRef[];
  /** instanceIds currently being computed (per-card spinners). */
  computingIds: Set<number>;
  onRunEquipment: (instanceId: number) => void;
  onFocusComponent: (id?: string) => void;
};

/** One equation row: result line + expandable substitution ("show the math"). */
const EquationResultRow = ({ result }: { result: CalculationResult }) => {
  const [open, setOpen] = useState(false);
  const rb = resultStatusBadge(result.status);
  const isProblem = result.status === "failed" || result.status === "warning";
  const inputs = Object.entries(result.inputs ?? {});
  const expandable = inputs.length > 0;

  return (
    <div
      className={`rounded-md border px-2 py-1.5 ${
        isProblem ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={() => expandable && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 text-left ${
          expandable ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-1 min-w-0">
          {expandable ? (
            open ? (
              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            )
          ) : (
            <span className="w-3 shrink-0" />
          )}
          <span className="font-mono text-xs text-slate-800 truncate">
            {result.symbol ?? result.equation_id}
            {result.status === "success" && (
              <span className="text-slate-900 font-semibold">
                {" = "}
                {formatValue(result.value, result.canonical_unit)}
              </span>
            )}
          </span>
        </div>
        <span
          className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${rb.className}`}
        >
          {rb.label}
        </span>
      </button>

      {result.message && (
        <div className="mt-1 text-[11px] text-amber-800">{result.message}</div>
      )}

      {/* Substitution: every resolved input the engine used for this equation. */}
      {open && expandable && (
        <div className="mt-1.5 rounded border border-slate-200 bg-white px-2 py-1.5">
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-1">
            Resolved inputs
          </div>
          <div className="flex flex-wrap gap-1">
            {inputs.map(([sym, snap]) => (
              <span
                key={sym}
                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
              >
                {sym} = {snap.value === null || snap.value === undefined ? "missing" : formatValue(snap.value)}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.equation_id && (
        <div className="mt-0.5 pl-4 text-[10px] text-slate-400">{result.equation_id}</div>
      )}
    </div>
  );
};

const EquationGroupCard = ({
  group,
  isComputing,
  disabled,
  onRun,
  onFocusComponent,
}: {
  group: EquationGroup;
  isComputing: boolean;
  disabled: boolean;
  onRun: () => void;
  onFocusComponent: (id?: string) => void;
}) => {
  const [open, setOpen] = useState(
    group.status === "failed" || group.status === "partial"
  );
  const badge = groupStatusBadge(group.status);
  const focusable = Boolean(group.nodeId);
  const finishedAt = group.run?.run?.finished_at;

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="w-full flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => group.results.length > 0 && setOpen((v) => !v)}
          className="flex items-center gap-2 min-w-0 text-left flex-1"
        >
          {group.results.length > 0 ? (
            open ? (
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            )
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {group.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {group.componentId ? `${group.componentId} · ` : ""}
              {group.results.length > 0
                ? `${group.results.length} equation${group.results.length === 1 ? "" : "s"}`
                : "Not computed yet"}
              {finishedAt
                ? ` · ${new Date(finishedAt).toLocaleTimeString()}`
                : ""}
            </div>
          </div>
        </button>

        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.className}`}
        >
          {badge.label}
        </span>

        {/* Per-equipment Run button */}
        <button
          type="button"
          onClick={onRun}
          disabled={disabled || isComputing}
          title="Run the mass-balance equations for this equipment"
          className={`shrink-0 flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${
            disabled || isComputing
              ? "border-slate-200 text-slate-400 cursor-not-allowed"
              : "border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E]/10"
          }`}
        >
          {isComputing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          {isComputing ? "Running" : "Run"}
        </button>
      </div>

      {open && group.results.length > 0 && (
        <div className="px-3 pb-3 space-y-1.5">
          {group.results.map((r) => (
            <EquationResultRow key={r.id} result={r} />
          ))}
          {focusable && (
            <button
              type="button"
              onClick={() => onFocusComponent(group.nodeId)}
              className="text-[11px] text-[#0F766E] hover:underline"
            >
              Focus on canvas
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const EquationEngineResults = ({
  runs,
  equipment,
  computingIds,
  onRunEquipment,
  onFocusComponent,
}: Props) => {
  const groups = useMemo(
    () => buildEquationGroups(runs, equipment),
    [runs, equipment]
  );
  const summary = useMemo(() => summarizeGroups(groups), [groups]);
  const warnings = useMemo(() => collectWarnings(runs), [runs]);

  if (equipment.length === 0) {
    return (
      <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-2">
        Place equipment on the canvas to compute mass-balance equations.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary chips */}
      {summary.tone !== "idle" && (
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
            {summary.computed} computed
          </span>
          {summary.needsAttention > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
              {summary.needsAttention} need attention
            </span>
          )}
          {summary.skipped > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
              {summary.skipped} skipped
            </span>
          )}
          {summary.notRun > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
              {summary.notRun} not run
            </span>
          )}
        </div>
      )}

      {warnings.length > 0 && (
        <details className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-2">
          <summary className="cursor-pointer font-medium">
            {warnings.length} resolver warning{warnings.length === 1 ? "" : "s"}
          </summary>
          <ul className="mt-1 space-y-0.5 list-disc list-inside">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </details>
      )}

      {/* Per-equipment groups, each with its own Run button */}
      <div className="space-y-2">
        {groups.map((g) => (
          <EquationGroupCard
            key={g.instanceId}
            group={g}
            isComputing={computingIds.has(g.instanceId)}
            disabled={false}
            onRun={() => onRunEquipment(g.instanceId)}
            onFocusComponent={onFocusComponent}
          />
        ))}
      </div>
    </div>
  );
};

export default EquationEngineResults;
