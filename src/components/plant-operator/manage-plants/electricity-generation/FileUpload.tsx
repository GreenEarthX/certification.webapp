'use client';
import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  fileName?: string; 
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onChange, fileName }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="my-4">
      <span className="block text-sm text-blue-900 mb-1">{label}</span>
      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex items-center justify-between gap-4 px-4 py-2 border-2 border-dashed border-blue-300 rounded-md cursor-pointer hover:border-blue-500 transition"
        onClick={() => inputRef.current?.click()}
      >
        <span className="text-gray-600 text-sm">Drag and drop or click to upload</span>
        <div className="flex items-center gap-1 text-blue-700">
          <UploadCloud size={20} />
          <span className="text-sm font-medium">PDF</span>
        </div>
        <input
          type="file"
          accept=".pdf"
          ref={inputRef}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>

      {fileName && (
        <p className="text-sm mt-1 text-green-700 font-medium">
          ✅ Uploaded: <span className="italic">{fileName}</span>
        </p>
      )}
    </div>
  );
};

export default FileUpload;
