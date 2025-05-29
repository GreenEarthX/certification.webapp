import React from 'react';

export interface Props {
  data: {
    text: string;
  };
  onChange: (updated: { text: string }) => void;
}

const PowerExchangeDetails: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="ml-4 mt-2">
      <label className="flex items-center block mb-1 text-sm font-medium gap-2">
        Which platform are you using ?
      </label>
      <input
        type="text"
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder=""
        className="border px-3 py-1.5 rounded-md text-sm w-full bg-white"
      />
      <label className="flex items-center block mb-1 text-sm font-medium gap-2">
      What are your plant transmission and distribution losses
      </label>
      <input
        type="text"
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder=""
        className="border px-3 py-1.5 rounded-md text-sm w-full bg-white"
      />
    </div>
  );
};

export default PowerExchangeDetails;
