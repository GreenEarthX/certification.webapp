"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/common/Modal";
import useStep3Confirmation from "@/hooks/useStep3Confirmation";
import { UploadedData, fieldLabels } from "@/models/certificationUploadedData";

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
  const [certificateSaved, setCertificateSaved] = useState(false);

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

    if (["certificationBody", "compliesWith"].includes(key)) {
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

  const handleSave = async () => {
    await handleSaveCertificate();
    setCertificateSaved(true);
    setShowSuccessModal(true);
  };

  if (loadingOptions) {
    return <div className="text-center py-8">Loading certification options...</div>;
  }

  return (
    <div>
      {!certificateSaved ? (
        <>
          <h3 className="text-xl font-bold mb-6 text-center">Certification Uploaded</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification Name
            </label>
            {renderInput("certificationName", uploadedData.certificationName)}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(uploadedData)
              .filter(([key]) => !["certificationName", "plant_id", "operator_id"].includes(key))
              .map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fieldLabels[key] || key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  {renderInput(key, value)}
                </div>
              ))}
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          >
            {isLoading ? "Saving..." : "Save Certificate"}
          </button>
        </>
      ) : (
        <>
          {showSuccessModal && (
            <Modal
              title="Success"
              onClose={() => setShowSuccessModal(false)}
              content="Certification added successfully!"
              okText="OK"
            />
          )}

          {!showSuccessModal && (
            <div className="mt-10 text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">What do you want to do next?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => {
                    setCurrentStep(2);
                    setUploadedData({
                      plant_id: uploadedData.plant_id,
                      operator_id: uploadedData.operator_id,
                      certificationName: "",
                      type: "",
                      entity: "",
                      certificationBody: "",
                      issueDate: "",
                      validityDate: "",
                      certificateNumber: "",
                      compliesWith: "",
                    });
                    setCertificateSaved(false);
                  }}
                  className="w-full px-6 py-3 bg-blue-600 text-white border border-blue-700 rounded-xl hover:bg-blue-700 transition"
                >
                  Add Another Certificate
                </button>

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
                  className="w-full px-6 py-3 bg-blue-600 text-white border border-blue-700 rounded-xl hover:bg-blue-700 transition"
                >
                  Register Another Plant
                </button>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="w-full px-6 py-3 bg-blue-600 text-white border border-blue-700 rounded-xl hover:bg-blue-700 transition"
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Step3Confirmation;
