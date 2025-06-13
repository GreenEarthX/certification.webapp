import React from 'react';

export interface Props {
  data: {
    text: string;
  };
  onChange: (updated: { text: string }) => void;
}

const ContractDifferenceDetails: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="ml-4 mt-2">
      <label className="flex items-center block mb-1 text-sm font-medium gap-2">
        Provide Contracts for difference
      </label>
      <input
        type="text"
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Enter contract details"
        className="border px-3 py-1.5 rounded-md text-sm w-full bg-white"
      />
    </div>
  );
};

export default ContractDifferenceDetails;
