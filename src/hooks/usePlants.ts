import { useState, useEffect } from "react";
import { Plant } from "@/models/plant";
import { fetchPlants } from "@/services/plants/fetchService";

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlants() {
      try {
        const data = await fetchPlants();
        setPlants(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadPlants();
  }, []);

  return { plants, loading, error };
}
