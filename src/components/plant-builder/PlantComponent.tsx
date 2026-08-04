// src/components/plant-builder/PlantComponent.tsx
import { useState, useRef, useEffect } from "react";
import type { RefObject } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Building2, Zap, ArrowRightLeft, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Position, PlacedComponent } from "@/app/plant-operator/plant-builder/types";
import type { DigitalTwinValidationError } from "@/services/plant-builder/digitalTwins";

const formatValidationContext = (err: DigitalTwinValidationError) => {
  if (err.relatedComponentId) {
    return `From component ID: ${err.componentId} · To component ID: ${err.relatedComponentId}`;
  }
  return `Component ID: ${err.componentId}`;
};

interface PlantComponentProps {
  component: PlacedComponent;
  canvasOffset: { x: number; y: number };
  canvasRef: RefObject<HTMLDivElement | null>;
  zoom: number;
  isPanMode: boolean;
  onClick: () => void;
  onMove: (id: string, position: Position) => void;
  onMoveEnd: (id: string, position: Position) => void;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  isConnectingActive: boolean;
  isConnecting: boolean;
  onDelete: (id: string) => void;   // ⬅️ NEW
  validationErrors?: DigitalTwinValidationError[];
  isHighlighted?: boolean;
  gateDirection?: "input" | "output" | null;
  accentColor?: string;
  inputPorts?: Array<{
    status: "connected" | "missing";
    label?: string;
    color?: string;
    requirement?: "REQUIRED" | "OPTIONAL";
  }>;
  outputPorts?: Array<{
    status: "connected" | "missing";
    label?: string;
    color?: string;
    requirement?: "REQUIRED" | "OPTIONAL";
  }>;
}

/* Brand gate color — applied inline since Tailwind can't emit an arbitrary hex from a class. */
const GATE_COLOR = "#A1CB35";
const GATE_TINT = "#F2F7DE";
const GATE_TEXT = "#4D6B12";

/* ─────────────────────── REAL TAILWIND COLORS ─────────────────────── */
const layerColors: Record<
  string,
  { bg: string; border: string; text: string; fill: string }
> = {
  equipment: {
    bg: "bg-blue-50",
    border: "border-blue-500",
    text: "text-blue-700",
    fill: "fill-blue-600",
  },
  carrier: {
    bg: "bg-green-50",
    border: "border-green-500",
    text: "text-green-700",
    fill: "fill-green-600",
  },
  gate: {
    // Base green fallback (exact #A1CB35 border/bg applied inline via gateAccent below).
    bg: "bg-lime-50",
    border: "border-lime-500",
    text: "text-lime-800",
    fill: "fill-lime-600",
  },
};

const getGateDirection = (component: PlacedComponent) => {
  const raw =
    (component as any)?.data?.gateType ??
    (component as any)?.data?.inputOrOutput ??
    (component as any)?.data?.input_or_output ??
    (component as any)?.data?.gate_type ??
    (component as any)?.data?.gateData?.inputOrOutput;
  if (typeof raw === "string") {
    const value = raw.toLowerCase();
    if (value === "input" || value === "output") return value;
  }
  return null;
};

const carrierAccentMap: Record<string, string> = {
  air: "#94A3B8",
  "damaged crops": "#B45309",
};

const getCarrierAccent = (component: PlacedComponent) => {
  const explicit = (component as any)?.data?.color ?? (component as any)?.data?.carrierColor;
  if (typeof explicit === "string" && explicit.trim().length > 0) {
    return explicit.trim();
  }
  const raw =
    (component as any)?.data?.product ??
    (component as any)?.data?.carrier ??
    component.name ??
    "";
  const key = String(raw).trim().toLowerCase();
  return carrierAccentMap[key];
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((ch) => ch + ch).join("")
    : normalized;
  if (full.length !== 6) return null;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return null;
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};


/* ─────────────────────── ICON (always returns element) ─────────────────────── */
const getTypeIcon = (type: string, colorClass: string) => {
  switch (type) {
    case "equipment":
      return <Building2 className={`h-6 w-6 mb-1 ${colorClass}`} />;
    case "carrier":
      return <Zap className={`h-6 w-6 mb-1 ${colorClass}`} />;
    case "gate":
      return <ArrowRightLeft className={`h-6 w-6 mb-1 ${colorClass}`} />;
    default:
      return <div className={`h-6 w-6 mb-1 ${colorClass}`} />;
  }
};

/* ─────────────────────── SHAPE ─────────────────────── */
const getBaseShapeClasses = (type: string) => {
  switch (type) {
    case "equipment":
      return "w-56 h-36 rounded-lg";
    case "carrier":
      return "w-36 h-36 rounded-full";
    case "gate":
      return "w-48 h-72 rounded-md";
    default:
      return "w-48 h-32 rounded-lg";
  }
};

/* ─────────────────────── COMPONENT ─────────────────────── */
const PlantComponent = ({
  component,
  canvasOffset,
  canvasRef,
  zoom,
  isPanMode,
  onClick,
  onMove,
  onConnectStart,
  onConnectEnd,
  isConnectingActive,
  isConnecting,
  onDelete,
  onMoveEnd,
  validationErrors = [],
  isHighlighted = false,
  gateDirection: gateDirectionProp = null,
  accentColor,
  inputPorts = [],
  outputPorts = [],
}: PlantComponentProps) => {
  const [position, setPosition] = useState(component.position);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef(false);
  const ignoreClickRef = useRef(false);

  // keep local position in sync if parent updates it
  useEffect(() => {
    setPosition(component.position);
  }, [component.position]);

  const baseColors = (component.type === "gate" ? layerColors.gate : layerColors[component.type]) ?? {
    bg: "bg-gray-100",
    border: "border-gray-300",
    text: "text-gray-700",
    fill: "fill-gray-700",
  };

  const gateDirection = component.type === "gate" ? (gateDirectionProp ?? getGateDirection(component)) : null;
  const gateAccent = gateDirection === "input"
    ? { border: "#38BDF8", text: "#0284C7", bg: "#E0F2FE" }
    : gateDirection === "output"
      ? { border: "#FBBF24", text: "#B45309", bg: "#FEF3C7" }
      : component.type === "gate"
        ? { border: GATE_COLOR, text: GATE_TEXT, bg: GATE_TINT }
        : null;

  const carrierAccent = component.type === "carrier"
    ? accentColor || getCarrierAccent(component)
    : null;
  const carrierGlow = carrierAccent ? hexToRgb(carrierAccent) : null;

  const colors = baseColors;

  const glowColor = component.type === "equipment"
    ? "79, 143, 247"
    : component.type === "carrier"
      ? carrierGlow
        ? `${carrierGlow.r}, ${carrierGlow.g}, ${carrierGlow.b}`
        : "16, 185, 129"
      : null;

  const isGate = component.type === "gate";
  const baseShape = getBaseShapeClasses(component.type);
  const shapeClasses = baseShape;
  const contentClasses = "";
  const hasErrors = validationErrors.length > 0;
  const isPersisting = Boolean(component.isPersisting);

  const showLeftPort = !(isGate && gateDirection === "input");
  const showRightPort = !(isGate && gateDirection === "output");
  const showPortRail = component.type === "equipment" && (inputPorts.length > 0 || outputPorts.length > 0);
  const renderPortRail = (
    side: "left" | "right",
    ports: Array<{ status: "connected" | "missing"; label?: string; color?: string; requirement?: "REQUIRED" | "OPTIONAL" }>
  ) => {
    if (!ports.length) return null;
    return (
      <div
        className={`absolute ${side === "left" ? "-left-3" : "-right-3"} top-3 bottom-3 flex flex-col justify-between`}
      >
        <TooltipProvider delayDuration={120}>
          {ports.map((port, idx) => {
            const filled = port.status === "connected";
            const color = port.color || "#CBD5E1";
            const isOptional = port.requirement === "OPTIONAL";
            const label = port.label ?? "Port";
            return (
              <Tooltip key={`${side}-port-${idx}`}>
                <TooltipTrigger asChild>
                  <span
                    className={`h-2.5 w-4 rounded-sm border ${filled ? "shadow-sm" : ""} ${isOptional ? "border-dashed opacity-70" : ""}`}
                    style={{
                      backgroundColor: filled ? color : "#ffffff",
                      borderColor: color,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent
                  side={side === "left" ? "right" : "left"}
                  align="center"
                  sideOffset={8}
                  className="w-56 max-w-56 rounded-md border border-slate-200 bg-white p-2 shadow-lg"
                >
                  <div className="max-h-32 space-y-1 overflow-y-auto text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm border" style={{ borderColor: color, backgroundColor: filled ? color : "#ffffff" }} />
                      <span className="font-semibold text-slate-900">{label}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>{isOptional ? "Optional" : "Required"}</span>
                      <span className={filled ? "text-emerald-600" : "text-rose-600"}>{filled ? "Connected" : "Missing"}</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    );
  };

  const typeIcon = getTypeIcon(component.type, gateAccent || carrierAccent ? "" : colors.text);

  /* ───── drag ───── */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanMode) return;
    e.stopPropagation();
    didDragRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startX = (e.clientX - rect.left + canvas.scrollLeft) / zoom - position.x;
    const startY = (e.clientY - rect.top + canvas.scrollTop) / zoom - position.y;
    const originClientX = e.clientX;
    const originClientY = e.clientY;

    const move = (ev: MouseEvent) => {
      if (!didDragRef.current) {
        const dx = ev.clientX - originClientX;
        const dy = ev.clientY - originClientY;
        if (Math.hypot(dx, dy) > 4) {
          didDragRef.current = true;
        }
      }
      const newPos = {
        x: (ev.clientX - rect.left + canvas.scrollLeft) / zoom - startX,
        y: (ev.clientY - rect.top + canvas.scrollTop) / zoom - startY,
      };
      setPosition(newPos);
      onMove(component.id, {
        x: newPos.x - canvasOffset.x,
        y: newPos.y - canvasOffset.y,
      });
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      ignoreClickRef.current = didDragRef.current;
      onMoveEnd(component.id, {
        x: position.x - canvasOffset.x,
        y: position.y - canvasOffset.y,
      });
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  /* ───── ports ───── */
  const handleNodeClick = (e: React.MouseEvent, out: boolean) => {
    e.stopPropagation();
    if (isPersisting) return;
    if (out) {
      onConnectStart(component.id);
      return;
    }
    if (isConnectingActive) {
      onConnectEnd(component.id);
    }
  };

  // ❌ dynamic "-${side}-2" breaks Tailwind
  // ✅ use explicit classes so Tailwind can see them
  const nodeCls = (side: "left" | "right") =>
    [
      "absolute",
      side === "left" ? "-left-3" : "-right-3",
      "top-1/2",
      "-translate-y-1/2",
      "opacity-100",
      "transition-opacity",
      "pointer-events-auto",
    ].join(" ");

  return (
    <div
      ref={cardRef}
      data-plant-component
      className="absolute cursor-move select-none"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onMouseUp={(e) => {
        if (!isConnectingActive) return;
        e.stopPropagation();
        onConnectEnd(component.id);
      }}
      onDoubleClick={() => {
        if (ignoreClickRef.current) {
          ignoreClickRef.current = false;
          return;
        }
        onClick();
      }}
    >
      <Card
        className={`${shapeClasses} border-2 shadow-md hover:shadow-lg transition-shadow relative group flex flex-col items-center justify-center p-2 overflow-visible ${colors.border} ${colors.bg} ${
          isHighlighted ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-white" : ""
        } ${isPersisting ? "opacity-80" : ""}`}
        style={
          (() => {
            const style: React.CSSProperties = {};
            if (gateAccent) {
              style.borderColor = gateAccent.border;
              style.backgroundColor = gateAccent.bg;
            }
            if (carrierAccent && !gateAccent) {
              style.borderColor = carrierAccent;
            }
            if (glowColor) {
              style.boxShadow = `0 6px 16px rgba(15, 23, 42, 0.08), 0 0 18px rgba(${glowColor}, 0.45)`;
            }
            return Object.keys(style).length > 0 ? style : undefined;
          })()
        }
        onClick={(e) => {
          if (ignoreClickRef.current) {
            ignoreClickRef.current = false;
            return;
          }
          if (!isConnectingActive) return;
          e.stopPropagation();
          onClick();
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();       // don't open the detail dialog
          onDelete(component.id);    // call parent handler
          }}
          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-3 -left-3 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm cursor-default"
        >
          <svg className="h-3 w-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          Draft
        </button>


        {hasErrors && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowValidationModal(true);
                }}
                className="absolute -top-2 right-6 bg-amber-100 text-amber-700 border border-amber-300 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow-md"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs bg-white text-amber-900 border-amber-200"
            >
              <div className="text-xs font-semibold text-amber-900 mb-1">
                {validationErrors.length} issue{validationErrors.length === 1 ? "" : "s"}
              </div>
              <ul className="text-xs text-amber-900 space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={`${err.errorCode}-${idx}`}>{err.errorMessage}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}

        {hasErrors && (
          <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {component.name} · ID {component.id}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {validationErrors.map((err, idx) => (
                  <div
                    key={`${err.errorCode}-${idx}`}
                    className="rounded-md border border-amber-200 bg-white p-3"
                  >
                    <div className="text-sm font-semibold text-amber-900">{err.errorCode}</div>
                    <div className="text-sm text-amber-800">{err.errorMessage}</div>
                    <div className="text-xs text-amber-700 mt-1">
                      {formatValidationContext(err)}
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowValidationModal(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        

        {isGate && gateDirection && gateAccent && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div
              className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full border shadow-sm"
              style={{
                backgroundColor: gateAccent.bg,
                borderColor: gateAccent.border,
                color: gateAccent.text,
              }}
            >
              {gateDirection.toUpperCase()} -&gt;
            </div>
          </div>
        )}

        <CardContent
          className={`p-2 flex flex-col items-center justify-center text-center ${contentClasses} max-w-full`}
        >
          {showPortRail && renderPortRail("left", inputPorts)}
          {showPortRail && renderPortRail("right", outputPorts)}
          <div
            className="opacity-80"
            style={
              gateAccent
                ? { color: gateAccent.text }
                : carrierAccent
                  ? { color: carrierAccent }
                  : undefined
            }
          >
            {typeIcon}
          </div>

          <div
            className={`font-semibold text-sm max-w-full mt-1 leading-snug ${
              isGate ? "truncate" : "truncate"
            }`}
            style={gateAccent ? { color: gateAccent.text } : undefined}
          >
            {component.name}
          </div>
          <div
            className={`text-xs text-muted-foreground max-w-full leading-snug ${
              isGate ? "truncate" : "truncate"
            }`}
            style={gateAccent ? { color: gateAccent.text } : undefined}
          >
            {isPersisting ? "ID loading..." : `ID ${component.id}`}
          </div>

          <Button
            variant="ghost"
            size="sm"
            disabled={isPersisting}
            className={`mt-1 w-full text-xs ${isConnecting ? "bg-primary/10" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onConnectStart(component.id);
            }}
          >
            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Connect
          </Button>

          {/* Input */}
          {showLeftPort && (
            <>
              <button
                type="button"
                className="absolute -left-8 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1 text-slate-500 shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
                onMouseUp={(e) => handleNodeClick(e, false)}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                title="Connect input"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 19l-7-7 7-7" />
                  <path d="M3 12h18" />
                </svg>
              </button>
              <svg
                className={`${nodeCls("left")} cursor-pointer z-10`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                onMouseUp={(e) => handleNodeClick(e, false)}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="11"
                  className="fill-transparent"
                  pointerEvents="all"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="6.5"
                  className={gateAccent || carrierAccent ? "fill-opacity-70 hover:fill-opacity-90" : `${colors.fill} fill-opacity-70 hover:fill-opacity-90`}
                  style={
                    gateAccent
                      ? { fill: gateAccent.border }
                      : carrierAccent
                        ? { fill: carrierAccent }
                        : undefined
                  }
                />
              </svg>
            </>
          )}

          {/* Output */}
          {showRightPort && (
            <>
              <button
                type="button"
                className="absolute -right-8 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1 text-slate-500 shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
                onMouseDown={(e) => handleNodeClick(e, true)}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                title="Connect output"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 5l7 7-7 7" />
                  <path d="M3 12h18" />
                </svg>
              </button>
              <svg
                className={`${nodeCls("right")} cursor-pointer z-10`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                onMouseDown={(e) => handleNodeClick(e, true)}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="11"
                  className="fill-transparent"
                  pointerEvents="all"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="6.5"
                  className={gateAccent || carrierAccent ? "fill-opacity-70 hover:fill-opacity-90" : `${colors.fill} fill-opacity-70 hover:fill-opacity-90`}
                  style={
                    gateAccent
                      ? { fill: gateAccent.border }
                      : carrierAccent
                        ? { fill: carrierAccent }
                        : undefined
                  }
                />
              </svg>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantComponent;
