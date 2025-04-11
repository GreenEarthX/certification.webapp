'use client';
import React, { useState } from 'react';
import FileUpload from './FileUpload';

const SpotMarketDetails: React.FC = () => {
  const [purchaseFile, setPurchaseFile] = useState<File | null>(null);
  const [goOFile, setGoOFile] = useState<File | null>(null);

  return (
    <div className="ml-4 mt-2 flex flex-col gap-4">
      {/* Purchase Records Upload */}
      <div>
        <label className="flex items-center gap-2">
          Provide purchase records
        </label>
        <FileUpload label="Submit" onChange={setPurchaseFile} />
      </div>

      {/* GoO Upload */}
      <div>
        <label className="flex items-center gap-2">
          Provide GoO proving renewable match
        </label>
        <FileUpload label="Submit" onChange={setGoOFile} />
      </div>
    </div>
  );
};

export default SpotMarketDetails;
