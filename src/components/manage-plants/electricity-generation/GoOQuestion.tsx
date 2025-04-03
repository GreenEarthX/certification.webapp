'use client';
import React from 'react';
import FileUpload from './FileUpload';
import QuestionWithRadio from '../general-info/QuestionWithRadio';

interface Props {
  checked: boolean | null;
  onChange: (val: boolean) => void;
  showUpload: boolean;
  onUpload: (file: File | null) => void;
}

const GoOQuestion: React.FC<Props> = ({ checked, onChange, showUpload, onUpload }) => {
  return (
    <div className="my-2"> {/* Removed ml-4 */}
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
