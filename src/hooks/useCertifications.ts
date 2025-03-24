import { useState, useEffect } from "react";
import { fetchCertifications } from "@/services/certifications/fetchCertificationsAPI";
import { fetchCertificationById } from "@/services/certifications/fetchCertificationsAPI";
import { Certification } from "@/models/certification";

export function useCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certification, setCertification] = useState<Certification | null>(null);
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

  // 👇 method to fetch single certification on-demand
  const getCertificationById = async (id: string) => {
    setLoading(true);
    try {
      const data = await fetchCertificationById(id);
      setCertification(data);
    } catch (error) {
      setError((error as Error).message);
      setCertification(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    certifications,
    certification,
    getCertificationById,
    loading,
    error,
  };
}
