'use client';
import React from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
}

const QuestionWithInput: React.FC<Props> = ({ label, value, onChange, onBlur }) => (
  <div className="mb-4 ml-8">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type="text"
      className="border rounded-md px-3 py-1 w-1/2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  </div>
);


export default QuestionWithInput;
