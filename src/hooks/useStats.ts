// src/hooks/useStats.ts
import { useState, useEffect } from "react";
import { fetchStats } from "@/services/stats/fetchStatsAPI";
import { Stats } from "@/models/stat";

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    active: 0,
    expired: 0,
    expiring: 0,
    pending: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return { stats, loading, error };
}
