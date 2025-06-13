import React from "react";

// Models
import { UploadedData } from "@/models/certificationUploadedData";

interface Step4SuccessProps {
  uploadedData: UploadedData;
  onGoToDashboard: () => void;
}

const Step4Success: React.FC<Step4SuccessProps> = ({ uploadedData, onGoToDashboard }) => {
  return (
    <div className="text-center p-6">
      <h2 className="text-xl font-bold mb-4">Plant Registered Successfully!</h2>
      <p>
        Plant with ID <strong>{uploadedData.plant_id}</strong> added successfully by plant operator <strong>{uploadedData.operator_id}</strong>.
      </p>
      <button
        onClick={onGoToDashboard}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default Step4Success;
