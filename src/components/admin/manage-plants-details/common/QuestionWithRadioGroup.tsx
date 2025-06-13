// QuestionWithRadioGroup.tsx
'use client';

import React from 'react';

interface Props {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

const QuestionWithRadioGroup: React.FC<Props> = ({ label, value, options, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-black-700">{label}</label>
      <div className="flex gap-6">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={label}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="accent-blue-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionWithRadioGroup;