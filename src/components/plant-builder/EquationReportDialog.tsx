import { useMemo } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  EquipmentRef,
  EquipmentRunMap,
  buildEquationGroups,
  flattenResults,
  formatValue,
  groupStatusBadge,
  resultStatusBadge,
} from "@/lib/plant-builder/equations";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runs: EquipmentRunMap;
  equipment: EquipmentRef[];
  isComputing: boolean;
  plantName?: string;
};

const EquationReportDialog = ({
  open,
  onOpenChange,
  runs,
  equipment,
  isComputing,
  plantName,
}: Props) => {
  const nameByInstance = useMemo(() => {
    const m = new Map<number, string>();
    for (const e of equipment) m.set(e.instanceId, e.name);
    return m;
  }, [equipment]);

  const results = useMemo(() => flattenResults(runs), [runs]);
  const runCount = useMemo(
    () => Object.values(runs).filter((r) => r.run != null).length,
    [runs]
  );

  const handleDownload = () => {
    if (results.length === 0) return;
    try {
      const BRAND: [number, number, number] = [161, 203, 53]; // #A1CB35
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 14;
      const contentWidth = pageWidth - marginX * 2;
      let y = 0;

      const finalY = () =>
        (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
          ?.finalY ?? y;
      const newPageIfNeeded = (needed: number) => {
        if (y + needed > pageHeight - 14) {
          doc.addPage();
          y = 16;
        }
      };

      // ── Header band ───────────────────────────────────────────────
      doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
      doc.rect(0, 0, pageWidth, 26, "F");
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Equation Report", marginX, 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(plantName || "Plant Model", marginX, 19);
      doc.setFontSize(8);
      doc.text(
        `Generated ${new Date().toLocaleString()}   ·   ${runCount} equipment run${
          runCount === 1 ? "" : "s"
        }   ·   ${results.length} equation${results.length === 1 ? "" : "s"}`,
        marginX,
        24
      );
      y = 34;

      const groups = buildEquationGroups(runs, equipment);

      for (const group of groups) {
        newPageIfNeeded(26);

        // Section heading bar
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(marginX, y, contentWidth, 9, "F");
        doc.setFillColor(BRAND[0], BRAND[1], BRAND[2]);
        doc.rect(marginX, y, 1.5, 9, "F"); // left accent
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(group.name || `Equipment #${group.instanceId}`, marginX + 4, y + 6);
        const badgeText = groupStatusBadge(group.status).label;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          badgeText,
          pageWidth - marginX - doc.getTextWidth(badgeText),
          y + 6
        );
        y += 12;

        // Run meta line
        const run = group.run?.run ?? null;
        const metaBits: string[] = [`Instance #${group.instanceId}`];
        if (group.componentId) metaBits.unshift(`Component ${group.componentId}`);
        if (run?.finished_at)
          metaBits.push(`Computed ${new Date(run.finished_at).toLocaleString()}`);
        if (run?.summary)
          metaBits.push(
            `${run.summary.success ?? 0} ok · ${run.summary.failed ?? 0} failed · ${
              run.summary.skipped ?? 0
            } skipped`
          );
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(metaBits.join("    ·    "), marginX, y);
        y += 4;

        if (group.results.length === 0) {
          newPageIfNeeded(10);
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text("No equations computed for this equipment.", marginX, y + 4);
          y += 12;
          continue;
        }

        // ── Outputs table ───────────────────────────────────────────
        autoTable(doc, {
          startY: y,
          margin: { left: marginX, right: marginX },
          head: [["Equation", "Symbol", "Output value", "Status", "Notes"]],
          body: group.results.map((r) => [
            r.equation_id ?? "—",
            r.symbol ?? "—",
            r.status === "success" ? formatValue(r.value, r.canonical_unit) : "—",
            resultStatusBadge(r.status).label,
            r.message ?? "",
          ]),
          styles: { fontSize: 8, cellPadding: 1.6, overflow: "linebreak" },
          headStyles: {
            fillColor: BRAND,
            textColor: [31, 41, 59],
            fontStyle: "bold",
          },
          columnStyles: {
            0: { cellWidth: 26 },
            1: { cellWidth: 24 },
            2: { cellWidth: 36 },
            3: { cellWidth: 20 },
          },
          theme: "grid",
        });
        y = finalY() + 5;

        // ── Inputs tables (one per equation that has resolved inputs) ─
        for (const r of group.results) {
          const inputs = r.inputs ? Object.entries(r.inputs) : [];
          if (inputs.length === 0) continue;
          newPageIfNeeded(16);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          doc.text(
            `Inputs · ${r.symbol ?? r.equation_id ?? "equation"}`,
            marginX,
            y
          );
          doc.setFont("helvetica", "normal");
          y += 2;
          autoTable(doc, {
            startY: y,
            margin: { left: marginX, right: marginX },
            head: [["Symbol", "Value", "Status", "Source"]],
            body: inputs.map(([sym, resolved]) => [
              sym,
              formatValue(resolved.value),
              resolved.status,
              resolved.via ?? "",
            ]),
            styles: { fontSize: 7.5, cellPadding: 1.4, overflow: "linebreak" },
            headStyles: {
              fillColor: [226, 232, 240],
              textColor: [51, 65, 85],
              fontStyle: "bold",
            },
            columnStyles: {
              0: { cellWidth: 30 },
              1: { cellWidth: 28 },
              2: { cellWidth: 22 },
            },
            theme: "striped",
          });
          y = finalY() + 5;
        }
        y += 3;
      }

      doc.save(
        `equation-report-${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-")}.pdf`
      );
      toast.success("Equation report downloaded.");
    } catch {
      toast.error("Could not download the report.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Equation Report</DialogTitle>
          <DialogDescription>
            {results.length > 0
              ? `${runCount} equipment run${runCount === 1 ? "" : "s"} · ${results.length} equation${results.length === 1 ? "" : "s"}`
              : isComputing
                ? "Computing…"
                : "No equation runs available yet."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto rounded-md border border-slate-200">
          {results.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 text-center">
              {isComputing
                ? "Running the equation engine…"
                : "No results. Run equipment from the Equations panel after the process-flow checks pass."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Equipment</TableHead>
                  <TableHead>Equation</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => {
                  const rb = resultStatusBadge(r.status);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-slate-700">
                        {r.equipment_instance_id != null
                          ? nameByInstance.get(r.equipment_instance_id) ??
                            `#${r.equipment_instance_id}`
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {r.equation_id ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.symbol ?? "—"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {r.status === "success"
                          ? formatValue(r.value, r.canonical_unit)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${rb.className}`}
                        >
                          {rb.label}
                        </span>
                      </TableCell>
                      <TableCell
                        className="text-[11px] text-slate-500 max-w-[220px] truncate"
                        title={r.message ?? ""}
                      >
                        {r.message ?? ""}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={results.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EquationReportDialog;
