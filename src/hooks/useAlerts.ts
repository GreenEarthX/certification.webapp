import { useState, useEffect } from "react";
import { Alert } from "@/models/alert";
import { fetchAlerts } from "@/services/alerts/fetchService"; 

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await fetchAlerts(); 
        setAlerts(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  return { alerts, loading, error };
}
