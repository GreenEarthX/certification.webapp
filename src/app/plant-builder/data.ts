import { CertificationScheme } from "./types";

export const certificationSchemes: CertificationScheme[] = [
  {
    id: "rfnbo",
    name: "RFNBO",
    criteria: {
      origin: ["wind", "solar", "hydro"],
      carbonFootprint: { max: 3.4, unit: "gCO2e/MJ" },
      chainOfCustody: ["mass-balance", "book-and-claim"],
      markets: ["EU", "UK"],
    },
    weight: 0.4,
  },
  {
    id: "advanced",
    name: "Advanced Biofuels",
    criteria: {
      origin: ["biomass", "waste"],
      carbonFootprint: { max: 5.0, unit: "gCO2e/MJ" },
      chainOfCustody: ["mass-balance"],
      markets: ["EU", "US"],
    },
    weight: 0.3,
  },
  {
    id: "annexIXA",
    name: "Annex IX Part A",
    criteria: {
      origin: ["waste", "residues"],
      carbonFootprint: { max: 4.0, unit: "gCO2e/MJ" },
      chainOfCustody: ["mass-balance"],
      markets: ["EU"],
    },
    weight: 0.2,
  },
  {
    id: "annexIXB",
    name: "Annex IX Part B",
    criteria: {
      origin: ["used cooking oil", "animal fats"],
      carbonFootprint: { max: 4.5, unit: "gCO2e/MJ" },
      chainOfCustody: ["mass-balance"],
      markets: ["EU"],
    },
    weight: 0.1,
  },
];

export const hardcodedProducts: ProductInfo[] = [
  {
    productName: "Hydrogen",
    productType: "Fuel",
    productionCapacity: "1000",
    unit: "kg/day",
    fuelType: "Renewable Hydrogen",
    fuelClass: "RFNBO",
    feedstock: "Wind",
    carbonFootprint: { value: 2.5, unit: "gCO2e/MJ" },
    offtakeLocation: undefined,
    downstreamOperations: "",
    verified: true,
  },
  {
    productName: "Biodiesel",
    productType: "Fuel",
    productionCapacity: "5000",
    unit: "liters/day",
    fuelType: "Biofuel",
    fuelClass: "Advanced Biofuel",
    feedstock: "Used Cooking Oil",
    carbonFootprint: { value: 4.0, unit: "gCO2e/MJ" },
    offtakeLocation: undefined,
    downstreamOperations: "",
    verified: true,
  },
  {
    productName: "SAF",
    productType: "Fuel",
    productionCapacity: "2000",
    unit: "liters/day",
    fuelType: "Biofuel",
    fuelClass: "Advanced Biofuel",
    feedstock: "Biomass",
    carbonFootprint: { value: 5.5, unit: "gCO2e/MJ" },
    offtakeLocation: undefined,
    downstreamOperations: "",
    verified: false,
  },
];

export const hardcodedComponents: PlacedComponent[] = [
  {
    id: "gate1",
    name: "Output Gate Hydrogen",
    type: "gate",
    category: "Output",
    position: { x: 0, y: 0 },
    data: {
      gateType: "output",
      product: "Fuel",
      sourceOrigin: "wind",
      chainOfCustody: "mass-balance",
    },
    certifications: [],
  },
  {
    id: "carrier1",
    name: "Carrier Hydrogen",
    type: "carrier",
    category: "Carrier",
    position: { x: 0, y: 0 },
    data: {
      product: "Fuel",
      carbonFootprint: 2.5,
    },
    certifications: [],
  },
];

export const hardcodedPlantInfo: PlantInfo = {
  plantName: "Test Plant",
  projectName: "Test Project",
  projectType: "Renewable",
  primaryFuelType: "Hydrogen",
  country: "EU",
  status: "operational",
  commercialOperationalDate: "2024-01-01",
};