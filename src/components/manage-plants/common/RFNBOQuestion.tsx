'use client';
import React from 'react';
import QuestionWithRadio from './QuestionWithRadio';

interface Props {
  value: boolean | null;
  onChange: (val: boolean) => void;
}

const RFNBOQuestion: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="mt-6">
      <QuestionWithRadio
        label="Is your fuel classified as RFNBO?"
        checked={value}
        onCheck={onChange}
      />
    </div>
  );
};

export default RFNBOQuestion;
