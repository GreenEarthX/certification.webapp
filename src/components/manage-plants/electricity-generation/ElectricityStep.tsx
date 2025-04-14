'use client';
import React, { useEffect, useState } from 'react';
import PPADetails from './PPADetails';
import DirectGridDetails from './DirectGridDetails';
import FileUpload from './FileUpload';
import SelfGenerationDetails from './SelfGenerationDetails';
import GreenTariffsDetails from './GreenTariffsDetails';
import SpotMarketDetails from './SpotMarketDetails';
import ContractDifferenceDetails from './ContractDifferenceDetails';

interface Props {
  data: {
    selectedSources: string[];
    ppaFile: File | null;
    energyMix: { type: string; percent: string }[];
    ppaDetails: any;
    directGridDetails: any;
    selfGenerationDetails: any;
    greenTariffsDetails: any;
    spotMarketDetails: any;
    contractDiffDetails: any;
  };
  onChange: (key: keyof Props['data'], value: any) => void;
}

const ElectricityStep: React.FC<Props> = ({ data, onChange }) => {
  const { selectedSources = [], ppaFile = null } = data;
  const [localEnergyMix, setLocalEnergyMix] = useState(data.energyMix || []);

  useEffect(() => {
    setLocalEnergyMix(data.energyMix || []);
  }, [data.energyMix]);

  const sources = [
    'PPA',
    'Direct grid purchase',
    'Self generation (on site renewables)',
    'Green Tariffs',
    'Spot market purchase',
    'Contract for difference',
  ];

  const energyOptions = ['Solar', 'Wind', 'Hydropower', 'Geothermal', 'Other'];

  const toggleSource = (source: string) => {
    const updated = selectedSources.includes(source)
      ? selectedSources.filter((s) => s !== source)
      : [...selectedSources, source];
    onChange('selectedSources', updated);
  };

  const totalPercentage = localEnergyMix.reduce((sum, entry) => sum + Number(entry.percent || 0), 0);

  const updateEntry = (index: number, field: 'type' | 'percent', value: string) => {
    const updated = [...localEnergyMix];

    if (field === 'type') {
      const cleanVal = value.startsWith('Other:') ? 'Other:' : value;
      const isDuplicate = updated.some((e, i) => e.type === cleanVal && i !== index);
      if (isDuplicate && cleanVal !== 'Other:') return;
      updated[index].type = value;
    }

    if (field === 'percent') {
      const parsed = Math.max(0, Number(value));
      const remaining =
        100 -
        updated.reduce((sum, e, i) => sum + (i === index ? 0 : Number(e.percent || 0)), 0);
      updated[index].percent = Math.min(parsed, remaining).toString();
    }

    setLocalEnergyMix(updated);
  };

  const saveOnBlur = () => {
    onChange('energyMix', localEnergyMix);
  };

  const addEnergySource = () => {
    if (totalPercentage < 100) {
      const updated = [...localEnergyMix, { type: '', percent: '' }];
      setLocalEnergyMix(updated);
      onChange('energyMix', updated); // sync with parent to keep consistency
    }
  };

  const removeEnergySource = (index: number) => {
    const updated = [...localEnergyMix];
    updated.splice(index, 1);
    setLocalEnergyMix(updated);
    onChange('energyMix', updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-medium mb-2 text-black-900">
          How do you provide electricity for your plant?
        </p>
        <div className="ml-8">
          {sources.map((source) => (
            <div key={source} className="mb-3">
              <label className="flex items-center font-medium gap-2">
                <input
                  type="checkbox"
                  name="electricity_source"
                  checked={selectedSources.includes(source)}
                  onChange={() => toggleSource(source)}
                  className="accent-blue-600"
                />
                {source}
              </label>

              <div className="ml-6 mt-2">
                {selectedSources.includes(source) && (
                  <>
                    {source === 'PPA' && (
                      <>
                        <FileUpload
                          label="Submit"
                          onChange={(file) => onChange('ppaFile', file)}
                        />
                        <PPADetails
                          data={data.ppaDetails}
                          onChange={(val) => onChange('ppaDetails', val)}
                        />
                      </>
                    )}
                    {source === 'Direct grid purchase' && (
                      <DirectGridDetails
                        data={data.directGridDetails}
                        onChange={(val) => onChange('directGridDetails', val)}
                      />
                    )}
                    {source === 'Self generation (on site renewables)' && (
                      <SelfGenerationDetails
                        data={data.selfGenerationDetails}
                        onChange={(val) => onChange('selfGenerationDetails', val)}
                      />
                    )}
                    {source === 'Green Tariffs' && (
                      <GreenTariffsDetails
                        data={data.greenTariffsDetails}
                        onChange={(val) => onChange('greenTariffsDetails', val)}
                      />
                    )}
                    {source === 'Spot market purchase' && (
                      <SpotMarketDetails
                        data={data.spotMarketDetails}
                        onChange={(val) => onChange('spotMarketDetails', val)}
                      />
                    )}
                    {source === 'Contract for difference' && (
                      <ContractDifferenceDetails
                        data={data.contractDiffDetails}
                        onChange={(val) => onChange('contractDiffDetails', val)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Energy Mix Section */}
      <p className="font-medium mb-2 text-black-900">Input your energy mix:</p>

      {localEnergyMix.map((entry, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-2">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium whitespace-nowrap w-36">Type of energy:</label>
            {entry.type.startsWith('Other:') ? (
              <input
                type="text"
                value={entry.type.replace('Other:', '')}
                onChange={(e) => updateEntry(index, 'type', 'Other:' + e.target.value)}
                onBlur={saveOnBlur}
                placeholder="Enter energy type"
                className="border px-3 py-1.5 rounded-md text-sm flex-1 bg-white"
              />
            ) : (
              <select
                value={entry.type}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'Other') {
                    updateEntry(index, 'type', 'Other:');
                  } else {
                    updateEntry(index, 'type', value);
                  }
                }}
                onBlur={saveOnBlur}
                className="border px-3 py-1.5 rounded-md text-sm flex-1 bg-white"
              >
                <option value="">Select</option>
                {energyOptions.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    disabled={localEnergyMix.some((e, i) => e.type === opt && i !== index)}
                  >
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="%"
              value={entry.percent}
              onChange={(e) => updateEntry(index, 'percent', e.target.value)}
              onBlur={saveOnBlur}
              className="border px-3 py-1.5 rounded-md text-sm w-24"
              max={100 - totalPercentage + Number(entry.percent || 0)}
            />
            <span className="text-sm font-medium">%</span>
            {localEnergyMix.length > 1 && (
              <button
                type="button"
                onClick={() => removeEnergySource(index)}
                className="text-red-500 text-sm ml-2"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}

      {totalPercentage < 100 && (
        <button
          type="button"
          onClick={addEnergySource}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          + Add Energy Source
        </button>
      )}

      <p className={`text-sm mt-2 ${totalPercentage > 100 ? 'text-red-600' : 'text-gray-600'}`}>
        Total: {totalPercentage}% {totalPercentage > 100 && '(exceeds 100%)'}
      </p>
    </div>
  );
};

export default ElectricityStep;
