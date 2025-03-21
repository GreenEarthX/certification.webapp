import React from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";

interface Step1FormProps {
  formData: {
    role: string;
    plantName: string;
    fuelType: string;
    address: string;
    plantStage: string;
    certification: boolean;
  };
  addressOptions: { country: string; region: string }[];
  plantStages: { stage_id: number; stage_name: string }[];
  fuelTypes: { fuel_id: number; fuel_name: string }[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCertificationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setCurrentStep: (step: number) => void;
}

const Step1Form: React.FC<Step1FormProps> = ({
  formData,
  addressOptions,
  plantStages,
  fuelTypes,
  handleChange,
  handleCertificationChange,
  handleSubmit,
  setCurrentStep,
}) => (
  <form onSubmit={handleSubmit}>
    <h2 className="text-xl font-bold mb-6 text-center">Plant Registration</h2>

    <div className="flex gap-4 mb-4">
      <FormInput
        label="Role"
        type="text"
        id="role"
        name="role"
        value={formData.role}
        onChange={handleChange}
        placeholder="Role"
      />
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

    <div className="flex gap-4 mb-4">
      <FormSelect
        label="Fuel Type"
        id="fuelType"
        name="fuelType"
        value={formData.fuelType}
        onChange={handleChange}
        options={fuelTypes.map((fuel) => ({ value: fuel.fuel_id.toString(), label: fuel.fuel_name }))}
        placeholder="Select Fuel Type"
      />
      <FormSelect
        label="Country/Region"
        id="address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        options={addressOptions.map((address) => ({
          value: `${address.country}, ${address.region}`,
          label: `${address.country} (${address.region})`,
        }))}
        placeholder="Select Country/Region"
      />
    </div>

    <div className="mb-4">
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
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
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
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="ml-2">No</span>
        </label>
      </div>
    </div>

    <div className="flex justify-end gap-4">
      <button
        type="button"
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        onClick={() => setCurrentStep(2)}
      >
        Next
      </button>
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Finish
      </button>
    </div>
  </form>
);

export default Step1Form;