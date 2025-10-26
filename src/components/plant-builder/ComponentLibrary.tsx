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

const equipmentComponents: ComponentData[] = [
  { id: "electrolyzer", type: "equipment", name: "Electrolyzer (PEM, Alkaline, SOEC)", category: "Power-to-X", icon: "Building2", technicalData: { input: [{ name: "Water", quantity: 0, unit: "Ton/h" }, { name: "Electricity", quantity: 0, unit: "MWh/h" }], output: [{ name: "Hydrogen", quantity: 0, unit: "Ton/h" }, { name: "Oxygen", quantity: 0, unit: "Ton/h" }], efficiency: 0, capacity: { value: 0, unit: "MWh/h" } }, metadata: {} },
  { id: "dac", type: "equipment", name: "Direct Air Capture (DAC)", category: "Power-to-X", icon: "Building2", technicalData: { input: [{ name: "Air", quantity: 0, unit: "Ton/h" }], output: [{ name: "CO₂", quantity: 0, unit: "Ton/h" }], efficiency: 0, capacity: { value: 0, unit: "MWh/h" } }, metadata: {} },
  { id: "methanol-synthesis", type: "equipment", name: "Methanol Synthesis Reactor", category: "Power-to-X", icon: "Building2", technicalData: { input: [{ name: "CO₂", quantity: 0, unit: "Ton/h" }, { name: "Hydrogen", quantity: 0, unit: "Ton/h" }], output: [{ name: "Methanol", quantity: 0, unit: "Ton/h" }], efficiency: 0, capacity: { value: 0, unit: "Ton/h" } }, metadata: {} },
  { id: "hydrotreating", type: "equipment", name: "Hydrotreating (Deoxygenation)", category: "Lipid-to-Fuels", icon: "Building2", technicalData: { input: [{ name: "Triglycerides", quantity: 0, unit: "Ton/h" }], output: [{ name: "Paraffins", quantity: 0, unit: "Ton/h" }], efficiency: 0, capacity: { value: 0, unit: "Ton/h" } }, metadata: {} },
  { id: "gasifier", type: "equipment", name: "Gasifier", category: "Gasification", icon: "Building2", technicalData: { input: [{ name: "Biomass", quantity: 0, unit: "Ton/h" }], output: [{ name: "Syngas", quantity: 0, unit: "Ton/h" }], efficiency: 0, capacity: { value: 0, unit: "Ton/h" } }, metadata: {} },
  { id: "anaerobic-digester", type: "equipment", name: "Anaerobic Digester", category: "Anaerobic Digestion", icon: "Building2", technicalData: { input: [{ name: "Wet Organics", quantity: 0, unit: "Ton/h" }], output: [{ name: "Biogas", quantity: 0, unit: "Ton/h" }], efficiency: 0, capacity: { value: 0, unit: "Ton/h" } }, metadata: {} },
  { id: "co2-liquefaction", type: "equipment", name: "CO₂ Liquefaction & Storage", category: "CO₂ Management", icon: "Building2", technicalData: { input: [{ name: "CO₂", quantity: 0, unit: "Ton/h" }], output: [{ name: "Liquid CO₂", quantity: 0, unit: "Ton/h" }], efficiency: 0, capacity: { value: 0, unit: "Ton/h" } }, metadata: {} },
  { id: "compressor", type: "equipment", name: "Compressor", category: "Balance-of-Plant", icon: "Building2", technicalData: { input: [{ name: "Gas", quantity: 0, unit: "Ton/h" }], output: [{ name: "Compressed Gas", quantity: 0, unit: "Ton/h" }], efficiency: 0, capacity: { value: 0, unit: "Ton/h" } }, metadata: {} },
];

const carrierComponents: ComponentData[] = [
  { id: "hydrogen", type: "carrier", name: "Hydrogen (H₂)", category: "Gas", icon: "Zap", carrierData: { product: "Hydrogen", fuelType: "Hydrogen", fuelClass: "Renewable fuels of non-biological origin (RFNBO)", certificationStatus: "Pre-certification" } },
  { id: "co2", type: "carrier", name: "Carbon Dioxide (CO₂)", category: "Gas", icon: "Zap", carrierData: { product: "CO₂", fuelType: "CO₂", fuelClass: "Recycled carbon fuels", certificationStatus: "Pre-certification" } },
  { id: "methanol", type: "carrier", name: "Methanol (CH₃OH)", category: "Liquid", icon: "Zap", carrierData: { product: "Methanol", fuelType: "Methanol", fuelClass: "Renewable fuels of non-biological origin (RFNBO)", certificationStatus: "Pre-certification" } },
  { id: "ammonia", type: "carrier", name: "Ammonia (NH₃)", category: "Gas/Liquid", icon: "Zap", carrierData: { product: "Ammonia", fuelType: "Ammonia", fuelClass: "Renewable fuels of non-biological origin (RFNBO)", certificationStatus: "Pre-certification" } },
  { id: "electricity", type: "carrier", name: "Electricity", category: "Energy", icon: "Zap", carrierData: { product: "Electricity", fuelType: "Renewable electricity", fuelClass: "Renewable electricity", certificationStatus: "Pre-certification" } },
  { id: "syngas", type: "carrier", name: "Syngas", category: "Gas", icon: "Zap", carrierData: { product: "Syngas", fuelType: "Syngas", fuelClass: "Recycled carbon fuels", certificationStatus: "Pre-certification" } },
];

const gateComponents: ComponentData[] = [
  { id: "input-grid", type: "gate", name: "Grid Input", category: "Input", icon: "ArrowRightLeft", gateData: { inputOrOutput: "input", product: "Electricity", input: [{ name: "Electricity", quantity: 0, unit: "MWh/h" }], sourceType: "Market", sourceOrigin: "Grid", sourceCertification: "GoO" } },
  { id: "input-renewable", type: "gate", name: "Renewable Input", category: "Input", icon: "ArrowRightLeft", gateData: { inputOrOutput: "input", product: "Electricity", input: [{ name: "Electricity", quantity: 0, unit: "MWh/h" }], sourceType: "PPA", sourceOrigin: "Solar", sourceCertification: "GoO" } },
  { id: "output-product", type: "gate", name: "Product Output", category: "Output", icon: "ArrowRightLeft", gateData: { inputOrOutput: "output", product: "Methanol", output: [{ name: "Methanol", quantity: 0, unit: "Ton/h" }], endUse: "Shipping Industry", sinkType: "Market" } },
  { id: "valve", type: "gate", name: "Control Valve", category: "Control", icon: "ArrowRightLeft", gateData: { inputOrOutput: "input", product: "Hydrogen", input: [{ name: "Hydrogen", quantity: 0, unit: "Ton/h" }], sourceType: "Market", sourceOrigin: "Electrolyzer", sourceCertification: "Feedstock certification" } },
];

const ComponentLibrary = () => {
  const [openSections, setOpenSections] = useState({
    equipment: false,
    carrier: false,
    gate: false,
  });

  const handleDragStart = (e: React.DragEvent, component: ComponentData) => {
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
    colorClass: string,
    components: ComponentData[],
    type: ComponentType,
    sectionKey: keyof typeof openSections
  ) => {
    const grouped = groupByCategory(components);

    return (
      <Collapsible open={openSections[sectionKey]} onOpenChange={() => toggleSection(sectionKey)}>
        <CollapsibleTrigger className="flex items-center gap-2 mb-3 w-full text-left hover:bg-muted/50 p-2 rounded-md transition-colors">
          <div className={`w-3 h-3 rounded-full bg-${colorClass}`} />
          <h3 className="font-medium text-foreground flex items-center gap-2 flex-1">
            {icon}
            {title}
          </h3>
          {openSections[sectionKey] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pl-5 border-l-2 border-muted ml-1.5">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
              <div className="space-y-2">
                {items.map((component) => (
                  <Card
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    className={`p-3 cursor-move border-2 border-${colorClass}/20 hover:border-${colorClass} hover:bg-${colorClass}-light transition-colors`}
                  >
                    <div className="font-medium text-sm text-foreground truncate" title={component.name}>
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
    <div className="w-64 border-r border-border bg-card shrink-0 flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg text-foreground">Component Library</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag components to the canvas
        </p>
      </div>

      <ScrollArea className="flex-1 overflow-x-hidden">
        <div className="p-4 space-y-6">
          {renderLayer(
            "Equipment Layer",
            <Building2 className="h-4 w-4" />,
            "layer-equipment",
            equipmentComponents,
            "equipment",
            "equipment"
          )}
          <Separator />
          {renderLayer(
            "Carrier Layer",
            <Zap className="h-4 w-4" />,
            "layer-carrier",
            carrierComponents,
            "carrier",
            "carrier"
          )}
          <Separator />
          {renderLayer(
            "Gate Layer",
            <ArrowRightLeft className="h-4 w-4" />,
            "layer-gate",
            gateComponents,
            "gate",
            "gate"
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ComponentLibrary;