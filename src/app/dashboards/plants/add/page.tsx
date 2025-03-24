"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Step1Form from "@/components/plantRegistration/Step1Form";
import Step2Upload from "@/components/plantRegistration/Step2Upload";
import Step3Confirmation from "@/components/plantRegistration/Step3Confirmation";
import usePlantRegistration from "@/hooks/usePlantRegistration";
import { UploadedData } from "@/models/CertificationUploadedData";

const PlantRegistrationForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stepParam = searchParams.get("step");

  const {
    formData,
    addressOptions,
    plantStages,
    fuelTypes,
    currentStep,
    isLoading,
    uploadedData,
    handleChange,
    handleCertificationChange,
    handleFileUpload,
    handleBack,
    setCurrentStep,
    setUploadedData,
  } = usePlantRegistration();

  const formattedFormData = {
    ...formData,
    address: `${formData.address.country}, ${formData.address.region}`,
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stepNum = parseInt(stepParam || "1", 10);
    if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 4) {
      setCurrentStep(stepNum);
    }
  }, [stepParam, setCurrentStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/plants/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedFormData),
      });

      if (!res.ok) {
        throw new Error("Network response failed");
      }

      const { plant } = await res.json();

      const data: UploadedData = {
        plant_id: plant.plant_id,
        operator_id: plant.operator_id,
      };

      setUploadedData(data);

      if (formData.certification) {
        setCurrentStep(2);
        router.push("?step=2");
      } else {
        setCurrentStep(4);
        router.push("?step=4");
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <div className="flex justify-center mb-6">
        <Image
          src="/logoGEX.png"
          alt="Logo"
          width={64}
          height={64}
          className="h-16"
        />
      </div>

      <div className="step-container">
        {currentStep === 1 && (
          <Step1Form
            formData={formData}
            addressOptions={addressOptions}
            plantStages={plantStages}
            fuelTypes={fuelTypes}
            handleChange={handleChange}
            handleCertificationChange={handleCertificationChange}
            handleSubmit={handleSubmit}
            setCurrentStep={setCurrentStep}
          />
        )}

        {currentStep === 2 && (
          <Step2Upload
            handleFileUpload={handleFileUpload}
            isLoading={isLoading || loading}
            handleBack={handleBack}
          />
        )}

        {currentStep === 3 && uploadedData && (
          <Step3Confirmation
            uploadedData={uploadedData}
            setUploadedData={setUploadedData as React.Dispatch<React.SetStateAction<UploadedData>>}
            setCurrentStep={setCurrentStep}
          />
        )}

        {currentStep === 4 && uploadedData && (
          <div className="text-center p-6">
            <h2 className="text-xl font-bold mb-4">Plant Registered Successfully!</h2>
            <p>Plant with ID <strong>{uploadedData.plant_id}</strong> added successfully by plant operator <strong>{uploadedData.operator_id}</strong>.</p>
            <button
              onClick={() => router.push("/dashboards/dashboard")}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantRegistrationForm;
