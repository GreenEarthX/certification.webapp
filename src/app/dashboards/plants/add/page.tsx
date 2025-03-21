"use client";
import React from "react";
import Image from "next/image"; // Import the Image component from Next.js
import Step1Form from "@/components/plantRegistration/Step1Form";
import Step2Upload from "@/components/plantRegistration/Step2Upload";
import Step3Confirmation from "@/components/plantRegistration/Step3Confirmation";
import usePlantRegistration from "@/hooks/usePlantRegistration";
import { UploadedData } from "@/models/CertificationUploadedData";

const PlantRegistrationForm = () => {
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
    handleSubmit,
    handleFileUpload,
    handleBack,
    setCurrentStep,
    setUploadedData,
  } = usePlantRegistration();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <div className="flex justify-center mb-6">
        {/* Replace <img> with <Image /> */}
        <Image
          src="/logoGEX.png" // Path to the image
          alt="Logo" // Alt text for accessibility
          width={64} // Desired width of the image
          height={64} // Desired height of the image
          className="h-16" // Apply your custom class
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
            isLoading={isLoading}
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
      </div>
    </div>
  );
};

export default PlantRegistrationForm;