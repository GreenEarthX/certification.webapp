// src/components/plant-builder/ComponentLibrary.tsx
import { useState } from "react";
import { Building2, Zap, ArrowRightLeft, ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

// === TAILWIND COLORS ===
const layerStyles = {
  equipment: { dot: "bg-blue-500", border: "border-blue-300", hover: "hover:border-blue-500 hover:bg-blue-50" },
  carrier:   { dot: "bg-green-500", border: "border-green-300", hover: "hover:border-green-500 hover:bg-green-50" },
  gate:      { dot: "bg-purple-500", border: "border-purple-300", hover: "hover:border-purple-500 hover:bg-purple-50" },
};

const equipmentComponents: ComponentData[] = [
  { id: "electrolyzer", type: "equipment", name: "Electrolyzer", category: "Power-to-X", icon: "Building2" },
  { id: "dac", type: "equipment", name: "DAC", category: "Power-to-X", icon: "Building2" },
  { id: "methanol-synthesis", type: "equipment", name: "Methanol Synth", category: "Power-to-X", icon: "Building2" },
  { id: "hydrotreating", type: "equipment", name: "Hydrotreating", category: "Lipid-to-Fuels", icon: "Building2" },
  { id: "gasifier", type: "equipment", name: "Gasifier", category: "Gasification", icon: "Building2" },
  { id: "anaerobic-digester", type: "equipment", name: "Anaerobic Digester", category: "Anaerobic Digestion", icon: "Building2" },
  { id: "co2-liquefaction", type: "equipment", name: "CO₂ Liquefaction", category: "CO₂ Management", icon: "Building2" },
  { id: "compressor", type: "equipment", name: "Compressor", category: "Balance-of-Plant", icon: "Building2" },
];

const carrierComponents: ComponentData[] = [
  { id: "hydrogen", type: "carrier", name: "Hydrogen", category: "Gas", icon: "Zap" },
  { id: "co2", type: "carrier", name: "CO₂", category: "Gas", icon: "Zap" },
  { id: "methanol", type: "carrier", name: "Methanol", category: "Liquid", icon: "Zap" },
  { id: "ammonia", type: "carrier", name: "Ammonia", category: "Gas/Liquid", icon: "Zap" },
  { id: "electricity", type: "carrier", name: "Electricity", category: "Energy", icon: "Zap" },
  { id: "syngas", type: "carrier", name: "Syngas", category: "Gas", icon: "Zap" },
];

const gateComponents: ComponentData[] = [
  { id: "input-grid", type: "gate", name: "Grid Input", category: "Input", icon: "ArrowRightLeft" },
  { id: "input-renewable", type: "gate", name: "Renewable Input", category: "Input", icon: "ArrowRightLeft" },
  { id: "output-product", type: "gate", name: "Product Output", category: "Output", icon: "ArrowRightLeft" },
  { id: "valve", type: "gate", name: "Control Valve", category: "Control", icon: "ArrowRightLeft" },
];

const ComponentLibrary = () => {
  const [openSections, setOpenSections] = useState({
    equipment: true,
    carrier: false,
    gate: false,
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: ComponentData) => {
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
      <Collapsible open={openSections[sectionKey]} onOpenChange={() => toggleSection(sectionKey)}>
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
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                {category}
              </div>
              <div className="space-y-1.5">
                {items.map((component) => (
                  <Card
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    className={`p-2 cursor-move border ${style.border} ${style.hover} transition-all text-sm rounded-md shadow-sm`}
                  >
                    <div className="font-medium truncate" title={component.name}>
                      {component.name}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    // WIDE: 320px
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="font-bold text-base">Component Library</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Drag to canvas</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {renderLayer("Equipment", <Building2 className="h-4 w-4" />, "equipment", equipmentComponents, "equipment")}
          <Separator className="my-1" />
          {renderLayer("Carriers", <Zap className="h-4 w-4" />, "carrier", carrierComponents, "carrier")}
          <Separator className="my-1" />
          {renderLayer("Gates", <ArrowRightLeft className="h-4 w-4" />, "gate", gateComponents, "gate")}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ComponentLibrary;