// src/components/plant-builder/ComponentLibrary.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Zap,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ⬇️ import API helper
import {
  fetchComponentLibraryFromApi,
} from "@/services/plant-builder/componentDefinitions";

// === TYPES (same as before) ===
export type ComponentType = "equipment" | "carrier" | "gate";

export type TechnicalData = {
  input?: { name: string; quantity: number; unit: "MWh/h" | "Ton/h" }[];
  output?: { name: string; quantity: number; unit: "MWh/h" | "Ton/h" }[];
  efficiency?: number;
  capacity?: { value: number; unit: "MWh/h" | "Ton/h" };
};

export type Metadata = {
  manufacturer?: string;
  commercialOperatingDate?: string;
};

export type CarrierData = {
  product?: string;
  fuelType?: string;
  fuelClass?: string;
  certificationStatus?: string;
  temperature?: number;
  pressure?: number;
};

export type GateData = {
  inputOrOutput: "input" | "output";
  product?: string;
  input?: { name: string; quantity: number; unit: "MWh/h" | "Ton/h" }[];
  output?: { name: string; quantity: number; unit: "MWh/h" | "Ton/h" }[];
  efficiency?: number;
  sourceType?: string;
  sourceOrigin?: string;
  sourceCertification?: string;
  endUse?: string;
  sinkType?: string;
};

export type ComponentData = {
  id: string;
  type: ComponentType;
  name: string;
  category: string;
  icon: string;
  technicalData?: TechnicalData;
  metadata?: Metadata;
  carrierData?: CarrierData;
  gateData?: GateData;
};

type ComponentLibraryJSON = {
  equipment: ComponentData[];
  carrier: ComponentData[];
  gate: ComponentData[];
};

// === TAILWIND COLORS ===
const layerStyles = {
  equipment: {
    dot: "bg-blue-500",
    border: "border-blue-300",
    hover: "hover:border-blue-500 hover:bg-blue-50",
  },
  carrier: {
    dot: "bg-green-500",
    border: "border-green-300",
    hover: "hover:border-green-500 hover:bg-green-50",
  },
  gate: {
    dot: "bg-purple-500",
    border: "border-purple-300",
    hover: "hover:border-purple-500 hover:bg-purple-50",
  },
};

const ComponentLibrary = () => {
  const [openSections, setOpenSections] = useState({
    equipment: true,
    carrier: false,
    gate: false,
  });

  const [library, setLibrary] = useState<ComponentLibraryJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔐 Load components from backend (needs Bearer token)
  useEffect(() => {
    let isMounted = true;

    async function loadLibrary() {
      try {
        setLoading(true);
        const data = await fetchComponentLibraryFromApi();
        if (!isMounted) return;
        setLibrary(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load component library:", err);
        if (!isMounted) return;
        setError(
          err?.message || "Failed to load component library from server."
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLibrary();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    component: ComponentData
  ) => {
    e.dataTransfer.setData("component", JSON.stringify(component));
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const groupByCategory = (components: ComponentData[]) => {
    return components.reduce((acc, comp) => {
      (acc[comp.category] = acc[comp.category] || []).push(comp);
      return acc;
    }, {} as Record<string, ComponentData[]>);
  };

  const renderLayer = (
    title: string,
    icon: React.ReactNode,
    type: ComponentType,
    components: ComponentData[],
    sectionKey: keyof typeof openSections
  ) => {
    const style = layerStyles[type];
    const grouped = groupByCategory(components);

    return (
      <Collapsible
        open={openSections[sectionKey]}
        onOpenChange={() => toggleSection(sectionKey)}
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full text-left hover:bg-muted/40 p-2 rounded transition-colors text-sm font-medium">
          <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <span className="flex items-center gap-1.5 flex-1">
            {icon}
            {title}
          </span>
          {openSections[sectionKey] ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3 pl-5 border-l border-muted/50 ml-2">
          {Object.entries(grouped).map(([category, items]) => {
            const normalized = category.trim().toLowerCase();
            const hideCategory =
              (type === "equipment" && (normalized === "equipment" || normalized === "equipments")) ||
              (type === "carrier" && (normalized === "carrier" || normalized === "carriers")) ||
              (type === "gate" && (normalized === "gate" || normalized === "gates"));
            return (
            <div key={category} className="space-y-2">
              {!hideCategory && (
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  {category}
                </div>
              )}
              <div className="space-y-1.5">
                {items.map((component) => (
                  <Card
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    className={`p-2 cursor-move border ${style.border} ${style.hover} transition-all text-sm rounded-md shadow-sm`}
                  >
                    <div
                      className="font-medium truncate"
                      title={component.name}
                    >
                      {component.name}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )})}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // === UI states ===
  if (loading) {
    return (
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="font-bold text-base">Component Library</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Loading components…
          </p>
        </div>
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="font-bold text-base">Component Library</h2>
          <p className="text-xs text-destructive mt-0.5">
            {error || "Unable to load component library."}
          </p>
        </div>
      </div>
    );
  }

  const { equipment, carrier, gate } = library;

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="font-bold text-base">Component Library</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Drag to canvas
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {renderLayer(
            "Equipment",
            <Building2 className="h-4 w-4" />,
            "equipment",
            equipment,
            "equipment"
          )}
          <Separator className="my-1" />
          {renderLayer(
            "Carriers",
            <Zap className="h-4 w-4" />,
            "carrier",
            carrier,
            "carrier"
          )}
          <Separator className="my-1" />
          {renderLayer(
            "Gates",
            <ArrowRightLeft className="h-4 w-4" />,
            "gate",
            gate,
            "gate"
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ComponentLibrary;
