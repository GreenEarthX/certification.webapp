// exampleEntityDefinition.ts

// What kind of UI widget to render for a field
export type UiType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "multiselect_file";

// One field in one form
export interface FieldDefinition {
  field_name: string;        // Label shown to the user
  field_type: UiType;        // Which UI component to use
  allowed_values?: string[]; // For select / multiselect / multiselect_file
  required?: boolean;
  unit?: string;             // For numeric fields
  min?: number;              // For numeric fields
  max?: number;              // For numeric fields
}

// One entity (gate or equipment)
export interface EntityDefinition {
  entity_name: string;      // e.g. "gate1-power"
  fields: FieldDefinition[];
}

/* ---------------- GATE 1 – POWER SUPPLY ---------------- */

export const gate1PowerDefinition: EntityDefinition = {
  entity_name: "gate1-power",
  fields: [
    {
      field_name: "Output / Input",
      field_type: "select",
      allowed_values: ["Input", "Output"],
      required: true,
    },
    {
      field_name: "Output (carrier)",
      field_type: "select",
      allowed_values: ["Electricity"],
      required: true,
    },
    {
      field_name: "Output Quantity (MWh/h)",
      field_type: "number",
      required: true,
      unit: "MWh/h",
      min: 0,
      max: 30,
    },
    {
      field_name: "Source",
      field_type: "select",
      allowed_values: [
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
      ],
      required: true,
    },
    {
      field_name: "Connection Type",
      field_type: "select",
      allowed_values: [
        "Direct Connection",
        "Grid Connection (offshore bidding zone)",
        "Grid Connection (interconnected bidding zone)",
        "Grid Connection (same bidding zone)",
        "Self Generation",
      ],
      required: true,
    },
    {
      field_name: "Certification Source",
      field_type: "multiselect_file",
      allowed_values: [
        "Power Purchase Agreement (PPA)",
        "Guarantee of Origin (GoO)",
        "Grid connection agreement",
        "Single Line Diagram (SLD)",
        "Metering point registration",
        "Engineering / EPC contract",
        "Commissioning certificate",
        "TSO attestation",
        "Cable diagram & metering scheme",
      ],
      required: false,
    },
    {
      field_name: "Refurbished / New",
      field_type: "select",
      allowed_values: ["Refurbished", "New"],
      required: false,
    },
    {
      field_name: "Plant Registry Code",
      field_type: "text",
      required: false,
    },
    {
      field_name: "Commercial Operating Date (COD)",
      field_type: "date",
      required: false,
    },
  ],
};

/* ---------------- GATE 2 – WATER SUPPLY ---------------- */

export const gate2WaterDefinition: EntityDefinition = {
  entity_name: "gate2-water",
  fields: [
    {
      field_name: "Output / Input",
      field_type: "select",
      allowed_values: ["Input", "Output"],
      required: true,
    },
    {
      field_name: "Output (carrier)",
      field_type: "select",
      allowed_values: ["Water"],
      required: true,
    },
    {
      field_name: "Output Quantity (m³/year)",
      field_type: "number",
      required: true,
      unit: "m³/year",
      min: 0,
      max: 30,
    },
    {
      field_name: "Source",
      field_type: "select",
      allowed_values: [
        "Municipal/Public water supply",
        "Groundwater (wells/boreholes)",
        "Surface water (River, Lakes, Reservoirs)",
        "Rainwater Harvesting / Collection System",
        "Reclaimed or recycled water",
        "Desalination",
      ],
      required: true,
    },
    {
      field_name: "Certification Source",
      field_type: "multiselect_file",
      allowed_values: [
        "Environmental Impact Assessment (EIA / ESIA)",
        "Water abstraction permit",
        "Wastewater discharge permit",
      ],
      required: false,
    },
  ],
};

/* ---------------- GATE 3 – SPOT MARKET ---------------- */

export const gate3SpotDefinition: EntityDefinition = {
  entity_name: "gate3-spot",
  fields: [
    {
      field_name: "Output / Input",
      field_type: "select",
      allowed_values: ["Input", "Output"],
      required: true,
    },
    {
      field_name: "Output (carrier)",
      field_type: "select",
      allowed_values: ["Electricity"],
      required: true,
    },
    {
      field_name: "Output Quantity (MWh/h)",
      field_type: "number",
      required: true,
      unit: "MWh/h",
      min: 0,
      max: 30,
    },
    {
      field_name: "Rate (€/MWh)",
      field_type: "number",
      required: false,
      unit: "€/MWh",
      min: 0,
      max: 20,
    },
    {
      field_name: "Market Type",
      field_type: "select",
      allowed_values: ["Day-Ahead", "Intraday"],
      required: false,
    },
    {
      field_name: "Certification Source",
      field_type: "multiselect_file",
      allowed_values: [
        "Market settlement report",
        "Exchange statement",
        "Metering data",
      ],
      required: false,
    },
  ],
};

/* ---------------- GATE 4 – VENT ---------------- */

export const gate4VentDefinition: EntityDefinition = {
  entity_name: "gate4-vent",
  fields: [
    {
      field_name: "Input (carrier)",
      field_type: "select",
      allowed_values: [
        "Oxygen",
        "Nitrogen",
        "CO₂",
        "Hydrogen",
        "Methane",
        "Water vapor",
        "CO",
        "NOx",
        "VOCs",
      ],
      required: true,
    },
    {
      field_name: "Input Quantity (kg/h)",
      field_type: "number",
      required: true,
      unit: "kg/h",
      min: 0,
    },
    {
      field_name: "Certification Source",
      field_type: "multiselect_file",
      allowed_values: ["Environmental permit", "Emission monitoring report"],
      required: false,
    },
  ],
};

/* ---------------- GATE 5 – OFFTAKE MARKET 1 ---------------- */

export const gate5OfftakeDefinition: EntityDefinition = {
  entity_name: "gate5-offtake1",
  fields: [
    {
      field_name: "Input (carrier)",
      field_type: "select",
      allowed_values: [
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
      ],
      required: true,
    },
    {
      field_name: "Input Quantity (kg)",
      field_type: "number",
      required: true,
      unit: "kg",
      min: 0,
      max: 30,
    },
    {
      field_name: "Product End Use",
      field_type: "multiselect",
      allowed_values: [
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
      ],
      required: false,
    },
    {
      field_name: "Certification Source",
      field_type: "multiselect_file",
      allowed_values: [
        "Sales contract",
        "Delivery note",
        "Metering report",
        "Purchase agreement",
      ],
      required: false,
    },
  ],
};

/* ---------------- GATE 6 – OFFTAKE MARKET 2 ---------------- */

export const gate6OfftakeDefinition: EntityDefinition = {
  entity_name: "gate6-offtake2",
  fields: [...gate5OfftakeDefinition.fields],
};

/* ---------------- EQ1 – ELECTROLYSER ---------------- */

export const eq1ElectrolyserDefinition: EntityDefinition = {
  entity_name: "eq1-electrolyser",
  fields: [
    {
      field_name: "Conversion Factor",
      field_type: "number",
      required: true,
      min: 0,
      max: 1,
    },
    {
      field_name: "Manufacturer",
      field_type: "text",
      required: false,
    },
    {
      field_name: "Pressure (bar)",
      field_type: "number",
      required: false,
      unit: "bar",
      min: 0,
      max: 30,
    },
    {
      field_name: "Purity (%)",
      field_type: "number",
      required: false,
      unit: "%",
      min: 0,
      max: 100,
    },
    {
      field_name: "Temperature (°C)",
      field_type: "number",
      required: false,
      unit: "°C",
      min: -50,
      max: 800,
    },
    {
      field_name: "Capacity",
      field_type: "number",
      required: false,
      min: 0,
    },
    {
      field_name: "Technology Type",
      field_type: "select",
      allowed_values: ["PEM", "Alkaline", "SOEC"],
      required: true,
    },
    {
      field_name: "Stack Replacement Interval (years)",
      field_type: "number",
      required: false,
      unit: "years",
      min: 0,
      max: 20,
    },
  ],
};

/* ---------------- EQ2 – DIRECT AIR CAPTURE ---------------- */

export const eq2DacDefinition: EntityDefinition = {
  entity_name: "eq2-dac",
  fields: [
    {
      field_name: "Conversion Factor",
      field_type: "number",
      required: true,
      min: 0,
      max: 1,
    },
    {
      field_name: "Manufacturer",
      field_type: "text",
      required: false,
    },
    {
      field_name: "Pressure (bar)",
      field_type: "number",
      required: false,
      unit: "bar",
      min: 0,
      max: 30,
    },
    {
      field_name: "Purity (%)",
      field_type: "number",
      required: false,
      unit: "%",
      min: 0,
      max: 100,
    },
    {
      field_name: "Temperature (°C)",
      field_type: "number",
      required: false,
      unit: "°C",
      min: -50,
      max: 800,
    },
    {
      field_name: "Capacity",
      field_type: "number",
      required: false,
      min: 0,
    },
    {
      field_name: "Capture Mechanism",
      field_type: "select",
      allowed_values: [
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
      ],
      required: true,
    },
  ],
};

/* ---------------- EQ3 – CO₂ COMPRESSOR ---------------- */

export const eq3CO2CompressorDefinition: EntityDefinition = {
  entity_name: "eq3-co2-compressor",
  fields: [
    {
      field_name: "Conversion Factor",
      field_type: "number",
      required: true,
      min: 0,
      max: 1,
    },
    {
      field_name: "Manufacturer",
      field_type: "text",
      required: false,
    },
    {
      field_name: "Pressure (bar)",
      field_type: "number",
      required: false,
      unit: "bar",
      min: 0,
      max: 30,
    },
    {
      field_name: "Purity (%)",
      field_type: "number",
      required: false,
      unit: "%",
      min: 0,
      max: 100,
    },
    {
      field_name: "Temperature (°C)",
      field_type: "number",
      required: false,
      unit: "°C",
      min: -50,
      max: 800,
    },
    {
      field_name: "Capacity",
      field_type: "number",
      required: false,
      min: 0,
    },
  ],
};

/* ---------------- EQ4 – H₂ COMPRESSOR ---------------- */

export const eq4H2CompressorDefinition: EntityDefinition = {
  entity_name: "eq4-h2-compressor",
  fields: [
    {
      field_name: "Conversion Factor",
      field_type: "number",
      required: true,
      min: 0,
      max: 1,
    },
    {
      field_name: "Manufacturer",
      field_type: "text",
      required: false,
    },
    {
      field_name: "Pressure (bar)",
      field_type: "number",
      required: false,
      unit: "bar",
      min: 0,
      max: 30,
    },
    {
      field_name: "Purity (%)",
      field_type: "number",
      required: false,
      unit: "%",
      min: 0,
      max: 100,
    },
    {
      field_name: "Temperature (°C)",
      field_type: "number",
      required: false,
      unit: "°C",
      min: -50,
      max: 800,
    },
    {
      field_name: "Capacity",
      field_type: "number",
      required: false,
      min: 0,
    },
  ],
};

/* ---------------- EQ5 – HYDROGEN PURIFIER ---------------- */

export const eq5HydrogenPurifierDefinition: EntityDefinition = {
  entity_name: "eq5-h2-purifier",
  fields: [
    {
      field_name: "Conversion Factor",
      field_type: "number",
      required: true,
      min: 0,
      max: 1,
    },
    {
      field_name: "Manufacturer",
      field_type: "text",
      required: false,
    },
    {
      field_name: "Pressure (bar)",
      field_type: "number",
      required: false,
      unit: "bar",
      min: 0,
      max: 30,
    },
    {
      field_name: "Purity (%)",
      field_type: "number",
      required: false,
      unit: "%",
      min: 0,
      max: 100,
    },
    {
      field_name: "Temperature (°C)",
      field_type: "number",
      required: false,
      unit: "°C",
      min: -50,
      max: 800,
    },
    {
      field_name: "Capacity",
      field_type: "number",
      required: false,
      min: 0,
    },
    {
      field_name: "Purification Method",
      field_type: "select",
      allowed_values: [
        "Membrane",
        "PSA",
        "Cryogenic",
        "Pressure swing adsorption",
        "Chemical scrubbing",
        "Distillation",
        "Adsorption",
        "Electrochemical separation",
      ],
      required: true,
    },
    {
      field_name: "Subcomponents",
      field_type: "multiselect",
      allowed_values: [
        "PSA",
        "Dryer",
        "Membrane",
        "Adsorber A/B",
        "Heat Exchanger",
      ],
      required: false,
    },
  ],
};

/* ---------------- EQ6 – METHANOL SYNTHESIS ---------------- */

export const eq6MethanolSynthesisDefinition: EntityDefinition = {
  entity_name: "eq6-methanol",
  fields: [
    {
      field_name: "Conversion Factor",
      field_type: "number",
      required: true,
      min: 0,
      max: 1,
    },
    {
      field_name: "Manufacturer",
      field_type: "text",
      required: false,
    },
    {
      field_name: "Pressure (bar)",
      field_type: "number",
      required: false,
      unit: "bar",
      min: 0,
      max: 30,
    },
    {
      field_name: "Purity (%)",
      field_type: "number",
      required: false,
      unit: "%",
      min: 0,
      max: 100,
    },
    {
      field_name: "Temperature (°C)",
      field_type: "number",
      required: false,
      unit: "°C",
      min: -50,
      max: 800,
    },
    {
      field_name: "Capacity",
      field_type: "number",
      required: false,
      min: 0,
    },
    {
      field_name: "Catalyst Type",
      field_type: "select",
      allowed_values: ["Cu/ZnO/Al₂O₃", "Cu/ZnO/SiO₂", "Fe/Cr", "Other"],
      required: true,
    },
    {
      field_name: "CO₂ / H₂ Ratio (molar)",
      field_type: "number",
      required: false,
      unit: "molar ratio",
      min: 0,
    },
    {
      field_name: "Subcomponents",
      field_type: "multiselect",
      allowed_values: [
        "Heat Exchanger",
        "Reactor",
        "Separator",
        "Pump",
        "Valve",
      ],
      required: false,
    },
  ],
};

/* ---------------- EQ7 – BUFFER ---------------- */

export const eq7BufferDefinition: EntityDefinition = {
  entity_name: "eq7-buffer",
  fields: [
    {
      field_name: "Conversion Factor",
      field_type: "number",
      required: true,
      min: 0,
      max: 1,
    },
    {
      field_name: "Manufacturer",
      field_type: "text",
      required: false,
    },
    {
      field_name: "Pressure (bar)",
      field_type: "number",
      required: true,
      unit: "bar",
      min: 0,
      max: 30,
    },
    {
      field_name: "Purity (%)",
      field_type: "number",
      required: false,
      unit: "%",
      min: 0,
      max: 100,
    },
    {
      field_name: "Temperature (°C)",
      field_type: "number",
      required: false,
      unit: "°C",
      min: -50,
      max: 200,
    },
    {
      field_name: "Capacity (kg)",
      field_type: "number",
      required: true,
      unit: "kg",
      min: 0,
      max: 500,
    },
    {
      field_name: "Subcomponents",
      field_type: "multiselect",
      allowed_values: [
        "Tank",
        "Valve",
        "Pressure Sensor",
        "Temperature Sensor",
        "Relief Valve",
      ],
      required: false,
    },
  ],
};

/* ---------------- EQ8 – CO₂ PURIFIER ---------------- */

export const eq8CO2PurifierDefinition: EntityDefinition = {
  entity_name: "eq8-co2-purifier",
  fields: [
    {
      field_name: "Conversion Factor",
      field_type: "number",
      required: true,
      min: 0,
      max: 1,
    },
    {
      field_name: "Manufacturer",
      field_type: "text",
      required: false,
    },
    {
      field_name: "Pressure (bar)",
      field_type: "number",
      required: true,
      unit: "bar",
      min: 0,
      max: 15,
    },
    {
      field_name: "Purity (%)",
      field_type: "number",
      required: false,
      unit: "%",
      min: 0,
      max: 100,
    },
    {
      field_name: "Temperature (°C)",
      field_type: "number",
      required: false,
      unit: "°C",
      min: -50,
      max: 200,
    },
    {
      field_name: "Capacity (kg/h)",
      field_type: "number",
      required: true,
      unit: "kg/h",
      min: 0,
      max: 200,
    },
    {
      field_name: "Subcomponents",
      field_type: "multiselect",
      allowed_values: [
        "Scrubber",
        "Dryer",
        "Adsorber",
        "Heat Exchanger",
        "Liquefaction Module",
        "Filter",
      ],
      required: false,
    },
  ],
};

/* ------------- MAP OF ALL ENTITIES + DEFAULT ------------- */

export const entityDefinitions: Record<string, EntityDefinition> = {
  "gate1-power": gate1PowerDefinition,
  "gate2-water": gate2WaterDefinition,
  "gate3-spot": gate3SpotDefinition,
  "gate4-vent": gate4VentDefinition,
  "gate5-offtake1": gate5OfftakeDefinition,
  "gate6-offtake2": gate6OfftakeDefinition,
  "eq1-electrolyser": eq1ElectrolyserDefinition,
  "eq2-dac": eq2DacDefinition,
  "eq3-co2-compressor": eq3CO2CompressorDefinition,
  "eq4-h2-compressor": eq4H2CompressorDefinition,
  "eq5-h2-purifier": eq5HydrogenPurifierDefinition,
  "eq6-methanol": eq6MethanolSynthesisDefinition,
  "eq7-buffer": eq7BufferDefinition,
  "eq8-co2-purifier": eq8CO2PurifierDefinition,
};

// So your old import still works
export const exampleEntityDefinition = gate5OfftakeDefinition;
