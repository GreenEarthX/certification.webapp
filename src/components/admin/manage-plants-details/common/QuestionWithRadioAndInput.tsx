'use client';
import React from 'react';

interface Props {
  label: string;
  checked: boolean;
  percentage: string;
  onCheck: (value: boolean) => void;
  onPercentageChange: (value: string) => void;
  onPercentageBlur?: () => void; // ✅ Optional for syncing on blur
}

const QuestionWithRadioAndInput: React.FC<Props> = ({
  label,
  checked,
  percentage,
  onCheck,
  onPercentageChange,
  onPercentageBlur
}) => {
  return (
    <>
      <div className="flex items-center mb-2">
        <label className="flex items-center gap-2 mr-4 block mb-1 text-sm font-medium accent-blue-600 whitespace-nowrap">
          {label}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name={label}
              checked={checked}
              onChange={() => onCheck(true)}
              className="accent-blue-600"
            />
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name={label}
              checked={!checked}
              onChange={() => onCheck(false)}
              className="accent-blue-600"
            />
            No
          </label>
        </div>
      </div>

      {checked && (
        <div className="flex items-center mb-4 ml-28">
          <label className="flex items-center gap-2 mr-4 accent-blue-600 whitespace-nowrap">Fill</label>
          <input
            type="number"
            className="border rounded-md px-3 py-1 w-24"
            value={percentage}
            onChange={(e) => onPercentageChange(e.target.value)}
            onBlur={onPercentageBlur} // ✅ Sync on blur
          />
          <span className="ml-2">%</span>
        </div>
      )}
    </>
  );
};

export default QuestionWithRadioAndInput;