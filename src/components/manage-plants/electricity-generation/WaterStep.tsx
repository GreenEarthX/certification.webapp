'use client';
import React, { useRef } from 'react';
import QuestionWithRadio from '../common/QuestionWithRadio';
import SelectWithCheckboxTags from '../common/SelectWithTags';

interface WaterData {
  waterConsumption: string;
  waterSources: string[];
  trackWaterUsage: boolean | null;
  monitoringNotes?: string;
}

interface Props {
  data: WaterData;
  onChange: (updated: WaterData) => void;
}

const WaterStep: React.FC<Props> = ({ data, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [customValue, setCustomValue] = React.useState('');
  const [showOtherInput, setShowOtherInput] = React.useState(false);

  const sourceOptions = ['Surface water', 'Groundwater', 'Municipal supply', 'Seawater', 'Other'];

  const handleWaterSourcesChange = (selected: string[]) => {
    if (selected.includes('Other')) {
      const filtered = selected.filter((item) => item !== 'Other');
      onChange({ ...data, waterSources: filtered });
      setShowOtherInput(true);
    } else {
      onChange({ ...data, waterSources: selected });
      setShowOtherInput(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Water Consumption */}
      <div className="flex items-center mb-4">
        <label className="flex items-center gap-2 mr-4 font-medium accent-blue-600 whitespace-nowrap">
          What is your plant’s total water consumption per unit of production?
        </label>
        <div className="relative w-48">
          <input
            type="number"
            value={data.waterConsumption}
            onChange={(e) => onChange({ ...data, waterConsumption: e.target.value })}
            className="border rounded-md px-3 py-1.5 pr-8 outline-none bg-white text-sm w-full"
            placeholder="Enter amount"
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">L</span>
        </div>
      </div>

      {/* Water Sources + Other */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <SelectWithCheckboxTags
            label="What sources of water does your plant rely on?"
            options={sourceOptions}
            selected={data.waterSources}
            onChange={handleWaterSourcesChange}
          />
        </div>

        {showOtherInput && (
          <div className="sm:w-1/2">
            <label className="block text-sm font-medium mb-1">Specify other source</label>
            <input
              type="text"
              ref={inputRef}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customValue.trim()) {
                  const updated = [...data.waterSources, customValue.trim()];
                  onChange({ ...data, waterSources: updated });
                  setCustomValue('');
                  setShowOtherInput(false);
                }
              }}
              className="border rounded-md px-3 py-1.5 text-sm w-full"
              placeholder="Enter and press Enter"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Radio for tracking usage */}
      <QuestionWithRadio
        label="Do you measure and track water usage in your plant?"
        checked={data.trackWaterUsage}
        onCheck={(val) => onChange({ ...data, trackWaterUsage: val })}
      />

      {/* Monitoring notes */}
      {data.trackWaterUsage === true && (
        <>
          <p className="ml-8 mt-2 flex items-center gap-2 mr-4 font-medium accent-blue-600 whitespace-nowrap">
            How do you monitor and report it?
          </p>
          <textarea
            placeholder="e.g. Smart meters, weekly audits..."
            className="ml-8 mt-2 border w-1/2 px-2 py-1 rounded-md"
            value={data.monitoringNotes ?? ''}
            onChange={(e) => onChange({ ...data, monitoringNotes: e.target.value })}
          />
        </>
      )}
    </div>
  );
};

export default WaterStep;
