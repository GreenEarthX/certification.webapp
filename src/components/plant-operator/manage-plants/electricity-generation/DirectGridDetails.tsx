'use client';
import React from 'react';
import FileUpload from './FileUpload';

interface Props {
  data: {
    hasGoO: boolean | null;
    goOFile: File | null;
    hasInvoice: boolean | null;
    invoiceFile: File | null;
  };
  onChange: (updated: Props['data']) => void;
}

const DirectGridDetails: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="ml-4 flex flex-col gap-4 mt-2">
      {/* GoO */}
      <div className="flex items-center gap-6 mb-1">
        <label className="font-medium whitespace-nowrap">Do you have GoO?</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="directGridGoO"
              checked={data.hasGoO === true}
              onChange={() => onChange({ ...data, hasGoO: true })}
              className="accent-blue-600"
            />
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="directGridGoO"
              checked={data.hasGoO === false}
              onChange={() => onChange({ ...data, hasGoO: false })}
              className="accent-blue-600"
            />
            No
          </label>
        </div>
      </div>

      {data.hasGoO === true && (
        <FileUpload
          label="Submit"
          onChange={(file) => onChange({ ...data, goOFile: file })}
          fileName={data.goOFile?.name} 
        />
      )}

      {/* Invoice */}
      <div className="flex items-center gap-6 mt-4">
        <label className="font-medium whitespace-nowrap">Can you share your utility invoices?</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="utilityInvoice"
              checked={data.hasInvoice === true}
              onChange={() => onChange({ ...data, hasInvoice: true })}
              className="accent-blue-600"
            />
            Yes
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              name="utilityInvoice"
              checked={data.hasInvoice === false}
              onChange={() => onChange({ ...data, hasInvoice: false })}
              className="accent-blue-600"
            />
            No
          </label>
        </div>
      </div>

      {data.hasInvoice === true && (
        <FileUpload
          label="Submit"
          onChange={(file) => onChange({ ...data, invoiceFile: file })}
          fileName={data.invoiceFile?.name} 
        />
      )}
    </div>
  );
};

export default DirectGridDetails;
