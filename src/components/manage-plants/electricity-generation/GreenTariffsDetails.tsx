'use client';
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import QuestionWithRadio from '../common/QuestionWithRadio';

const GreenTariffsDetails: React.FC = () => {
  const [hasContract, setHasContract] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="ml-4 mt-2">
      <QuestionWithRadio
        label="Do you process a contract with the supplier?"
        checked={hasContract}
        onCheck={setHasContract}
      />
      {hasContract === true && (
        <FileUpload label="Submit" onChange={setFile} />
      )}
    </div>
  );
};

export default GreenTariffsDetails;
