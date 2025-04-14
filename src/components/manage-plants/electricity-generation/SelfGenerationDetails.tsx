'use client';
import React from 'react';
import FileUpload from './FileUpload';

interface Props {
  data: {
    file: File | null;
  };
  onChange: (updated: Props['data']) => void;
}

const SelfGenerationDetails: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="ml-4 mt-2">
      <label className="flex items-center font-medium gap-2">
        Submit energy metering documents
      </label>
      <FileUpload
        label="Submit"
        onChange={(file) => onChange({ ...data, file })}
      />
    </div>
  );
};

export default SelfGenerationDetails;
