interface ElectricityData {
    selectedSources: string[];
    ppaFile: File | null;
    energyMix: { type: string; percent: string }[];
  }
  
  interface WaterData {
    waterConsumption: string;
    waterSources: string[];
    trackWaterUsage: boolean | null;
  }
  
  interface FormDataType {
    hydrogen: any;
    ammonia: any;
    biofuels: any;
    saf: any;
    eng: any;
    methanol: any;
    electricity: ElectricityData;
    water: WaterData;
    ghg: any;
    traceability: any;
    offtakers: any;
    certifications: any;
  }
  