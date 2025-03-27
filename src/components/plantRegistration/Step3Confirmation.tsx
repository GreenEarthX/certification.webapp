"use client";
import React from "react";
import { useRouter } from "next/navigation";

// Components
import Modal from "@/components/common/Modal";

// Hooks
import useStep3Confirmation from "@/hooks/useStep3Confirmation";

// Models
import { UploadedData } from "@/models/certificationUploadedData";



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
  const router = useRouter();
  const {
    certificationOptions,
    loadingOptions,
    showSuccessModal,
    setShowSuccessModal,
    handleSaveCertificate,
    isLoading,
  } = useStep3Confirmation(uploadedData, setUploadedData);

  const renderInput = (key: string, value: any) => {
    if (key === "certificationName") {
      return (
        <select
          value={value || ""}
          onChange={(e) =>
            setUploadedData((prev) => ({
              ...prev,
              certificationName: e.target.value,
            }))
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="">Select Certification</option>
          {certificationOptions.map((opt) => (
            <option key={opt.certification_scheme_id} value={opt.certification_scheme_name}>
              {opt.certification_scheme_name}
            </option>
          ))}
        </select>
      );
    }

    if (key === "certificationBody" || key === "compliesWith") {
      const values = value?.split(",").map((v: string) => v.trim()) || [];
      if (values.length > 1) {
        return (
          <select
            value={value || ""}
            onChange={(e) =>
              setUploadedData((prev) => ({
                ...prev,
                [key]: e.target.value,
              }))
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select</option>
            {values.map((item: string) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        );
      }
    }

    return (
      <input
        type="text"
        value={value || ""}
        onChange={(e) =>
          setUploadedData((prev) => ({
            ...prev,
            [key]: e.target.value,
          }))
        }
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
      />
    );
  };

  if (loadingOptions) {
    return <div className="text-center py-8">Loading certification options...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-6 text-center">Certification Uploaded</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(uploadedData).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </label>
            {renderInput(key, value)}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <button
          onClick={handleSaveCertificate}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isLoading ? "Saving..." : "Save Certificate"}
        </button>
      </div>

      {showSuccessModal && (
        <Modal
          title="Success"
          onClose={() => setShowSuccessModal(false)}
          content="Certification added successfully!"
          okText="OK"
        />
      )}

      <hr className="border-t border-gray-300 mb-4" />

      <div className="flex mt-6">
        <div className="w-1/2 pr-2">
          <button
            onClick={() => setCurrentStep(2)}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Add Another Certificate
          </button>
        </div>
        <div className="w-1/2 pl-2">
          <div className="mb-2">
          <button
            onClick={() => {
              setUploadedData({
                plant_id: 0,
                operator_id: 0,
                certificationName: "",
                type: "",
                entity: "",
                certificationBody: "",
                issueDate: "",
                validityDate: "",
                certificateNumber: "",
                compliesWith: "",
              });

              setCurrentStep(1);
              router.push("/dashboards/plants/add?step=1");
            }}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Register Another Plant
          </button>
          </div>
          <button
            onClick={() => setCurrentStep(5)}
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
