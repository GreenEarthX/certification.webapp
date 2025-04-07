import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Use this for App Router

// Define the shape of the data expected from the API
interface CertificationData {
  Certification_name: string;
  Type: string;
  Entity: string;
  Certification_Body: string;
  Issue_Date: string;
  Validity_Date: string;
  Certificate_Number: string;
  Complies_with: string;
}

// Define the mapped data shape
interface MappedCertificationData {
  certificationName: string;
  type: string;
  entity: string;
  certificationBody: string;
  issueDate: string;
  validityDate: string;
  certificateNumber: string;
  compliesWith: string;
}

const Step2Upload: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // For navigation
  const [uploadedData, setUploadedData] = useState<MappedCertificationData | null>(null); // Optional: Store data locally

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsLoading(true);

    try {
      const form = new FormData();
      form.append("file", selectedFile);

      const response = await fetch("/api/certifications/uploadcertification", {
        method: "POST",
        body: form,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data: CertificationData = await response.json();

      const mappedData: MappedCertificationData = {
        certificationName: data.Certification_name,
        type: data.Type,
        entity: data.Entity,
        certificationBody: data.Certification_Body,
        issueDate: data.Issue_Date,
        validityDate: data.Validity_Date,
        certificateNumber: data.Certificate_Number,
        compliesWith: data.Complies_with,
      };

      // Store the data locally (optional)
      setUploadedData(mappedData);

      // Replace handleNext: Navigate to the next step or page
      router.push("/Step3Confirmation"); // Replace with your actual next page route

      // Replace handleBack: Navigate back (optional, comment out if not needed)
      // router.push("/previous-step"); // Replace with your actual previous page route
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-center">Upload Certification</h2>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center">
        <p className="text-gray-600 mb-4">Drag and drop your PDF here or</p>
        <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
          Click to upload
        </label>
        <input id="file-upload" type="file" onChange={handleFileUpload} className="hidden" />
      </div>
      {isLoading && <p>Loading...</p>}
      {uploadedData && (
        <div>
          <h3>Uploaded Data:</h3>
          <pre>{JSON.stringify(uploadedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Step2Upload;