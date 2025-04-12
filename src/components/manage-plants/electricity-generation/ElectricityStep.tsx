'use client';
import React, { useState } from 'react';
import FileUpload from './FileUpload';
import PPADetails from './PPADetails';
import DirectGridDetails from './DirectGridDetails';
import SelfGenerationDetails from './SelfGenerationDetails';
import GreenTariffsDetails from './GreenTariffsDetails';
import SpotMarketDetails from './SpotMarketDetails';
import ContractDifferenceDetails from './ContractDifferenceDetails';

const ElectricityStep: React.FC = () => {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [ppaFile, setPpaFile] = useState<File | null>(null);

  const sources = [
    'PPA',
    'Direct grid purchase',
    'Self generation (on site renewables)',
    'Green Tariffs',
    'Spot market purchase',
    'Contract for difference',
  ];

  const handleCheckboxChange = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  return (
    <div>
      <p className="font-medium mb-2 text-black-900">
        How do you provide electricity for plant?
      </p>
      <div className="ml-8">
        {sources.map((source) => (
          <div key={source} className="mb-2">
            <label className="flex font-medium items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSources.includes(source)}
                onChange={() => handleCheckboxChange(source)}
                className="accent-blue-600"
              />
              {source}
            </label>

            <div className="ml-4">
              {selectedSources.includes('PPA') && source === 'PPA' && (
                <div className="ml-6 mt-2 space-y-2">
                  <FileUpload label="Submit" onChange={setPpaFile} />
                  <PPADetails />
                </div>
              )}

              {selectedSources.includes('Direct grid purchase') && source === 'Direct grid purchase' && (
                <div className="ml-6 mt-2">
                  <DirectGridDetails />
                </div>
              )}

              {selectedSources.includes('Self generation (on site renewables)') && source === 'Self generation (on site renewables)' && (
                <div className="ml-6 mt-2">
                  <SelfGenerationDetails />
                </div>
              )}

              {selectedSources.includes('Green Tariffs') && source === 'Green Tariffs' && (
                <div className="ml-6 mt-2">
                  <GreenTariffsDetails />
                </div>
              )}

              {selectedSources.includes('Spot market purchase') && source === 'Spot market purchase' && (
                <div className="ml-6 mt-2">
                  <SpotMarketDetails />
                </div>
              )}

              {selectedSources.includes('Contract for difference') && source === 'Contract for difference' && (
                <div className="ml-6 mt-2">
                  <ContractDifferenceDetails />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectricityStep;
