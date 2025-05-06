import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash.debounce';
import {
  fetchAllPlants,
  fetchPlantDetails,
  savePlantDetails,
  Plant,
  FormDataType
} from '@/services/plants/fetchPlantAPI';


interface ElectricitySource {
  type: string;
  details: any;
  file: File | null;
  uri?: string;
}

interface ElectricityData {
  plant_id?: number;
  energyMix: { type: string; percent: string }[];
  sources: ElectricitySource[];
}

interface WaterData {
  waterConsumption: string;
  waterSources: string[];
  trackWaterUsage: boolean | null;
}


export function usePlantDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [fuelType, setFuelType] = useState('');
  const [formData, setFormData] = useState<FormDataType>(getEmptyFormData());

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  

  function getEmptyFormData(): FormDataType {
    return {
      hydrogen: {},
      ammonia: {},
      biofuels: {},
      saf: {},
      eng: {},
      methanol: {},
      electricity: {
        energyMix: [{ type: '', percent: '' }],
        sources: [],
      },
      water: {
        waterConsumption: '',
        waterSources: [],
        trackWaterUsage: null,
      },
      ghg: {},
      traceability: {},
      offtakers: {},
      certifications: {},
    };
  }

  // Debounced autosave
  const autosave = useCallback(
    debounce(async (updatedData: FormDataType, plantId: number | null) => {
      if (!plantId) return;
      try {
        setSaving(true);
        await savePlantDetails(plantId, updatedData);
        setLastSaved(Date.now());
      } catch (err) {
        console.error('❌ Autosave failed:', err);
      } finally {
        setSaving(false);
      }
    }, 1000),
    []
  );
  

  useEffect(() => {
    const getPlants = async () => {
      try {
        const data = await fetchAllPlants();
        setPlants(data);
  
        const selected = searchParams.get('selected');
        const paramId = selected ? Number(selected) : data[0]?.id ?? null;
  
        setSelectedPlantId(paramId);
        const foundPlant = data.find((p: Plant) => p.id === paramId) || null;
        setSelectedPlant(foundPlant);
  
        if (foundPlant?.type) {
          setFuelType(foundPlant.type.trim().toLowerCase());
        }
      } catch (err) {
        console.error('❌ Failed to load plants:', err);
      }
    };
  
    getPlants();
  }, [searchParams]);
  

  useEffect(() => {
    const getDetails = async () => {
      setIsDataLoaded(false);
      const current = plants.find((p) => p.id === selectedPlantId) || null;
      setSelectedPlant(current);
      setFuelType(current?.type?.trim().toLowerCase() || '');
      setFormData(getEmptyFormData());
  
      if (selectedPlantId) {
        try {
          const data = await fetchPlantDetails(selectedPlantId);
          setFormData((prev) => ({ ...prev, ...data }));
          setIsDataLoaded(true);
        } catch (err) {
          console.error('❌ Failed to fetch plant details:', err);
        }
      }
    };
  
    getDetails();
  }, [selectedPlantId, plants]);
  

  useEffect(() => {
    if (isDataLoaded) {
      autosave(formData, selectedPlantId);
    }
  }, [formData]);

  return {
    formData,
    setFormData,
    plants,
    selectedPlantId,
    setSelectedPlantId,
    selectedPlant,
    fuelType,
    setFuelType,
    saving,
    lastSaved,
    router,
  };
}
