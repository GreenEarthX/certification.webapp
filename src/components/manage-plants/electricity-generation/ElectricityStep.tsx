'use client';
import React, { useState } from 'react';
import PPADetails from './PPADetails';
import DirectGridDetails from './DirectGridDetails';
import FileUpload from './FileUpload';
import SelfGenerationDetails from './SelfGenerationDetails';
import GreenTariffsDetails from './GreenTariffsDetails';
import SpotMarketDetails from './SpotMarketDetails';
import ContractDifferenceDetails from './ContractDifferenceDetails';

const ElectricityStep: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [ppaFile, setPpaFile] = useState<File | null>(null);

  const sources = [
    'PPA',
    'Direct grid purchase',
    'Self generation (on site renewables)',
    'Green Tariffs',
    'Spot market purchase',
    'Contract for difference',
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-medium mb-2 text-black-900">
          How do you provide electricity for plant?
        </p>
        {sources.map((source) => (
          <div key={source} className="mb-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="electricity_source"
                checked={selectedSource === source}
                onChange={() => setSelectedSource(source)}
                className="accent-blue-600"
              />
              {source}
            </label>

            {selectedSource === 'PPA' && source === 'PPA' && (
              <div className="ml-6 mt-2 space-y-2">
                <FileUpload label="Submit" onChange={setPpaFile} />
                <PPADetails />
              </div>
            )}

            {selectedSource === 'Direct grid purchase' && source === 'Direct grid purchase' && (
              <div className="ml-6 mt-2">
                <DirectGridDetails />
              </div>
            )}

            {selectedSource === 'Self generation (on site renewables)' && source === 'Self generation (on site renewables)' && (
              <div className="ml-6 mt-2">
                <SelfGenerationDetails />
              </div>
            )}

            {selectedSource === 'Green Tariffs' && source === 'Green Tariffs' && (
              <div className="ml-6 mt-2">
                <GreenTariffsDetails />
              </div>
            )}

            {selectedSource === 'Spot market purchase' && source === 'Spot market purchase' && (
              <div className="ml-6 mt-2">
                <SpotMarketDetails />
              </div>
            )}

            {selectedSource === 'Contract for difference' && source === 'Contract for difference' && (
              <div className="ml-6 mt-2">
                <ContractDifferenceDetails />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectricityStep;
