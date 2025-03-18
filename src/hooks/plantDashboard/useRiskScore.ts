import { useState, useEffect } from "react";
import { fetchRiskScore } from "@/services/plantDashboard/riskScore/fetchService";

export function useRiskScore(plantId?: string) {
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plantId) return;

    const loadRiskScore = async () => {
      setLoading(true);
      const score = await fetchRiskScore(plantId);
      setRiskScore(score);
      setLoading(false);
    };

    loadRiskScore();
  }, [plantId]);

  return { riskScore, loading };
}
