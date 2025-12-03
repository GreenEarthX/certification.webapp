// src/components/plant-builder/PlantComponent.tsx
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Zap, ArrowRightLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Position, PlacedComponent } from "./../../app/plant-builder/types";

interface PlantComponentProps {
  component: PlacedComponent;
  onClick: () => void;
  onMove: (id: string, position: Position) => void;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  isConnecting: boolean;
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
  onClick,
  onMove,
  onConnectStart,
  onConnectEnd,
  isConnecting,
}: PlantComponentProps) => {
  const [position, setPosition] = useState(component.position);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const typeIcon = getTypeIcon(component.type, colors.text);

  /* ───── drag ───── */
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const move = (ev: MouseEvent) => {
      const newPos = { x: ev.clientX - startX, y: ev.clientY - startY };
      setPosition(newPos);
      onMove(component.id, newPos);
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  /* ───── ports ───── */
  const handleNodeClick = (e: React.MouseEvent, out: boolean) => {
    e.stopPropagation();
    out ? onConnectStart(component.id) : isConnecting && onConnectEnd(component.id);
  };

  // ❌ dynamic "-${side}-2" breaks Tailwind
  // ✅ use explicit classes so Tailwind can see them
  const nodeCls = (side: "left" | "right") =>
    [
      "absolute",
      side === "left" ? "-left-2" : "-right-2",
      "top-1/2",
      "-translate-y-1/2",
      "opacity-0",
      "group-hover:opacity-100",
      "transition-opacity",
    ].join(" ");

  return (
    <div
      ref={cardRef}
      className="absolute cursor-move select-none"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onClick={onClick}
    >
      <Card
        className={`${shapeClasses} border-2 ${colors.border} ${colors.bg} shadow-md hover:shadow-lg transition-shadow relative group flex flex-col items-center justify-center p-2 overflow-visible`}
      >
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
            {component.category}
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
                width="12"
                height="12"
                onClick={(e) => handleNodeClick(e, false)}
              >
                <circle
                  cx="6"
                  cy="6"
                  r="5"
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
                width="12"
                height="12"
                onClick={(e) => handleNodeClick(e, true)}
              >
                <circle
                  cx="6"
                  cy="6"
                  r="5"
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
