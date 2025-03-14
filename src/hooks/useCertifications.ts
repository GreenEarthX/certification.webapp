import { useState, useEffect } from "react";
import { fetchCertifications } from "@/services/certifications/fetchService";
import { Certification } from "@/models/certification";

export function useCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCertifications() {
      try {
        const data = await fetchCertifications();
        setCertifications(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadCertifications();
  }, []);

  return { certifications, loading, error };
}
