import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Models
import { UploadedData } from "@/models/certificationUploadedData";
import { CertificationOption } from "@/models/certification";

// Services
import {
  fetchCertificationOptions,
  fetchOperatorId,
  registerCertification as registerCertificationService,
} from "@/services/certifications/fetchCertificationsAPI";

export default function useStep3Confirmation(
  uploadedData: UploadedData,
  setUploadedData: React.Dispatch<React.SetStateAction<UploadedData>>
) {
  const [certificationOptions, setCertificationOptions] = useState<CertificationOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const urlPlantId = searchParams.get("plant_id");

  // Register certification logic moved here
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

  useEffect(() => {
    const loadOperatorId = async () => {
      try {
        const operatorId = await fetchOperatorId(Number(urlPlantId));
        setUploadedData((prev) => ({
          ...prev,
          plant_id: Number(urlPlantId),
          operator_id: operatorId,
        }));
      } catch (err) {
        console.error("Failed to fetch operator ID", err);
      }
    };

    if ((!uploadedData?.plant_id || uploadedData.plant_id === 0) && urlPlantId) {
      loadOperatorId();
    }
  }, [urlPlantId, uploadedData?.plant_id]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await fetchCertificationOptions();
        setCertificationOptions(data);
      } catch (e) {
        console.error("Failed to fetch certification options", e);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    // If the certificationName doesn't match any fetched options, fix it
    const hasMatch = certificationOptions.some(
      (opt) => opt.certification_scheme_name === uploadedData.certificationName
    );

    if (
      uploadedData.certificationName &&
      !hasMatch &&
      certificationOptions.length > 0
    ) {
      const closest = certificationOptions.find((opt) =>
        opt.certification_scheme_name.toLowerCase().includes(
          uploadedData.certificationName?.toLowerCase() || ""
        )
      );

      if (closest) {
        setUploadedData((prev) => ({
          ...prev,
          certificationName: closest.certification_scheme_name,
        }));
      }
    }
  }, [certificationOptions, uploadedData.certificationName]);


  useEffect(() => {
    const selected = certificationOptions.find(
      (opt) =>
        opt.certification_scheme_name === uploadedData.certificationName ||
        opt.certification_scheme_name.toLowerCase().includes(
          uploadedData.certificationName?.toLowerCase() || ""
        )
    );
  
    if (selected) {
      setUploadedData((prev) => ({
        ...prev,
        certificationName: selected.certification_scheme_name, // 👈 add this line
        type: selected.certificate_type,
        entity: selected.entity,
        validityDate: selected.validity,
        certificationBody: selected.certification_bodies.join(", "),
        compliesWith: selected.complies_with.join(", "),
        owner: selected.owners?.[0] ?? "",
      }));
    }
  }, [uploadedData.certificationName, certificationOptions]);
  

  const handleSaveCertificate = async () => {
    try {
      const result = await registerCertification(uploadedData);
      if (result) {
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      alert(error?.message || "Error during certification registration");
    }
  };

  return {
    certificationOptions,
    loadingOptions,
    showSuccessModal,
    setShowSuccessModal,
    handleSaveCertificate,
    isLoading,
    error,
  };
}
