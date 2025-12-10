"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CertificationMultiSelectWithUpload,
  type CertificationSelection,
} from "@/components/ui/CertificationMultiSelectWithUpload";
import { MultiSelectEnum } from "@/components/ui/MultiSelectEnum";


type ComponentKey =
  | "gate1-power"
  | "gate2-water"
  | "gate3-spot"
  | "gate4-vent"
  | "gate5-offtake1"
  | "gate6-offtake2"
  | "eq1-electrolyser"
  | "eq2-dac"
  | "eq3-co2-compressor"
  | "eq4-h2-compressor"
  | "eq5-h2-purifier"
  | "eq6-methanol"
  | "eq7-buffer"
  | "eq8-co2-purifier";

const COMPONENTS: { id: ComponentKey; label: string; group: string }[] = [
  { id: "gate1-power", label: "Gate 1 – Power Supply", group: "Gates" },
  { id: "gate2-water", label: "Gate 2 – Water Supply", group: "Gates" },
  { id: "gate3-spot", label: "Gate 3 – Spot Market", group: "Gates" },
  { id: "gate4-vent", label: "Gate 4 – Vent", group: "Gates" },
  { id: "gate5-offtake1", label: "Gate 5 – Offtake Market 1", group: "Gates" },
  { id: "gate6-offtake2", label: "Gate 6 – Offtake Market 2", group: "Gates" },

  { id: "eq1-electrolyser", label: "Eq 1 – Electrolyser", group: "Equipment" },
  { id: "eq2-dac", label: "Eq 2 – Direct Air Capture", group: "Equipment" },
  { id: "eq3-co2-compressor", label: "Eq 3 – CO₂ Compressor", group: "Equipment" },
  { id: "eq4-h2-compressor", label: "Eq 4 – H₂ Compressor", group: "Equipment" },
  { id: "eq5-h2-purifier", label: "Eq 5 – Hydrogen Purifier", group: "Equipment" },
  { id: "eq6-methanol", label: "Eq 6 – Methanol Synthesis", group: "Equipment" },
  { id: "eq7-buffer", label: "Eq 7 – Buffer", group: "Equipment" },
  { id: "eq8-co2-purifier", label: "Eq 8 – CO₂ Purifier", group: "Equipment" },
];

// hard-force white UI
const INPUT_CLASS = "bg-white text-black border border-gray-300";
const SELECT_TRIGGER_CLASS = "bg-white text-black border border-gray-300";
const SELECT_CONTENT_CLASS = "bg-white text-black border border-gray-300";
const TEXTAREA_CLASS = "bg-white text-black border border-gray-300";
const CARD_CLASS = "bg-white text-black";

export default function SpecFormsPage() {
  const [selected, setSelected] = useState<ComponentKey>("gate1-power");
  const selectedMeta = COMPONENTS.find((c) => c.id === selected)!;

  return (
    <div className="flex min-h-screen gap-6 bg-white p-6 text-black">
      {/* Left: Component list */}
      <Card className={`w-72 shrink-0 ${CARD_CLASS}`}>
        <CardHeader>
          <CardTitle>Components</CardTitle>
          <CardDescription className="text-gray-600">
            Click a component to edit its spec form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["Gates", "Equipment"].map((group) => (
            <div key={group} className="space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-500">
                {group}
              </p>
              <div className="space-y-1">
                {COMPONENTS.filter((c) => c.group === group).map((c) => (
                  <Button
                    key={c.id}
                    variant={c.id === selected ? "default" : "outline"}
                    className="w-full justify-start text-sm"
                    onClick={() => setSelected(c.id)}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Right: Form */}
      <Card className={`flex-1 ${CARD_CLASS}`}>
        <CardHeader>
          <CardTitle>{selectedMeta.label}</CardTitle>
          <CardDescription className="text-gray-600">
            Configure the technical specifications for this component.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[80vh] space-y-6 overflow-y-auto pr-2">
          {selected === "gate1-power" && <Gate1PowerSupplyForm />}
          {selected === "gate2-water" && <Gate2WaterSupplyForm />}
          {selected === "gate3-spot" && <Gate3SpotMarketForm />}
          {selected === "gate4-vent" && <Gate4VentForm />}
          {selected === "gate5-offtake1" && (
            <OfftakeMarketForm title="Gate 5 – Offtake Market" />
          )}
          {selected === "gate6-offtake2" && (
            <OfftakeMarketForm title="Gate 6 – Offtake Market" />
          )}

          {selected === "eq1-electrolyser" && <ElectrolyserForm />}
          {selected === "eq2-dac" && <DirectAirCaptureForm />}
          {selected === "eq3-co2-compressor" && <CO2CompressorForm />}
          {selected === "eq4-h2-compressor" && <H2CompressorForm />}
          {selected === "eq5-h2-purifier" && <HydrogenPurifierForm />}
          {selected === "eq6-methanol" && <MethanolSynthesisForm />}
          {selected === "eq7-buffer" && <BufferForm />}
          {selected === "eq8-co2-purifier" && <CO2PurifierForm />}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------ GATE FORMS ------------------ */

function Gate1PowerSupplyForm() {
  const certificationOptions = [
    "Power Purchase Agreement (PPA)",
    "Guarantee of Origin (GoO)",
    "Grid connection agreement",
    "Single Line Diagram (SLD)",
    "Metering point registration",
    "Engineering / EPC contract",
    "Commissioning certificate",
    "TSO attestation",
    "Cable diagram & metering scheme",
  ];

  const connectionOptions = [
    "Direct Connection",
    "Grid Connection (offshore bidding zone)",
    "Grid Connection (interconnected bidding zone)",
    "Grid Connection (same bidding zone)",
    "Self Generation",
  ];

  const sourceOptions = [
    "Solar thermal",
    "Solar Photovoltaic",
    "Wind",
    "Waste",
    "Geothermal energy",
    "Ambient energy",
    "Tide",
    "Wave and other ocean energy",
    "Hydropower",
    "Biomass",
    "Landfill gas",
    "Sewage treatment plant gas",
    "Biogas",
    "Biomethane",
    "Fossil fuel",
  ];

  const [certifications, setCertifications] = useState<CertificationSelection[]>([]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Output / Input</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select port type" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              <SelectItem value="input">Input</SelectItem>
              <SelectItem value="output">Output</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Output (carrier)</Label>
          <Input
            disabled
            value="Electricity"
            className={`${INPUT_CLASS} bg-gray-100`}
          />
        </div>
        <div>
          <Label>Output Quantity (MWh/h)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 30"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Source</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select electricity source" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              {sourceOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Connection Type</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select connection" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              {connectionOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* NEW: multi-select with upload */}
      <CertificationMultiSelectWithUpload
        label="Certification Source"
        options={certificationOptions.map((c) => ({ value: c }))}
        value={certifications}
        onChange={setCertifications}
        placeholder="Select one or more certification sources"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Refurbished / New</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              <SelectItem value="refurbished">Refurbished</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Plant Registry Code</Label>
          <Input
            placeholder="e.g. DE-MaStR-1234567890"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <Label>Commercial Operating Date (COD)</Label>
          <Input type="date" className={INPUT_CLASS} />
        </div>
      </div>
    </div>
  );
}


function Gate2WaterSupplyForm() {
  const certificationOptions = [
    "Environmental Impact Assessment (EIA / ESIA)",
    "Water abstraction permit",
    "Wastewater discharge permit",
  ];

  const sourceOptions = [
    "Municipal/Public water supply",
    "Groundwater (wells/boreholes)",
    "Surface water (River, Lakes, Reservoirs)",
    "Rainwater Harvesting / Collection System",
    "Reclaimed or recycled water",
    "Desalination",
  ];

  const [certifications, setCertifications] = useState<CertificationSelection[]>([]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Output / Input</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select port type" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              <SelectItem value="input">Input</SelectItem>
              <SelectItem value="output">Output</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Output (carrier)</Label>
          <Input
            disabled
            value="Water"
            className={`${INPUT_CLASS} bg-gray-100`}
          />
        </div>
        <div>
          <Label>Output Quantity (m³/year)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 30"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <Label>Source</Label>
        <Select>
          <SelectTrigger className={SELECT_TRIGGER_CLASS}>
            <SelectValue placeholder="Select water source" />
          </SelectTrigger>
          <SelectContent className={SELECT_CONTENT_CLASS}>
            {sourceOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CertificationMultiSelectWithUpload
        label="Certification Source"
        options={certificationOptions.map((c) => ({ value: c }))}
        value={certifications}
        onChange={setCertifications}
        placeholder="Select one or more certifications"
      />
    </div>
  );
}


function Gate3SpotMarketForm() {
  const certificationOptions = [
    "Market settlement report",
    "Exchange statement",
    "Metering data",
  ];

  const [certifications, setCertifications] = useState<CertificationSelection[]>([]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Output / Input</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select port type" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              <SelectItem value="input">Input</SelectItem>
              <SelectItem value="output">Output</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Output (carrier)</Label>
          <Input
            disabled
            value="Electricity"
            className={`${INPUT_CLASS} bg-gray-100`}
          />
        </div>
        <div>
          <Label>Output Quantity (MWh/h)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 30"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Rate (€/MWh)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 20"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label>Market Type</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select market type" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              <SelectItem value="day-ahead">Day-Ahead</SelectItem>
              <SelectItem value="intraday">Intraday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <CertificationMultiSelectWithUpload
            label="Certification Source"
            options={certificationOptions.map((c) => ({ value: c }))}
            value={certifications}
            onChange={setCertifications}
        />

      </div>
    </div>
  );
}

function Gate4VentForm() {
  const carriers = [
    "Oxygen",
    "Nitrogen",
    "CO₂",
    "Hydrogen",
    "Methane",
    "Water vapor",
    "CO",
    "NOx",
    "VOCs",
  ];
  const certificationOptions = [
    "Environmental permit",
    "Emission monitoring report",
  ];

  const [certifications, setCertifications] = useState<CertificationSelection[]>([]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Input (carrier)</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select vented gas" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              {carriers.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            Must be a gas-type carrier.
          </p>
        </div>
        <div>
          <Label>Input Quantity (kg/h)</Label>
          <Input
            type="number"
            min={0}
            placeholder="Emitted amount"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <CertificationMultiSelectWithUpload
            label="Certification Source"
            options={certificationOptions.map((c) => ({ value: c }))}
            value={certifications}
            onChange={setCertifications}
        />

      </div>
    </div>
  );
}

const OFFTAKE_END_USES = [
  "Refineries",
  "Chemical Manufacturers",
  "Steel Industry",
  "Glass Industry",
  "Electronics & Semiconductor Industry",
  "Heavy-Duty Transport",
  "Aviation",
  "Automotive Industry",
  "Power Plants",
  "Energy Storage & Grid Balancing",
  "Natural-Gas Infrastructure",
  "Public-Sector Infrastructure",
  "Fertiliser Producers",
  "Agricultural Industry",
  "Shipping",
  "Industry",
  "Methanol Producers",
  "Petrochemical Industry",
  "Pharmaceuticals & Cosmetics",
  "Marine Shipping",
  "Automotive",
  "Cogeneration Plants",
  "Fuel Retailers",
  "Regulatory Bodies",
  "Government & Municipal Off-takers",
  "Public-Sector Fleets",
  "Power Generation",
  "Gas Utilities",
  "Industrial Heat Applications",
  "Maritime Shipping",
  "Gas Suppliers & Retailers",
  "Energy Utilities",
  "Private-Jet Operators",
  "Cargo Airlines",
  "Airport Operators",
  "Aviation-Fuel Suppliers",
  "Methanol-Fuel-Cell Developers",
  "E-fuel Production Companies",
  "Heavy-Duty Transport Manufacturers",
  "International Shipping Organisations",
  "Renewable Energy",
];

function OfftakeMarketForm({ title }: { title: string }) {
  const certificationOptions = [
    "Sales contract",
    "Delivery note",
    "Metering report",
    "Purchase agreement",
  ];
  const carrierOptions = [
    "Hydrogen",
    "Ammonia",
    "Methanol",
    "Methane",
    "Natural gas",
    "Kerosine",
    "Diesel",
    "Gasoline",
    "Naphtha",
    "Ethanol",
    "CNG",
    "LNG",
    "LPG",
    "Propane",
    "Other",
  ];

  const [endUses, setEndUses] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<CertificationSelection[]>([]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {title} – a carrier becomes a product when linked to this gate.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Input (carrier)</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              {carrierOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Input Quantity (kg)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 30"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* End use plain multi-select */}
      <div>
        <Label>Product End Use (multi-select)</Label>
        <MultiSelectEnum
          options={OFFTAKE_END_USES.map((v) => ({ value: v }))}
          value={endUses}
          onChange={setEndUses}
          placeholder="Select end uses"
        />
      </div>

      {/* Certification with upload */}
      <CertificationMultiSelectWithUpload
        label="Certification Source"
        options={certificationOptions.map((c) => ({ value: c }))}
        value={certifications}
        onChange={setCertifications}
        placeholder="Select proof of offtake"
      />
    </div>
  );
}


/* --------------- COMMON EQUIPMENT BASE FIELDS --------------- */

function EquipmentBaseFields() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Conversion Factor (0–1)</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.01}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label>Manufacturer</Label>
          <Input placeholder="OEM (free text)" className={INPUT_CLASS} />
        </div>
        <div>
          <Label>Capacity (rated nominal)</Label>
          <Input
            type="number"
            min={0}
            placeholder="Value depends on unit"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Pressure (bar)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 30"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label>Purity (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 99.99"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label>Temperature (°C)</Label>
          <Input
            type="number"
            placeholder="between -50 and 800"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------ EQUIPMENT FORMS ------------------ */

function ElectrolyserForm() {
  const technologies = ["PEM", "Alkaline", "SOEC"];

  return (
    <div className="space-y-4">
      <EquipmentBaseFields />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Technology Type</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select electrolyser type" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              {technologies.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Stack Replacement Interval (years)</Label>
          <Input
            type="number"
            min={0}
            max={20}
            placeholder="e.g. 7"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}

function DirectAirCaptureForm() {
  const mechanisms = [
    "Solid sorbent",
    "Liquid solvent",
    "Amine-based solvent",
    "Calcium looping",
    "Metal-organic framework (MOF)",
    "Ionic liquid",
    "Cryogenic separation",
    "Membrane separation",
    "Electrochemical capture",
    "Alkaline solution",
  ];

  return (
    <div className="space-y-4">
      <EquipmentBaseFields />
      <div>
        <Label>Capture Mechanism</Label>
        <Select>
          <SelectTrigger className={SELECT_TRIGGER_CLASS}>
            <SelectValue placeholder="Select mechanism" />
          </SelectTrigger>
          <SelectContent className={SELECT_CONTENT_CLASS}>
            {mechanisms.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function CO2CompressorForm() {
  return (
    <div className="space-y-4">
      <EquipmentBaseFields />
      <p className="text-xs text-gray-500">
        CO₂ compressor shares the standard efficiency / pressure / temperature
        fields. Capacity unit depends on implementation (flow or mass basis).
      </p>
    </div>
  );
}

function H2CompressorForm() {
  return (
    <div className="space-y-4">
      <EquipmentBaseFields />
      <p className="text-xs text-gray-500">
        H₂ compressor follows the same base fields; tune min/max ranges per
        equipment spec if needed.
      </p>
    </div>
  );
}

function HydrogenPurifierForm() {
  const methods = [
    "Membrane",
    "PSA",
    "Cryogenic",
    "Pressure swing adsorption",
    "Chemical scrubbing",
    "Distillation",
    "Adsorption",
    "Electrochemical separation",
  ];

  const subcomponents = [
    "PSA",
    "Dryer",
    "Membrane",
    "Adsorber A/B",
    "Heat Exchanger",
  ];

  const [selectedSubcomponents, setSelectedSubcomponents] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <EquipmentBaseFields />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Purification Method</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              {methods.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Subcomponents (multi-select)</Label>
          <MultiSelectEnum
            options={subcomponents.map((s) => ({ value: s }))}
            value={selectedSubcomponents}
            onChange={setSelectedSubcomponents}
            placeholder="Select subcomponents"
          />
        </div>
      </div>
    </div>
  );
}


function MethanolSynthesisForm() {
  const catalysts = ["Cu/ZnO/Al₂O₃", "Cu/ZnO/SiO₂", "Fe/Cr", "Other"];
  const subcomponents = [
    "Heat Exchanger",
    "Reactor",
    "Separator",
    "Pump",
    "Valve",
  ];

  const [selectedSubcomponents, setSelectedSubcomponents] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <EquipmentBaseFields />

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Catalyst Type</Label>
          <Select>
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue placeholder="Select catalyst" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASS}>
              {catalysts.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>CO₂ / H₂ Ratio (molar)</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            placeholder="e.g. 3"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label>Subcomponents (multi-select)</Label>
          <MultiSelectEnum
            options={subcomponents.map((s) => ({ value: s }))}
            value={selectedSubcomponents}
            onChange={setSelectedSubcomponents}
            placeholder="Select subcomponents"
          />
        </div>
      </div>
    </div>
  );
}


function BufferForm() {
  const subcomponents = [
    "Tank",
    "Valve",
    "Pressure Sensor",
    "Temperature Sensor",
    "Relief Valve",
  ];

  const [selectedSubcomponents, setSelectedSubcomponents] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <EquipmentBaseFields />

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Pressure (bar)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 30"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label>Capacity (kg)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 500"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label>Subcomponents (multi-select)</Label>
          <MultiSelectEnum
            options={subcomponents.map((s) => ({ value: s }))}
            value={selectedSubcomponents}
            onChange={setSelectedSubcomponents}
            placeholder="Select subcomponents"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Catalyst type and CO₂/H₂ ratio are not applicable for buffer units.
      </p>
    </div>
  );
}

function CO2PurifierForm() {
  const subcomponents = [
    "Scrubber",
    "Dryer",
    "Adsorber",
    "Heat Exchanger",
    "Liquefaction Module",
    "Filter",
  ];

  const [selectedSubcomponents, setSelectedSubcomponents] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <EquipmentBaseFields />

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Pressure (bar)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 15"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label>Capacity (kg/h)</Label>
          <Input
            type="number"
            min={0}
            placeholder="e.g. 200"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Label>Subcomponents (multi-select)</Label>
          <MultiSelectEnum
            options={subcomponents.map((s) => ({ value: s }))}
            value={selectedSubcomponents}
            onChange={setSelectedSubcomponents}
            placeholder="Select subcomponents"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Catalyst type and CO₂/H₂ ratio are not applicable for this unit.
      </p>
    </div>
  );
}

