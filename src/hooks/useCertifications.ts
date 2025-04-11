import { useState, useEffect } from "react";
import { fetchCertifications, fetchCertificationById } from "@/services/certifications/fetchCertificationsAPI";
import { Certification, CertificationDetail } from "@/models/certification";

export function useCertifications(certificationId?: string) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certification, setCertification] = useState<CertificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all certifications
  useEffect(() => {
    if (!certificationId) {
      const loadCertifications = async () => {
        try {
          const data = await fetchCertifications();
          setCertifications(data);
        } catch (error) {
          setError((error as Error).message);
        } finally {
          setLoading(false);
        }
      };

      loadCertifications();
    }
  }, [certificationId]);

  // Fetch single certification if id is provided
  useEffect(() => {
    if (certificationId) {
      const fetchById = async () => {
        setLoading(true);
        try {
          const data = await fetchCertificationById(certificationId);
          setCertification(data);
        } catch (error) {
          setError((error as Error).message);
          setCertification(null);
        } finally {
          setLoading(false);
        }
      };

      fetchById();
    }
  }, [certificationId]);

  return {
    certifications,
    certification,
    loading,
    error,
  };
}
