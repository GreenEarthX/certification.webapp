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
  const [energyMix, setEnergyMix] = useState([{ type: '', percent: '' }]);

  const sources = [
    'PPA',
    'Direct grid purchase',
    'Self generation (on site renewables)',
    'Green Tariffs',
    'Spot market purchase',
    'Contract for difference',
  ];

  const energyOptions = ['Solar', 'Wind', 'Hydropower', 'Geothermal', 'Other'];

  // Calculate total %
  const totalPercentage = energyMix.reduce((sum, entry) => sum + Number(entry.percent || 0), 0);

  const updateEntry = (index: number, field: 'type' | 'percent', value: string) => {
    const updated = [...energyMix];
  
    if (field === 'type') {
      const cleanVal = value.startsWith('Other:') ? 'Other:' : value;
      const isDuplicate = updated.some((e, i) => e.type === cleanVal && i !== index);
      if (isDuplicate && cleanVal !== 'Other:') return;
  
      updated[index].type = value;
    }
  
    if (field === 'percent') {
      const parsed = Math.max(0, Number(value)); // 🔥 Prevent negative numbers
      const remaining =
        100 -
        updated.reduce((sum, e, i) => sum + (i === index ? 0 : Number(e.percent || 0)), 0);
      updated[index].percent = Math.min(parsed, remaining).toString(); // 🔥 Cap at remaining
    }
  
    setEnergyMix(updated);
  };
  
  

  // Add new source
  const addEnergySource = () => {
    if (totalPercentage < 100) {
      setEnergyMix([...energyMix, { type: '', percent: '' }]);
    }
  };

  // Remove a source
  const removeEnergySource = (index: number) => {
    const updated = [...energyMix];
    updated.splice(index, 1);
    setEnergyMix(updated);
  };

  return (
    <div className="space-y-6">
      {/* Electricity Source Selection */}
      <div>
        <p className="font-medium mb-2 text-black-900">
          How do you provide electricity for plant?
        </p>
        <div className="ml-8">
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

              <div className="ml-4">
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
            </div>
          ))}
        </div>
      </div>

      {/* Energy Mix Section */}
      <p className="font-medium mb-2 text-black-900">Input your energy mix:</p>

      {energyMix.map((entry, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-2">
          {/* Type of energy */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium whitespace-nowrap w-36">Type of energy:</label>
            {entry.type.startsWith('Other:') ? (
              <input
                type="text"
                value={entry.type.replace('Other:', '')}
                onChange={(e) => updateEntry(index, 'type', 'Other:' + e.target.value)}
                placeholder="Enter energy type"
                className="border px-3 py-1.5 rounded-md text-sm flex-1 bg-white"
              />
            ) : (
              <select
                value={entry.type}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'Other') {
                    updateEntry(index, 'type', 'Other:'); // Trigger custom input
                  } else {
                    updateEntry(index, 'type', value);
                  }
                }}
                className="border px-3 py-1.5 rounded-md text-sm flex-1 bg-white"
              >
                <option value="">Select</option>
                {energyOptions.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    disabled={
                      energyMix.some((e, i) => e.type === opt && i !== index)
                    }
                  >
                    {opt}
                  </option>
                ))}

              </select>
            )}
          </div>

          {/* Percentage */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="%"
              value={entry.percent}
              onChange={(e) => updateEntry(index, 'percent', e.target.value)}
              className="border px-3 py-1.5 rounded-md text-sm w-24"
              max={100 - totalPercentage + Number(entry.percent || 0)}
            />
            <span className="text-sm font-medium">%</span>
            {energyMix.length > 1 && (
              <button
                onClick={() => removeEnergySource(index)}
                className="text-red-500 text-sm ml-2"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add Source */}
      {totalPercentage < 100 && (
        <button
          onClick={addEnergySource}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          + Add Energy Source
        </button>
      )}

      {/* Total % display */}
      <p className={`text-sm mt-2 ${totalPercentage > 100 ? 'text-red-600' : 'text-gray-600'}`}>
        Total: {totalPercentage}% {totalPercentage > 100 && '(exceeds 100%)'}
      </p>
    </div>
  );
};

export default ElectricityStep;
