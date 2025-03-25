import React from "react";

interface Step2UploadProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  handleBack: () => void;
}

const Step2Upload: React.FC<Step2UploadProps> = ({ handleFileUpload, isLoading }) => (
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
    {isLoading }
  </div>
);

export default Step2Upload;