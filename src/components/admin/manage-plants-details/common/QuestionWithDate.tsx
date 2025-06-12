'use client';
import React from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const QuestionWithDate: React.FC<Props> = ({ label, value, onChange }) => (
  <div className="mb-4">
    <label className="block mb-1 text-sm font-medium">{label}</label>
    <input
      type="date"
      className="w-full border rounded-md px-3 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default QuestionWithDate;