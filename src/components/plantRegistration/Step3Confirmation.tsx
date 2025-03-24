"use client";
import React from "react";
import useCertificationRegistration from "@/hooks/useCertificationRegistration";

interface UploadedData {
  plant_id: number;
  operator_id: number;
  certificationName?: string;
  type?: string;
  entity?: string;
  certificationBody?: string;
  issueDate?: string;
  validityDate?: string;
  certificateNumber?: string;
  compliesWith?: string;
}

interface Step3ConfirmationProps {
  uploadedData: UploadedData;
  setUploadedData: React.Dispatch<React.SetStateAction<UploadedData>>;
  setCurrentStep: (step: number) => void;
}

const Step3Confirmation: React.FC<Step3ConfirmationProps> = ({
  uploadedData,
  setUploadedData,
  setCurrentStep,
}) => {
  const { registerCertification, isLoading, error } = useCertificationRegistration();

  const handleFinish = async () => {
    const result = await registerCertification(uploadedData);
    if (result) {
      setCurrentStep(4);
    } else {
      alert(error || "Error during certification registration");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6 text-center">Certification Uploaded</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(uploadedData).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) =>
                setUploadedData((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex mt-6">
        <div className="w-1/2 pr-2">
          <button
            onClick={() => setCurrentStep(2)}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Add Certificate
          </button>
        </div>
        <div className="w-1/2 pl-2">
          <div className="mb-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Register Another Plant
            </button>
          </div>
          <button
            onClick={handleFinish}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isLoading ? "Submitting..." : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3Confirmation;
