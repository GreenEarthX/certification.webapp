import { useState, useEffect } from "react";
import { fetchRecommendations } from "@/services/recommendations/fetchRecommendationAPI";
import { Recommendation } from "@/models/recommendation";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const data = await fetchRecommendations();
        setRecommendations(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  return { recommendations, loading, error };
}
