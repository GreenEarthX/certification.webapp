"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { nextPaint } from "@/lib/reports/format";
import {
  REPORT_REGISTRY,
  type ReportDefinition,
} from "@/lib/reports/registry";
import type { ReportBodyBase, ReportTypeId } from "@/lib/reports/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Resolved at click time — it lives on a window global, not in state. */
  digitalTwinId: number | null;
};

type View =
  | { kind: "picker" }
  | { kind: "generating"; reportId: ReportTypeId; stageIndex: number }
  | { kind: "preview"; reportId: ReportTypeId; data: ReportBodyBase }
  | { kind: "error"; reportId: ReportTypeId; message: string };

const TOOLTIP_CLASS =
  "bg-white text-slate-700 border border-slate-200 shadow-md";

export default function ReportsDialog({
  open,
  onOpenChange,
  digitalTwinId,
}: Props) {
  const [view, setView] = useState<View>({ kind: "picker" });
  const [pdfBusy, setPdfBusy] = useState(false);

  // Every generate POST mints a new document reference and writes an audit
  // row, so a double-click must not fire twice.
  const inFlight = useRef(false);
  const openRef = useRef(open);
  const cache = useRef<Partial<Record<ReportTypeId, ReportBodyBase>>>({});

  useEffect(() => {
    openRef.current = open;
    if (open) setView({ kind: "picker" });
  }, [open]);

  const run = useCallback(
    async (def: ReportDefinition, force = false) => {
      if (!def.generate || inFlight.current) return;
      if (!digitalTwinId) {
        toast.error("Save the plant model before generating a report.");
        return;
      }

      const cached = cache.current[def.id];
      if (cached && !force) {
        setView({ kind: "preview", reportId: def.id, data: cached });
        return;
      }

      inFlight.current = true;
      setView({ kind: "generating", reportId: def.id, stageIndex: 0 });

      try {
        const data = await def.generate(digitalTwinId);
        if (!openRef.current) return;

        setView({ kind: "generating", reportId: def.id, stageIndex: 1 });
        await nextPaint();
        setView({ kind: "generating", reportId: def.id, stageIndex: 2 });
        await nextPaint();

        cache.current[def.id] = data;
        setView({ kind: "preview", reportId: def.id, data });

        if (data.warnings?.length) {
          toast.warning(
            `${data.warnings.length} note${data.warnings.length === 1 ? "" : "s"} — see the end of the report.`
          );
        }
      } catch (e) {
        if (!openRef.current) return;
        setView({
          kind: "error",
          reportId: def.id,
          message:
            e instanceof Error ? e.message : "Report generation failed.",
        });
        toast.error("Could not generate the report.");
      } finally {
        inFlight.current = false;
      }
    },
    [digitalTwinId]
  );

  const download = useCallback(async (def: ReportDefinition, data: ReportBodyBase) => {
    if (!def.toPdf || pdfBusy) return;
    setPdfBusy(true);
    // The jsPDF build is synchronous and blocks the main thread; let the
    // spinner paint before it starts.
    await nextPaint();
    try {
      const filename = await def.toPdf(data);
      toast.success(`Saved ${filename}`);
    } catch {
      toast.error("Could not build the PDF.");
    } finally {
      setPdfBusy(false);
    }
  }, [pdfBusy]);

  const active =
    view.kind !== "picker"
      ? REPORT_REGISTRY.find((r) => r.id === view.reportId)
      : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0">
        {/* ── Picker ─────────────────────────────────────────────────── */}
        {view.kind === "picker" && (
          <>
            <DialogHeader className="border-b border-slate-200 px-6 py-5 text-left">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Generate a report
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Documents are generated from the current plant variation.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 overflow-y-auto px-6 py-6 sm:grid-cols-3">
              <TooltipProvider delayDuration={120}>
                {REPORT_REGISTRY.map((def) => {
                  const Icon = def.icon;
                  const disabled = def.status !== "available";

                  const card = (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => run(def)}
                      className={
                        disabled
                          ? "flex h-full w-full cursor-not-allowed flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 text-left opacity-60"
                          : "flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#0F766E] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0F766E]/40"
                      }
                    >
                      <span
                        className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${def.accent}1A` }}
                      >
                        <Icon
                          className="h-[18px] w-[18px]"
                          style={{ color: def.accent }}
                        />
                      </span>
                      <span className="text-[15px] font-semibold leading-tight text-slate-900">
                        {def.title}
                      </span>
                      <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {def.subtitle}
                      </span>
                      <span className="mt-2 text-xs leading-relaxed text-slate-500">
                        {def.description}
                      </span>
                      <span
                        className={`mt-4 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          disabled
                            ? "bg-slate-200 text-slate-500"
                            : "bg-[#0F766E] text-white"
                        }`}
                      >
                        {disabled ? "Coming soon" : "Generate"}
                      </span>
                    </button>
                  );

                  if (!disabled) return <div key={def.id}>{card}</div>;

                  return (
                    <Tooltip key={def.id}>
                      {/* A disabled button swallows pointer events, so the
                          trigger has to wrap it in a live element. */}
                      <TooltipTrigger asChild>
                        <span className="block h-full">{card}</span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className={TOOLTIP_CLASS}>
                        {def.comingSoonNote ?? "Coming soon"}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </>
        )}

        {/* ── Generating ─────────────────────────────────────────────── */}
        {view.kind === "generating" && active?.stages && (
          <>
            <DialogHeader className="border-b border-slate-200 px-6 py-5 text-left">
              <DialogTitle className="text-lg font-bold text-slate-900">
                {active.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Generating the document…
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-14">
              <div className="mx-auto max-w-md">
                <Progress
                  value={active.stages[view.stageIndex].weight}
                  className="h-2 w-full bg-slate-200 [&>div]:bg-[#0F766E] [&>div]:transition-all [&>div]:duration-500"
                />
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    {/* The 10 -> 65 gap has no progress signal, so the bar
                        holds and the spinner carries the liveness instead of a
                        fake timed ramp. */}
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0F766E]" />
                    {active.stages[view.stageIndex].label}
                  </span>
                  <span className="font-mono text-slate-400">
                    {active.stages[view.stageIndex].weight}%
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Error ──────────────────────────────────────────────────── */}
        {view.kind === "error" && active && (
          <>
            <DialogHeader className="border-b border-slate-200 px-6 py-5 text-left">
              <DialogTitle className="text-lg font-bold text-slate-900">
                {active.title}
              </DialogTitle>
            </DialogHeader>

            <div className="px-6 py-12 text-center">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
              <p className="text-sm font-semibold text-slate-800">
                Could not generate the report
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                {view.message}
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView({ kind: "picker" })}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button size="sm" onClick={() => run(active, true)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── Preview ────────────────────────────────────────────────── */}
        {view.kind === "preview" && active?.Preview && (
          <>
            <DialogHeader className="flex-row items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 text-left">
              <div className="min-w-0">
                <DialogTitle className="truncate text-base font-bold text-slate-900">
                  {active.title}
                </DialogTitle>
                <DialogDescription className="font-mono text-xs text-slate-500">
                  {view.data.metadata.document_reference}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setView({ kind: "picker" })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                All reports
              </Button>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto bg-slate-100 px-6 py-6">
              <active.Preview data={view.data} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <TooltipProvider delayDuration={120}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={inFlight.current}
                        onClick={() => run(active, true)}
                        className="text-slate-600"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className={TOOLTIP_CLASS}>
                    Issues a new document reference
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-center gap-2">
                  {(["XLSX", "CSV"] as const).map((fmt) => (
                    <Tooltip key={fmt}>
                      <TooltipTrigger asChild>
                        <span>
                          <Button variant="outline" size="sm" disabled>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            {fmt}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className={TOOLTIP_CLASS}>
                        Coming soon
                      </TooltipContent>
                    </Tooltip>
                  ))}

                  <Button
                    size="sm"
                    disabled={pdfBusy}
                    onClick={() => download(active, view.data)}
                  >
                    {pdfBusy ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {pdfBusy ? "Building…" : "Download PDF"}
                  </Button>
                </div>
              </TooltipProvider>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
