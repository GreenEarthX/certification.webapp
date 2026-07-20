import { useState } from "react";
import { deletePlant as deletePlantService } from "@/services/plants/fetchPlantAPI";

export function useDeletePlant() {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deletePlant = async (plantId: number): Promise<{ success: boolean; message: string }> => {
    try {
      setDeletingId(plantId);

      await deletePlantService(plantId);

      return { success: true, message: "Plant deleted successfully!" };
    } catch (err) {
      const message = (err as Error).message || "Unknown error occurred.";
      setError(message);
      return { success: false, message };
    } finally {
      setDeletingId(null);
    }
  };

  return {
    deletePlant,
    deletingId,
    error,
  };
}
