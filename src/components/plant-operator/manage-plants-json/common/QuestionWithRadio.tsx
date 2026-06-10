'use client';
import React from 'react';

interface Props {
  label: string;
  checked: boolean | null;
  onCheck: (val: boolean) => void;
}

const QuestionWithRadio: React.FC<Props> = ({ label, checked, onCheck }) => (
  <div className="flex items-center mb-4">
    <label className="flex items-center gap-2 mr-4 block mb-1 text-sm font-medium accent-blue-600 whitespace-nowrap">{label}</label>
    <div className="flex gap-4">
      <label className="flex items-center gap-1">
        <input type="radio" name={label} checked={checked === true} onChange={() => onCheck(true)} className="accent-blue-600"/>
        Yes
      </label>
      <label className="flex items-center gap-1">
        <input type="radio" name={label} checked={checked === false} onChange={() => onCheck(false)} className="accent-blue-600" />
        No
      </label>
    </div>
  </div>
);

export default QuestionWithRadio;
