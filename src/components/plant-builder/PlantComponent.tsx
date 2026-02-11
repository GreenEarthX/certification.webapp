// src/components/plant-builder/PlantComponent.tsx
import { useState, useRef, useEffect } from "react";
import type { RefObject } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Building2, Zap, ArrowRightLeft, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  isConnectingActive: boolean;
  isConnecting: boolean;
  onDelete: (id: string) => void;   // ⬅️ NEW
  validationErrors?: DigitalTwinValidationError[];
  isHighlighted?: boolean;
}

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
    bg: "bg-purple-50",
    border: "border-purple-500",
    text: "text-purple-700",
    fill: "fill-purple-600",
  },
};

/* ─────────────────────── ICON (always returns element) ─────────────────────── */
const getTypeIcon = (type: string, colorClass: string) => {
  switch (type) {
    case "equipment":
      return <Building2 className={`h-6 w-6 mb-1 ${colorClass}`} />;
    case "carrier":
      return <Zap className={`h-6 w-6 mb-1 ${colorClass}`} />;
    case "gate":
      return <ArrowRightLeft className={`h-6 w-6 mb-1 rotate-90 ${colorClass}`} />;
    default:
      return <div className={`h-6 w-6 mb-1 ${colorClass}`} />;
  }
};

/* ─────────────────────── SHAPE ─────────────────────── */
const getBaseShapeClasses = (type: string) => {
  switch (type) {
    case "equipment":
      return "w-48 h-32 rounded-lg";
    case "carrier":
      return "w-32 h-32 rounded-full";
    case "gate":
      return "w-40 min-h-24";
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
  validationErrors = [],
  isHighlighted = false,
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

  const colors = layerColors[component.type] ?? {
    bg: "bg-gray-100",
    border: "border-gray-300",
    text: "text-gray-700",
    fill: "fill-gray-700",
  };

  const isGate = component.type === "gate";
  const baseShape = getBaseShapeClasses(component.type);
  const shapeClasses = isGate
    ? `${baseShape} rounded-md rotate-90 origin-center`
    : baseShape;
  const contentClasses = isGate ? "rotate-[-90deg] w-full" : "";
  const hasErrors = validationErrors.length > 0;

  const typeIcon = getTypeIcon(component.type, colors.text);

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
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  /* ───── ports ───── */
  const handleNodeClick = (e: React.MouseEvent, out: boolean) => {
    e.stopPropagation();
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
      isGate ? (side === "left" ? "-left-[1px]" : "-right-[1px]") : side === "left" ? "-left-2" : "-right-2",
      "top-1/2",
      "-translate-y-1/2",
      "opacity-0",
      "group-hover:opacity-100",
      "transition-opacity",
      "pointer-events-none",
      "group-hover:pointer-events-auto",
    ].join(" ");

  return (
    <div
      ref={cardRef}
      data-plant-component
      className="absolute cursor-move select-none"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => {
        if (ignoreClickRef.current) {
          ignoreClickRef.current = false;
          return;
        }
        onClick();
      }}
    >
      <Card
        className={`${shapeClasses} border-2 ${colors.border} ${colors.bg} shadow-md hover:shadow-lg transition-shadow relative group flex flex-col items-center justify-center p-2 overflow-visible ${
          isHighlighted ? "ring-2 ring-amber-300 ring-offset-2 ring-offset-white" : ""
        }`}
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

        {hasErrors && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowValidationModal(true);
                }}
                className="absolute -top-2 -left-2 bg-amber-100 text-amber-700 border border-amber-300 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow-md"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${isGate ? "-rotate-90" : ""}`} />
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
        
        <CardContent
          className={`p-2 flex flex-col items-center justify-center text-center ${contentClasses} max-w-full`}
        >
          <div className="opacity-80">{typeIcon}</div>

          <div
            className={`font-semibold text-sm truncate max-w-full mt-1 ${
              isGate ? "whitespace-normal" : ""
            }`}
          >
            {component.name}
          </div>
          <div
            className={`text-xs text-muted-foreground truncate max-w-full ${
              isGate ? "whitespace-normal" : ""
            }`}
          >
            ID {component.id}
          </div>

          {component.type !== "gate" && component.type !== "carrier" && (
            <Button
              variant="ghost"
              size="sm"
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
          )}

          {/* Input */}
          <Tooltip>
            <TooltipTrigger asChild>
              <svg
                className={`${nodeCls("left")} cursor-pointer z-10`}
                width="16"
                height="16"
                onClick={(e) => handleNodeClick(e, false)}
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  className={`${colors.fill} fill-opacity-60 hover:fill-opacity-80`}
                />
              </svg>
            </TooltipTrigger>
            <TooltipContent side={isGate ? "top" : "left"}>
              Click to connect input
            </TooltipContent>
          </Tooltip>

          {/* Output */}
          <Tooltip>
            <TooltipTrigger asChild>
              <svg
                className={`${nodeCls("right")} cursor-pointer z-10`}
                width="16"
                height="16"
                onClick={(e) => handleNodeClick(e, true)}
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  className={`${colors.fill} fill-opacity-60 hover:fill-opacity-80`}
                />
              </svg>
            </TooltipTrigger>
            <TooltipContent side={isGate ? "bottom" : "right"}>
              Click to connect output
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantComponent;
