'use client';
import React from 'react';
import FileUpload from './FileUpload';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface Props {
  checked: boolean | null;
  onChange: (val: boolean) => void;
  showUpload: boolean;
  file: File | null;
  onUpload: (file: File | null) => void;
}

const GoOQuestion: React.FC<Props> = ({
  checked,
  onChange,
  showUpload,
  file,
  onUpload
}) => {
  return (
    <div className="my-2">
      <QuestionWithRadio
        label="Do you have GoO?"
        checked={checked}
        onCheck={onChange}
      />
      {checked === true && showUpload && (
        <FileUpload label="Submit" onChange={onUpload} />
      )}
    </div>
  );
};

export default GoOQuestion;
