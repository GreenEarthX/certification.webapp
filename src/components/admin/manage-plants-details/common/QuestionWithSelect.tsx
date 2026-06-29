'use client';
import React from 'react';

interface QuestionProps {
  question: {
    label: string;
    options: string[];
  };
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const QuestionWithSelect: React.FC<QuestionProps> = ({ question, value, onChange, disabled = false }) => {
  const { label, options } = question;

  return (
    <div className="flex items-center mb-4">
      <label className="block mr-4 mb-1 text-sm font-medium">{label}</label>
      <select
        className={`border rounded-md px-3 py-1.5 outline-none text-sm flex-1 shadow-sm
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default QuestionWithSelect;