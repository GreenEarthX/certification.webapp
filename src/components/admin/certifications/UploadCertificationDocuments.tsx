'use client';
import React, { useCallback } from "react";
import { FaFilePdf, FaFileWord, FaFileImage } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

const UploadCertificationDocuments = ({
  files,
  setFiles
}: {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".pdf")) return <FaFilePdf className="text-red-500" />;
    if (lower.endsWith(".docx")) return <FaFileWord className="text-blue-500" />;
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
      return <FaFileImage className="text-yellow-500" />;
    }
    return null;
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files).filter((file) => {
          const lower = file.name.toLowerCase();
          return (
            lower.endsWith(".pdf") ||
            lower.endsWith(".docx") ||
            lower.endsWith(".png") ||
            lower.endsWith(".jpg") ||
            lower.endsWith(".jpeg")
          );
        });
        setFiles([...files, ...newFiles]);
      }
    },
    [files]
  );

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Upload Certification Documents</h2>
      <div
        className={`border-2 border-dashed p-10 text-center rounded-md transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-blue-300"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <p className="mb-2">Drag and drop certification documents here</p>
        <p className="mb-4">OR</p>
        <label className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer inline-block hover:bg-blue-600 transition-colors">
          Browse files
          <input
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.docx,.png,.jpg,.jpeg"
          />
        </label>
        <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, DOCX, PNG, JPG</p>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm border p-2 rounded bg-gray-50"
            >
              {getFileIcon(file.name)}
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <AiOutlineClose />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UploadCertificationDocuments;
