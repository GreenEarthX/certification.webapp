// src/components/plant-builder/PlantComponent.tsx
import { useState, useRef, useEffect } from "react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cable, Building2, Zap, ArrowRightLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Position, PlacedComponent } from "./Canvas";

interface PlantComponentProps {
  component: PlacedComponent;
  onClick: () => void;
  onMove: (id: string, position: Position) => void;
  onConnectStart: (id: string) => void;
  onConnectEnd: (id: string) => void;
  isConnecting: boolean;
}

const layerColors: Record<
  string,
  { bg: string; border: string; text: string; fill: string }
> = {
  equipment: {
    bg: "bg-layer-equipment-light",
    border: "border-layer-equipment",
    text: "text-layer-equipment",
    fill: "fill-layer-equipment",
  },
  carrier: {
    bg: "bg-layer-carrier-light",
    border: "border-layer-carrier",
    text: "text-layer-carrier",
    fill: "fill-layer-carrier",
  },
  gate: {
    bg: "bg-layer-gate-light",
    border: "border-layer-gate",
    text: "text-layer-gate",
    fill: "fill-layer-gate",
  },
};

// Helper to get icon based on type
const getTypeIcon = (type: string): React.ReactElement | null => {
  switch (type) {
    case "equipment":
      return <Building2 className="h-6 w-6 mb-1" />;
    case "carrier":
      return <Zap className="h-6 w-6 mb-1" />;
    case "gate":
      return <ArrowRightLeft className="h-6 w-6 mb-1 rotate-90" />;
    default:
      return null;
  }
};

// Helper to determine base shape classes
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
  const colors = layerColors[component.type] || {
    bg: "bg-gray-100",
    border: "border-gray-300",
    text: "text-gray-700",
    fill: "fill-gray-700",
  };

  const isGate = component.type === "gate";
  const baseShapeClasses = getBaseShapeClasses(component.type);
  const shapeClasses = isGate ? `${baseShapeClasses} rounded-md rotate-90 origin-center` : baseShapeClasses;
  const typeIcon = getTypeIcon(component.type); // ← Now typed as React.ReactElement | null

  const contentClasses = isGate ? "rotate-[-90deg] w-full" : "";

  useEffect(() => {
    setPosition(component.position);
  }, [component.position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      onMove(component.id, position);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleNodeClick = (e: React.MouseEvent, isOutput: boolean) => {
    e.stopPropagation();
    if (isOutput) {
      onConnectStart(component.id);
    } else if (isConnecting) {
      onConnectEnd(component.id);
    }
  };

  const inputNodeClasses = isGate
    ? "absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
    : "absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity";

  const outputNodeClasses = isGate
    ? "absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
    : "absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity";

  const tooltipSideInput = isGate ? "top" : "left";
  const tooltipSideOutput = isGate ? "bottom" : "right";

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
        <CardContent className={`p-2 flex flex-col items-center justify-center text-center ${contentClasses} max-w-full`}>
          {typeIcon && (
            <div className={`${colors.text} opacity-80`}>
              {React.cloneElement(typeIcon, {
                className: `${typeIcon.props.className} ${colors.text}`,
              })}
            </div>
          )}
          <div className={`font-semibold text-sm truncate max-w-full mt-1 ${isGate ? 'whitespace-normal' : ''}`}>
            {component.name}
          </div>
          <div className={`text-xs text-muted-foreground truncate max-w-full ${isGate ? 'whitespace-normal' : ''}`}>
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
              <Cable className="h-3 w-3 mr-1" />
              Connect
            </Button>
          )}

          {/* Input Port */}
          <Tooltip>
            <TooltipTrigger asChild>
              <svg
                className={`${inputNodeClasses} cursor-pointer z-10`}
                width="12"
                height="12"
                onClick={(e) => handleNodeClick(e, false)}
              >
                <circle cx="6" cy="6" r="5" className={`${colors.fill} fill-opacity-60 hover:fill-opacity-80`} />
              </svg>
            </TooltipTrigger>
            <TooltipContent side={tooltipSideInput}>
              Click to connect input
            </TooltipContent>
          </Tooltip>

          {/* Output Port */}
          <Tooltip>
            <TooltipTrigger asChild>
              <svg
                className={`${outputNodeClasses} cursor-pointer z-10`}
                width="12"
                height="12"
                onClick={(e) => handleNodeClick(e, true)}
              >
                <circle cx="6" cy="6" r="5" className={`${colors.fill} fill-opacity-60 hover:fill-opacity-80`} />
              </svg>
            </TooltipTrigger>
            <TooltipContent side={tooltipSideOutput}>
              Click to connect output
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantComponent;