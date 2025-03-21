import React from "react";

interface UploadedData {
  certificationName: string;
  type: string;
  entity: string;
  certificationBody: string;
  issueDate: string;
  validityDate: string;
  certificateNumber: string;
  compliesWith: string;
}

interface Step3ConfirmationProps {
  uploadedData: UploadedData;
  setUploadedData: React.Dispatch<React.SetStateAction<UploadedData>>;
  setCurrentStep: (step: number) => void;
}

const Step3Confirmation: React.FC<Step3ConfirmationProps> = ({ uploadedData, setUploadedData, setCurrentStep }) => (
  <div>
    <h3 className="text-xl font-bold mb-6 text-center">Certification Uploaded</h3>
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Editable Input Fields */}
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      ))}
    </div>

    <div className="text-center mt-6">
      <button
        onClick={() => setCurrentStep(2)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-4"
      >
        Add Certificate
      </button>
      <button
        onClick={() => setCurrentStep(1)}
        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Register Another Plant
      </button>
    </div>
  </div>
);

export default Step3Confirmation;