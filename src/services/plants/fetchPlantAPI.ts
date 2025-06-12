export interface FormDataType {
  hydrogen: any;
  ammonia: any;
  biofuels: any;
  saf: any;
  eng: any;
  methanol: any;
  electricity: {
    plant_id?: number;
    energyMix: { type: string; percent: string }[];
    sources: { type: string; details: any; file: File | null; uri?: string }[];
  };
  water: {
    waterConsumption: string;
    waterSources: string[];
    trackWaterUsage: boolean | null;
    treatmentLocation: { [source: string]: string[] }; 
    monitoringFile?: File | null; 
  };
  ghg: any;
  traceability: any;
  offtakers: any;
  certifications: any;
}

export interface Plant {
  id: number;
  name: string;
  type: string;
  address: string;
  riskScore: number;
  fuel_id: number;
}


export const fetchAllPlants = async () => {
  const res = await fetch("/api/plants");
  if (!res.ok) throw new Error("Failed to fetch plants");
  return res.json();
};

  
export const deletePlant = async (plantId: number): Promise<void> => {
  const res = await fetch(`/api/plants/${plantId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete plant.");
};


export const fetchPlantDetails = async (plantId: number): Promise<FormDataType> => {
  const res = await fetch(`/api/plants/${plantId}/details`);
  if (!res.ok) throw new Error("Failed to fetch plant details");
  return res.json();
};

export const savePlantDetails = async (plantId: number, data: FormDataType): Promise<void> => {
  const res = await fetch("/api/plants/save-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plant_id: plantId, data }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Server responded with:', errorText);
    throw new Error("Failed to save plant details");
  }
};




export interface SectionSchema {
  $schema: string;
  title: string;
  sectionKey: string;
  sections: any[];
}

export interface PlantSchemas {
  coverage_id: number;
  section_general_info: SectionSchema;
  section_market_and_offtakers: SectionSchema;
  section_electricity_water: SectionSchema;
  section_ghg_reduction: SectionSchema;
  section_traceability: SectionSchema;
  section_certifications: SectionSchema;
}


export const fetchSchemasByCoverage = async (
  coverageId: number
): Promise<PlantSchemas | null> => {
  const res = await fetch(`/api/admin/manage-plants-details/schemas?coverageId=${coverageId}`);
  if (!res.ok) throw new Error("Failed to fetch plant form schemas");
  return res.json();
};

export const saveSchemas = async (schemas: PlantSchemas): Promise<void> => {
  const res = await fetch("/api/admin/manage-plants-details", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schemas),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Schema save error:", errorText);
    throw new Error("Failed to save schemas");
  }
};