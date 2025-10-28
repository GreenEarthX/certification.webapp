'use client';
import React from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void; // ✅ ADD THIS LINE
}

const QuestionWithPercentageInput: React.FC<Props> = ({ label, value, onChange }) => (
  <div className="flex items-center mb-4">
    <label className="flex items-center gap-2 mr-4 block mb-1 text-sm font-medium whitespace-nowrap">
      {label}
    </label>
    <input
      type="number"
      min={0}
      className="border rounded-md px-3 py-1 w-24"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <span className="ml-2">%</span>
  </div>
);

export default QuestionWithPercentageInput;
