import React from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import CountryInput from "./CountryInput";
import { countryCodeToName  } from "@/utils/countryList";
import { countryNameToCode } from "@/utils/countryList";
interface Step1FormProps {
  formData: {
    role: string;
    plantName: string;
    fuelType: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    plantStage: string;
    certification: boolean;
  };
  plantStages: { stage_id: number; stage_name: string }[];
  fuelTypes: { fuel_id: number; fuel_name: string }[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCertificationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleNext: () => void;
  setCurrentStep: (step: number) => void;
}

const Step1Form: React.FC<Step1FormProps> = ({
  formData,
  plantStages,
  fuelTypes,
  handleChange,
  handleCertificationChange,
  handleSubmit,
  handleNext,
}) => {
  const { street, city, state, postalCode, country } = formData.address;

  const isFormComplete =
    formData.plantName.trim() !== "" &&
    formData.fuelType !== "" &&
    street !== "" &&
    city !== "" &&
    state !== "" &&
    postalCode !== "" &&
    country !== "" &&
    formData.plantStage !== "";

  return (
    <form onSubmit={handleSubmit}>
  <h2 className="text-xl font-bold mb-6 text-center">Plant Registration</h2>

  {/* 🔹 Row 1: Plant Name + Fuel Type */}
  <div className="mb-4 flex gap-4">
    <div className="w-1/2">
      <FormInput
        label="Plant Name"
        type="text"
        id="plantName"
        name="plantName"
        value={formData.plantName}
        onChange={handleChange}
        placeholder="Plant Name"
      />
    </div>
    <div className="w-1/2">
      <FormSelect
        label="Fuel Type"
        id="fuelType"
        name="fuelType"
        value={formData.fuelType}
        onChange={handleChange}
        options={fuelTypes.map((fuel) => ({
          value: fuel.fuel_id.toString(),
          label: fuel.fuel_name,
        }))}
        placeholder="Select Fuel Type"
      />
    </div>
  </div>

  {/* 🔹 Row 2: Street Address (full width) */}
  <div className="mb-4">
    <FormInput
      label="Address"
      type="text"
      id="street"
      name="street"
      value={formData.address.street}
      onChange={handleChange}
      placeholder="Street address"
    />
  </div>

  {/* 🔹 Row 3: City + State */}
  <div className="mb-4 flex gap-4">
  <div className="w-1/2">
  <CountryInput
  value={countryNameToCode[formData.address.country] || ""} // set code here
  onChange={(val) =>
    handleChange({
      target: { name: "country", value: countryCodeToName[val] || val },
    } as React.ChangeEvent<HTMLInputElement>)
  }
/>
    </div>
    <div className="w-1/2">
      <FormInput
        label="City"
        type="text"
        id="city"
        name="city"
        value={formData.address.city}
        onChange={handleChange}
        placeholder="City"
      />
    </div>
    
  </div>

  {/* 🔹 Row 4: Postal Code + Country */}
  <div className="mb-4 flex gap-4">
  <div className="w-1/2">
      <FormInput
        label="State"
        type="text"
        id="state"
        name="state"
        value={formData.address.state}
        onChange={handleChange}
        placeholder="State"
      />
    </div>
    <div className="w-1/2">
      <FormInput
        label="Postal Code"
        type="text"
        id="postalCode"
        name="postalCode"
        value={formData.address.postalCode}
        onChange={handleChange}
        placeholder="Postal Code"
      />
    </div>
    
  </div>

  {/* 🔹 Row 5: Plant Stage (can add another field later) */}
  <div className="mb-4">
    <div className="w-mb-4">
      <FormSelect
        label="Plant Stage"
        id="plantStage"
        name="plantStage"
        value={formData.plantStage}
        onChange={handleChange}
        options={plantStages.map((stage) => ({
          value: stage.stage_id.toString(),
          label: stage.stage_name,
        }))}
        placeholder="Select Plant Stage"
      />
    </div>
    <div className="w-1/2" />
  </div>

  {/* 🔹 Row 6: Certification radio */}
  <div className="flex items-center justify-between mb-6">
    <label className="text-sm font-medium text-gray-700">
      Have you already obtained certification?
    </label>
    <div className="flex gap-4">
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="certification"
          value="yes"
          checked={formData.certification === true}
          onChange={handleCertificationChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <span className="ml-2">Yes</span>
      </label>
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="certification"
          value="no"
          checked={formData.certification === false}
          onChange={handleCertificationChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <span className="ml-2">No</span>
      </label>
    </div>
  </div>

  {/* 🔹 Buttons */}
  <div className="flex justify-end gap-4">
    <button
      type="button"
      className={`px-4 py-2 rounded-md focus:outline-none ${
        formData.certification && isFormComplete
          ? "bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
      }`}
      onClick={() => {
        if (formData.certification && isFormComplete) {
          handleNext();
        }
      }}
      disabled={!formData.certification || !isFormComplete}
    >
      Next
    </button>

    <button
      type="submit"
      className={`px-4 py-2 rounded-md focus:outline-none ${
        isFormComplete
          ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-700"
          : "bg-blue-200 text-blue-400 cursor-not-allowed"
      }`}
      disabled={!isFormComplete}
    >
      Finish
    </button>
  </div>
</form>
  );
};

export default Step1Form;
