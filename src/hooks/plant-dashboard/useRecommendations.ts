import { useState, useEffect } from "react";
import { fetchRecommendations } from "@/services/plant-dashboard/recommendations/fetchRecommendationAPI";

export function useRecommendations(plantId?: string) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plantId) return;

    const loadRecommendations = async () => {
      setLoading(true);
      const data = await fetchRecommendations(plantId);
      setRecommendations(data);
      setLoading(false);
    };

    loadRecommendations();
  }, [plantId]);

  return { recommendations, loading };
}
