import React from "react";

interface Step2UploadProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  handleBack: () => void;
}

const Step2Upload: React.FC<Step2UploadProps> = ({ handleFileUpload, isLoading, handleBack }) => (
  <div>
    <h2 className="text-xl font-bold mb-6 text-center">Upload Certification</h2>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center">
      <p className="text-gray-600 mb-4">Drag and drop your PDF here or</p>
      <label htmlFor="file-upload" className="cursor-pointer bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700">
        Click to upload
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
    {isLoading ? (
      <div className="text-center mt-4">Loading...</div>
    ) : (
      <div className="text-center mt-4">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Return
        </button>
      </div>
    )}
  </div>
);

export default Step2Upload;