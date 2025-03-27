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
      <h2 className="text-xl font-bold mb-4 text-green-700">Success!</h2>

      <p className="text-gray-700">
        The process has been completed successfully.
      </p>

      <button
        onClick={onGoToDashboard}
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default Step5Success;
