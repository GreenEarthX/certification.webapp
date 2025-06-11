export interface FormDataType {
  generalInfo: {};
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

