'use client';
import React, { useState } from 'react';
import FileUpload from './FileUpload';

const ContractDifferenceDetails: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="ml-4 mt-2">
      <label className="flex items-center gap-2">
        Provide CFD contract
      </label>
      <FileUpload label="Submit" onChange={setFile} />
    </div>
  );
};

export default ContractDifferenceDetails;
