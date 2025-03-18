import { useState, useEffect } from "react";
import { fetchCertifications } from "@/services/plantDashboard/certifications/list/fetchService";

interface Certification {
  name: string;
  entity: string;
  date: string;
  type: string;
  status: string;
  id: string;
}

export function useCertifications(plantId?: string) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!plantId) return;

    const loadCertifications = async () => {
      setLoading(true);
      const data: Certification[] = await fetchCertifications(plantId);
      console.log("Fetched Certifications in Hook:", data);
      setCertifications(data);
      setLoading(false);
    };

    loadCertifications();
  }, [plantId]);

  return { certifications, loading };
}
