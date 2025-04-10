'use client';
import React from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const QuestionWithInput: React.FC<Props> = ({ label, value, onChange }) => (
  <div className="flex items-center mb-4">
    <label className="flex items-center gap-2 mr-4 accent-blue-600 whitespace-nowrap">{label}</label>
    <input
      type="text"
      className="border rounded-md px-3 py-1.5 outline-none bg-white shadow-sm text-sm flex-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default QuestionWithInput;
