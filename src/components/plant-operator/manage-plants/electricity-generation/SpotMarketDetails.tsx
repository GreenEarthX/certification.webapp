'use client';
import React from 'react';
import FileUpload from './FileUpload';

interface Props {
  data: {
    purchaseFile: File | null;
    goOFile: File | null;
  };
  onChange: (updated: Props['data']) => void;
}

const SpotMarketDetails: React.FC<Props> = ({ data, onChange }) => {
  const { purchaseFile, goOFile } = data;

  return (
    <div className="ml-4 mt-2 flex flex-col gap-4">
      {/* Purchase Records Upload */}
      <div>
        <label className="flex items-center font-medium gap-2">
          Provide purchase records
        </label>
        <FileUpload
          label="Submit"
          onChange={(file) => onChange({ ...data, purchaseFile: file })}
          fileName={purchaseFile?.name} 
        />
      </div>

      {/* GoO Upload */}
      <div>
        <label className="flex items-center font-medium gap-2">
          Provide GoO proving renewable match
        </label>
        <FileUpload
          label="Submit"
          onChange={(file) => onChange({ ...data, goOFile: file })}
          fileName={goOFile?.name} 
        />
      </div>
    </div>
  );
};

export default SpotMarketDetails;
