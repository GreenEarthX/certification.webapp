import { useMemo } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
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
  flattenResults,
  formatValue,
  resultStatusBadge,
} from "@/lib/plant-builder/equations";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runs: EquipmentRunMap;
  equipment: EquipmentRef[];
  isComputing: boolean;
};

const EquationReportDialog = ({
  open,
  onOpenChange,
  runs,
  equipment,
  isComputing,
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
      const payload = Object.entries(runs).map(([instanceId, er]) => ({
        equipment_instance_id: Number(instanceId),
        equipment_name: nameByInstance.get(Number(instanceId)) ?? null,
        run: er.run,
        results: er.results,
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `equation-report-${new Date().toISOString().slice(0, 19)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
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
            Download JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EquationReportDialog;
