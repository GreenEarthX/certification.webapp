import { useState, useEffect } from "react";
import { Plant } from "@/models/plant";
import { fetchAllPlants } from "@/services/plants/fetchPlantAPI";

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlants() {
      try {
        const data = await fetchAllPlants();
        setPlants(data);
        console.log("Fetched Plants:", data); // Check if 'id' is present
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
