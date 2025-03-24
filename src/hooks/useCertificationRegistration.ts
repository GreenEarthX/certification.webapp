import { useState } from 'react';

export default function useCertificationRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerCertification = async (uploadedData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/plants/registration", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadedData),
      });

      if (!res.ok) throw new Error("Certification registration failed.");

      const data = await res.json();
      return data.certification;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { registerCertification, isLoading, error };
}
