'use client';
import React from 'react';

interface Props {
  label: string;
  checked: boolean;
  percentage: string;
  onCheck: (value: boolean) => void;
  onPercentageChange: (value: string) => void;
}

const QuestionWithRadioAndInput: React.FC<Props> = ({
  label,
  checked,
  percentage,
  onCheck,
  onPercentageChange
}) => {
  return (
    <>
      <div className="flex items-center mb-2">
        <label className="block text-sm text-blue-900 mr-4 whitespace-nowrap">{label}</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input type="radio" name={label} checked={checked} onChange={() => onCheck(true)} className="accent-blue-600"/>
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name={label} checked={!checked} onChange={() => onCheck(false)} className="accent-blue-600"/>
            No
          </label>
        </div>
      </div>
      {checked && (
        <div className="flex items-center mb-4 ml-4">
          <label className="text-sm text-blue-900 mr-2">Fill</label>
          <input
            type="number"
            className="border rounded-md px-3 py-1 w-24"
            value={percentage}
            onChange={(e) => onPercentageChange(e.target.value)}
          />
          <span className="ml-2">%</span>
        </div>
      )}
    </>
  );
};

export default QuestionWithRadioAndInput;
