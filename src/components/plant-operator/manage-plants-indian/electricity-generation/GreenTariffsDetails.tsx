'use client';
import React from 'react';
import FileUpload from './FileUpload';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface Props {
  data: {
    hasContract: boolean | null;
    file: File | null;
  };
  onChange: (updated: Props['data']) => void;
}

const GreenTariffsDetails: React.FC<Props> = ({ data, onChange }) => {
  const { hasContract, file } = data;

  return (
    <div className="ml-4 mt-2">
      <QuestionWithRadio
        label="Do you process a contract with the supplier?"
        checked={hasContract}
        onCheck={(val) => onChange({ ...data, hasContract: val })}
      />
      {hasContract === true && (
        <FileUpload
          label="Submit"
          onChange={(file) => onChange({ ...data, file })}
          fileName={file?.name} // ✅ here!
        />
      )}
    </div>
  );
};

export default GreenTariffsDetails;
