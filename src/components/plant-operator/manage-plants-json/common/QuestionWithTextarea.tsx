import React from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const QuestionWithTextarea: React.FC<Props> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-md w-full px-3 py-2 text-sm"
      rows={3}
    />
  </div>
);

export default QuestionWithTextarea;
