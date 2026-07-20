import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { DigitalTwinValidationError, DigitalTwinValidationResult } from "@/services/plant-builder/digitalTwins";
import {
  buildEquationGroups,
  summarizeGroups,
  type EquipmentRef,
  type EquipmentRunMap,
} from "@/lib/plant-builder/equations";
import EquationEngineResults from "@/components/plant-builder/EquationEngineResults";
import { formatCheckedAt, formatValidationContext, truncateMessage } from "@/lib/plant-builder/validation";

type ValidationGroup = {
  componentId: string;
  componentName: string;
  componentType: string;
  errors: DigitalTwinValidationError[];
};

type TabKey = "structure" | "ports" | "equations";

type ValidationPanelProps = {
  validationResult: DigitalTwinValidationResult;
  validationStep: "structure" | "ports" | "equations" | null;
  groupedValidationErrors: ValidationGroup[];
  hasFocusableValidationErrors: boolean;
  isValidating: boolean;
  onClose: () => void;
  onFocusComponent: (id?: string) => void;
  onRunStructureCheck: () => void;
  onRunPortCheck: () => void;
  // Equation engine (step 3) — strictly per-equipment runs
  equationRuns: EquipmentRunMap;
  equipment: EquipmentRef[];
  computingEquipmentIds: Set<number>;
  onRunEquipment: (instanceId: number) => void;
};

const ValidationPanel = ({
  validationResult,
  validationStep,
  groupedValidationErrors,
  hasFocusableValidationErrors,
  isValidating,
  onClose,
  onFocusComponent,
  onRunStructureCheck,
  onRunPortCheck,
  equationRuns,
  equipment,
  computingEquipmentIds,
  onRunEquipment,
}: ValidationPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>(validationStep ?? "structure");

  useEffect(() => {
    if (validationStep) setActiveTab(validationStep);
  }, [validationStep]);

  // Structure/Port checks share validationResult; only show it on its own step.
  const tabResult = useMemo(() => {
    if (activeTab === "equations") return null;
    if (validationStep === activeTab) return validationResult;
    return null;
  }, [activeTab, validationResult, validationStep]);

  const isEquations = activeTab === "equations";
  const structurePassed =
    validationStep === "structure" ? validationResult.valid : validationStep !== null;
  const equationsUnlocked =
    validationStep === "equations" ||
    (validationStep === "ports" && validationResult.valid);

  const isTabValid = tabResult?.valid ?? false;
  const tabErrors = tabResult?.errors ?? [];
  const tabLabel =
    activeTab === "ports"
      ? "Port Check"
      : activeTab === "equations"
        ? "Equation Engine"
        : "Structure Check";

  // Header status is check-based for structure/ports, run-based for equations.
  const eqSummary = useMemo(
    () => summarizeGroups(buildEquationGroups(equationRuns, equipment)),
    [equationRuns, equipment]
  );
  const hasAnyEquationRun = eqSummary.tone !== "idle";
  const eqOk = hasAnyEquationRun && eqSummary.needsAttention === 0;
  const headerHasResult = isEquations ? hasAnyEquationRun : Boolean(tabResult);
  const headerValid = isEquations ? eqOk : isTabValid;

  const stepText =
    activeTab === "ports"
      ? "Step 2/3 · Port Check"
      : activeTab === "equations"
        ? "Step 3/3 · Equation Engine"
        : "Step 1/3 · Structure Check";

  return (
    <aside className="absolute top-0 right-0 h-full w-full max-w-[360px] z-30 bg-white/95 backdrop-blur border-l border-gray-200 shadow-xl flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center ${
              headerValid
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {headerValid ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {headerHasResult
                ? headerValid
                  ? `${tabLabel} ${isEquations ? "Complete" : "Passed"}`
                  : `${tabLabel} ${isEquations ? "Needs Attention" : "Failed"}`
                : `${tabLabel} Not Run`}
            </div>
            <div className="text-xs text-gray-500">
              Digital Twin #{validationResult.digitalTwinId}
            </div>
            <div className="text-[11px] text-gray-400">
              {isEquations
                ? headerHasResult
                  ? `${eqSummary.computed + eqSummary.needsAttention + eqSummary.skipped}/${eqSummary.total} equipment computed`
                  : "Run equipment to populate results"
                : tabResult
                  ? formatCheckedAt(tabResult.checkedAt)
                  : "Run a check to populate results"}
            </div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-3 pb-2 text-xs text-gray-500 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isEquations && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  isTabValid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {tabErrors.length} error{tabErrors.length === 1 ? "" : "s"}
              </span>
            )}
            <span className="text-[11px] text-gray-400">{stepText}</span>
          </div>
          {!isEquations && !isTabValid && (
            <span className="text-[11px] text-gray-400">
              {hasFocusableValidationErrors ? "Click any item to focus" : "No focusable items"}
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("structure")}
            className={`flex-1 rounded-full px-2 py-1 text-[11px] font-semibold border ${
              activeTab === "structure"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            Structure
          </button>
          <button
            type="button"
            onClick={() => {
              if (structurePassed) setActiveTab("ports");
            }}
            disabled={!structurePassed}
            className={`flex-1 rounded-full px-2 py-1 text-[11px] font-semibold border ${
              activeTab === "ports"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200"
            } ${structurePassed ? "" : "opacity-60 cursor-not-allowed"}`}
          >
            Port
          </button>
          <button
            type="button"
            onClick={() => {
              if (equationsUnlocked) setActiveTab("equations");
            }}
            disabled={!equationsUnlocked}
            className={`flex-1 rounded-full px-2 py-1 text-[11px] font-semibold border ${
              activeTab === "equations"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200"
            } ${equationsUnlocked ? "" : "opacity-60 cursor-not-allowed"}`}
          >
            Equations
          </button>
        </div>

        {/* Run-control row */}
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-700">
              {activeTab === "ports"
                ? "2. Port Check"
                : activeTab === "equations"
                  ? "3. Equation Engine"
                  : "1. Structure Check"}
            </div>
            <div className="text-[11px] text-slate-500">
              {activeTab === "ports"
                ? "Port carrier compatibility"
                : activeTab === "equations"
                  ? "Mass balance computation"
                  : "Connection type & layout rules"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                headerHasResult
                  ? headerValid
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {headerHasResult
                ? headerValid
                  ? isEquations
                    ? "Computed"
                    : "Passed"
                  : isEquations
                    ? "Attention"
                    : "Failed"
                : "Not Run"}
            </span>
            {activeTab === "equations" ? (
              <span className="text-[11px] text-slate-400">
                Run per equipment below
              </span>
            ) : activeTab === "ports" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onRunPortCheck}
                disabled={isValidating || !structurePassed}
                className="text-[11px] px-2 py-1 h-7"
              >
                Run
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={onRunStructureCheck}
                disabled={isValidating}
                className="text-[11px] px-2 py-1 h-7"
              >
                {validationStep === "structure" ? "Re-run" : "Run"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isEquations ? (
          <EquationEngineResults
            runs={equationRuns}
            equipment={equipment}
            computingIds={computingEquipmentIds}
            onRunEquipment={onRunEquipment}
            onFocusComponent={onFocusComponent}
          />
        ) : !tabResult ? (
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-2">
            Run the {tabLabel.toLowerCase()} to see detailed results.
          </div>
        ) : isTabValid ? (
          <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
            {activeTab === "ports"
              ? "Port checks passed. You can run the equation engine."
              : "Structure checks passed. Run the port check to continue."}
          </div>
        ) : (
          groupedValidationErrors.map((group) => (
            <div key={group.componentId} className="rounded-lg border border-amber-200 bg-white p-3">
              <button
                type="button"
                onClick={() => {
                  if (group.componentId === "unknown") return;
                  onFocusComponent(group.componentId);
                }}
                disabled={group.componentId === "unknown"}
                className="w-full flex items-center justify-between gap-2 text-left"
              >
                <div>
                  <div className="text-sm font-semibold text-amber-900">
                    {group.componentName}
                  </div>
                  <div className="text-xs text-amber-700 capitalize">
                    {group.componentType} · ID {group.componentId}
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-amber-200 text-amber-900 rounded-full px-2 py-0.5">
                  {group.errors.length}
                </span>
              </button>
              <div className="mt-2 space-y-2">
                {group.errors.map((err, idx) => (
                  <button
                    key={`${group.componentId}-${err.errorCode}-${idx}`}
                    type="button"
                    onClick={() => {
                      if (group.componentId === "unknown") return;
                      onFocusComponent(group.componentId);
                    }}
                    disabled={group.componentId === "unknown"}
                    className="w-full text-left text-xs text-amber-900 bg-white border border-amber-100 rounded-md px-2 py-1 hover:bg-gray-50"
                  >
                    <div className="font-semibold">{err.errorCode}</div>
                    <div className="text-amber-800" title={err.errorMessage}>
                      {truncateMessage(err.errorMessage)}
                    </div>
                    <div className="text-[10px] text-amber-700">
                      {formatValidationContext(err)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default ValidationPanel;
