import { useState, useEffect } from "react";
import { fetchPlants } from "@/services/plants/fetchPlantAPI";

interface Plant {
  plant_id: string;
  plant_name: string;
}

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlants = async () => {
      setLoading(true);
      const data = await fetchPlants();
      setPlants(data);
      setLoading(false);
    };

    loadPlants();
  }, []);

  return { plants, loading };
}
