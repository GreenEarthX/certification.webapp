import { useState } from 'react';
import { registerCertification as registerCertificationService } from '@/services/certifications/fetchCertificationsAPI';

export default function useCertificationRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerCertification = async (uploadedData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const certification = await registerCertificationService(uploadedData);
      return certification;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { registerCertification, isLoading, error };
}
