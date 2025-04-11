'use client';
import React, { useState } from 'react';
import GoOQuestion from './GoOQuestion';
import FileUpload from './FileUpload';
import QuestionWithRadio from '../common/QuestionWithRadio';

const DirectGridDetails: React.FC = () => {
  const [hasGoO, setHasGoO] = useState<boolean | null>(null);
  const [goOFile, setGoOFile] = useState<File | null>(null);

  const [hasInvoice, setHasInvoice] = useState<boolean | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  return (
    <div className="ml-4 flex flex-col gap-4 mt-2">
      {/* GoO Section */}
      <GoOQuestion
        checked={hasGoO}
        onChange={setHasGoO}
        showUpload={true}
        onUpload={setGoOFile}
      />

      {/* Utility Invoice Section */}
      <div>
        <QuestionWithRadio
          label="Can you share your utility invoices?"
          checked={hasInvoice}
          onCheck={setHasInvoice}
        />
        {hasInvoice === true && (
          <FileUpload label="Submit" onChange={setInvoiceFile} />
        )}
      </div>
    </div>
  );
};

export default DirectGridDetails;
