import { useState, useEffect } from "react";
import { fetchCertificationsList } from "@/services/plant-dashboard/certifications/fetchCertificationAPI";

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
      const data: Certification[] = await fetchCertificationsList(plantId);
      console.log("Fetched Certifications in Hook:", data);
      setCertifications(data);
      setLoading(false);
    };

    loadCertifications();
  }, [plantId]);

  return { certifications, loading };
}
