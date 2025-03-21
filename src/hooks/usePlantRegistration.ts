import { useState, useEffect } from "react";
import { UploadedData } from "@/models/CertificationUploadedData";
import { fetchData } from "@/services/plantRegistration/fetchService"; // Import the fetch service

interface FormData {
  role: string;
  plantName: string;
  fuelType: string;
  address: string;
  plantStage: string;
  certification: boolean;
}

interface AddressOption {
  country: string;
  region: string;
}

interface PlantStage {
  stage_id: number;
  stage_name: string;
}

interface FuelType {
  fuel_id: number;
  fuel_name: string;
}

const usePlantRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    role: "",
    plantName: "",
    fuelType: "",
    address: "",
    plantStage: "",
    certification: false,
  });

  const [addressOptions, setAddressOptions] = useState<AddressOption[]>([]);
  const [plantStages, setPlantStages] = useState<PlantStage[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await fetchData<{ address: AddressOption[]; stage: PlantStage[]; fuel: FuelType[] }>("/api/plants/registration");

        setAddressOptions(data.address);
        setPlantStages(data.stage);
        setFuelTypes(data.fuel);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, certification: e.target.value === "yes" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    setCurrentStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setIsLoading(true);
      setTimeout(() => {
        setUploadedData({
          certificationName: "Certify+ Schema",
          type: "Type A",
          entity: "Certify+",
          certificationBody: "Certify",
          issueDate: "25/04/2026",
          validityDate: "25/04/2030",
          certificateNumber: "285933006",
          compliesWith: "REDD2",
        });
        setIsLoading(false);
        setCurrentStep(3);
      }, 2000);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

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
};

export default usePlantRegistration;
