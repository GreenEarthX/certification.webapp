import React from "react";

// Models
import { UploadedData } from "@/models/certificationUploadedData";

interface Step4SuccessProps {
  uploadedData: UploadedData;
  onGoToDashboard: () => void;
}

const Step5Success: React.FC<Step4SuccessProps> = ({ onGoToDashboard }) => {
  return (
    <div className="text-center p-6">
      <h2 className="text-lg font-semibold tracking-tight mb-4 text-brand-700">Success!</h2>

      <p className="text-gray-700">
        The process has been completed successfully.
      </p>

      <button
        onClick={onGoToDashboard}
        className="mt-6 px-4 py-2 bg-brand-700 text-white rounded hover:bg-brand-800 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default Step5Success;
