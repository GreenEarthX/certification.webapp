import { useState, useEffect } from "react";
import { fetchFormData, submitPlantRegistration } from "@/services/plant-registration/fetchPlantAPI";
import { UploadedData } from "@/models/certificationUploadedData";
import { PlantFormData } from "@/models/plantRegistration";

export default function usePlantRegistration(stepParam?: string, router?: any) {
  const [formData, setFormData] = useState<PlantFormData>({
    role: "",
    plantName: "",
    fuelType: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    plantStage: "",
    certification: false,
  });

  const [plantStages, setPlantStages] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchFormData();
      setPlantStages(data.stage);
      setFuelTypes(data.fuel);
    };
    loadData();
  }, []);

  useEffect(() => {
    const stepNum = parseInt(stepParam || "1", 10);
    if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 4) {
      setCurrentStep(stepNum);
    }
  }, [stepParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (["street", "city", "state", "postalCode", "country"].includes(name)) {
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

  const registerPlant = async () => {
    setIsLoading(true);
    try {
      const { plant } = await submitPlantRegistration(formData);

      const data: UploadedData = {
        plant_id: plant.plant_id,
        operator_id: plant.operator_id,
      };

      setUploadedData(data);
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!formData.certification) return;
    const data = await registerPlant();
    resetForm();
    setCurrentStep(2);
    router?.push("?step=2");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await registerPlant();
  
    if (formData.certification) {
      setCurrentStep(2);
      router?.push("?step=2");
    } else {
      setCurrentStep(4);
      router?.push("?step=4");
    }
  };
  

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setIsLoading(true);
  
    try {
      const form = new FormData();
      form.append("file", file);
  
      const response = await fetch("/api/certifications/uploadcertification", {
        method: "POST",
        body: form,
      });
  
      if (!response.ok) throw new Error("Upload failed");
  
      const aiData = await response.json();

if (aiData.fallback) {
  console.warn("⚠️ Using fallback example data (AI API was down)");
}

setUploadedData((prevData) => ({
  ...prevData!,
  certificationName: aiData.Certification_name || "",
  owner: "",
  type: aiData.Type || "",
  entity: aiData.Entity || "",
  certificationBody: aiData.Certification_Body || "",
  issueDate: aiData.Issue_Date || "",
  validityDate: aiData.Validity_Date || "",
  certificateNumber: aiData.Certificate_Number || "",
  compliesWith: aiData.Complies_with || "",
}));

  
      setCurrentStep(3);
      router?.push("?step=3");
    } catch (error) {
      console.error("❌ Error during AI file upload:", error);
      // Optional: show toast or UI error
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleBack = () => setCurrentStep(1);


  const resetForm = () => {
    setFormData({
      role: "",
      plantName: "",
      fuelType: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      plantStage: "",
      certification: false,
    });
  };
  

  return {
    formData,
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
    handleNext,
    resetForm,
  };
}
