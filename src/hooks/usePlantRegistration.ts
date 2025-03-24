// src/hooks/usePlantRegistration.ts
import { useState, useEffect } from "react";
import { fetchFormData, submitPlantRegistration } from "@/services/plantRegistration/fetchPlantAPI";
import { UploadedData } from "@/models/CertificationUploadedData";

interface FormData {
  role: string;
  plantName: string;
  fuelType: string;
  address: { country: string; region: string };
  plantStage: string;
  certification: boolean;
}

export default function usePlantRegistration() {
  const [formData, setFormData] = useState<FormData>({
    role: "",
    plantName: "",
    fuelType: "",
    address: { country: "", region: "" },
    plantStage: "",
    certification: false,
  });

  const [addressOptions, setAddressOptions] = useState([]);
  const [plantStages, setPlantStages] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchFormData();
      setAddressOptions(data.address);
      setPlantStages(data.stage);
      setFuelTypes(data.fuel);
    };
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "country" || name === "region") {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, certification: e.target.value === "yes" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitPlantRegistration(formData);
    setCurrentStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setTimeout(() => {
        setUploadedData((prevData) => ({
          ...prevData!,
          certificationName: "Certify+ Schema",
          type: "Type A",
          entity: "Certify+",
          certificationBody: "Certify",
          issueDate: "25/04/2026",
          validityDate: "25/04/2030",
          certificateNumber: "285933006",
          compliesWith: "REDD2",
        }));
        setIsLoading(false);
        setCurrentStep(3);
      }, 2000);
    }
  };
  

  const handleBack = () => setCurrentStep(1);

  return {
    formData,
    addressOptions,
    plantStages,
    fuelTypes,
    currentStep,
    isLoading,
    uploadedData,
    handleChange,
    handleCertificationChange,
    handleSubmit,
    handleFileUpload,
    handleBack,
    setCurrentStep,
    setUploadedData,
  };
}
