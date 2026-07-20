'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Connection, PlacedComponent } from "@/app/plant-operator/plant-builder/types";
import {
  fetchComponentPorts,
  type PortDto,
} from "@/services/plant-builder/componentDefinitions";

type ConnectionDetailDialogProps = {
  connection: Connection;
  components: PlacedComponent[];
  open: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    type: string,
    reason: string,
    data: any,
    port_id?: string
  ) => void;
  onDelete: (id: string) => void;
};

const NONE = "__none__";

const ConnectionDetailDialog = ({
  connection,
  components,
  open,
  onClose,
  onSave,
  onDelete,
}: ConnectionDetailDialogProps) => {
  const fromComp = components.find((c) => c.id === connection.from);
  const toComp = components.find((c) => c.id === connection.to);

  // The stream attaches to a port on the EQUIPMENT endpoint; the other endpoint
  // is the carrier we filter that equipment's ports against.
  const equipment =
    fromComp?.type === "equipment"
      ? fromComp
      : toComp?.type === "equipment"
        ? toComp
        : null;
  const carrier =
    fromComp?.type === "carrier"
      ? fromComp
      : toComp?.type === "carrier"
        ? toComp
        : null;
  // Direction relative to the equipment: IN when equipment is the target.
  const direction: "IN" | "OUT" =
    equipment && equipment.id === connection.to ? "IN" : "OUT";

  const [quantity, setQuantity] = useState<string>(
    connection.data?.quantity != null ? String(connection.data.quantity) : ""
  );
  const [unit, setUnit] = useState<string>(connection.data?.unit ?? "");
  const [portId, setPortId] = useState<string>(connection.port_id ?? NONE);
  const [ports, setPorts] = useState<PortDto[]>([]);
  const [portsLoading, setPortsLoading] = useState(false);

  useEffect(() => {
    setQuantity(
      connection.data?.quantity != null ? String(connection.data.quantity) : ""
    );
    setUnit(connection.data?.unit ?? "");
    setPortId(connection.port_id ?? NONE);
  }, [connection]);

  // Load the equipment's ports and keep only those compatible with this
  // stream's direction and connected carrier.
  useEffect(() => {
    if (!open || !equipment?.componentDefinitionId) {
      setPorts([]);
      return;
    }
    let cancelled = false;
    setPortsLoading(true);
    void (async () => {
      try {
        const all = await fetchComponentPorts(equipment.componentDefinitionId!);
        if (cancelled) return;
        const carrierBiz = carrier?.category;
        const compatible = all.filter(
          (p) =>
            p.direction === direction &&
            (!carrierBiz ||
              p.carriers.some((c) => c.component_id === carrierBiz))
        );
        setPorts(compatible);
      } catch {
        if (!cancelled) setPorts([]);
      } finally {
        if (!cancelled) setPortsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, equipment?.componentDefinitionId, carrier?.category, direction]);

  const ambiguous = ports.length > 1;

  const nameOf = (c?: PlacedComponent) => c?.name ?? "Unknown";

  const handleSave = () => {
    const q = quantity.trim() === "" ? undefined : Number(quantity);
    const data = {
      ...(connection.data || {}),
      ...(q != null && Number.isFinite(q) ? { quantity: q } : {}),
      ...(unit.trim() ? { unit: unit.trim() } : {}),
    };
    onSave(
      connection.id,
      connection.type || "",
      connection.reason || "",
      data,
      portId === NONE ? undefined : portId
    );
  };

  const helper = useMemo(() => {
    if (!equipment) return "This stream is not attached to an equipment port.";
    if (portsLoading) return "Loading ports…";
    if (ports.length === 0)
      return `No ${direction} ports on ${nameOf(equipment)} accept this carrier.`;
    if (ambiguous)
      return "This carrier fits several ports — pick one so the equations resolve deterministically.";
    return "Port auto-matches; set it explicitly to be safe.";
  }, [equipment, portsLoading, ports.length, ambiguous, direction]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Stream Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            From: <span className="font-medium">{nameOf(fromComp)}</span> →{" "}
            <span className="font-medium">{nameOf(toComp)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Flow quantity + unit — the stream_flow_value the engine reads. */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-600">Flow quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="bg-white border-slate-300"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-600">Unit</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="t/h"
                className="bg-white border-slate-300"
              />
            </div>
          </div>

          {/* Equipment-side port. */}
          {equipment && (
            <div>
              <Label className="text-xs text-slate-600">
                Port on {nameOf(equipment)} ({direction})
              </Label>
              <Select value={portId} onValueChange={setPortId}>
                <SelectTrigger
                  className={`bg-white ${ambiguous && portId === NONE ? "border-amber-400" : "border-slate-300"}`}
                >
                  <SelectValue placeholder="Select a port" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300">
                  <SelectItem value={NONE}>Auto / unset</SelectItem>
                  {ports.map((p) => (
                    <SelectItem key={p.port_id ?? p.id} value={p.port_id ?? String(p.id)}>
                      {(p.port_id ? `${p.port_id} · ` : "") + p.port_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p
                className={`mt-1 text-[11px] ${ambiguous && portId === NONE ? "text-amber-700" : "text-slate-500"}`}
              >
                {helper}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between gap-3 mt-5">
          <Button
            variant="outline"
            onClick={() => onDelete(connection.id)}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#0F766E] hover:bg-[#0C5F59] text-white"
          >
            Save Stream
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionDetailDialog;
