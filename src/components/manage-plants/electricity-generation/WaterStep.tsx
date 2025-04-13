'use client';
import React, { useEffect, useRef, useState } from 'react';
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
  const [localData, setLocalData] = useState<WaterData>(data);
  const [customValue, setCustomValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const sourceOptions = ['Surface water', 'Groundwater', 'Municipal supply', 'Seawater', 'Other'];

  useEffect(() => {
    setLocalData(data); // Sync if parent sends new props
  }, [data]);

  const handleBlur = () => {
    onChange(localData);
  };

  const handleWaterSourcesChange = (selected: string[]) => {
    if (selected.includes('Other')) {
      const filtered = selected.filter((item) => item !== 'Other');
      setLocalData({ ...localData, waterSources: filtered });
      setShowOtherInput(true);
    } else {
      setLocalData({ ...localData, waterSources: selected });
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
            min={0}
            value={localData.waterConsumption}
            onChange={(e) =>
              setLocalData((prev) => ({ ...prev, waterConsumption: e.target.value }))
            }
            onBlur={handleBlur}
            className="border rounded-md px-3 py-1.5 pr-8 outline-none bg-white text-sm w-full"
            placeholder="Enter amount"
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            L
          </span>
        </div>
      </div>

      {/* Water Sources + Other */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <SelectWithCheckboxTags
            label="What sources of water does your plant rely on?"
            options={sourceOptions}
            selected={localData.waterSources}
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
                  const updated = [...localData.waterSources, customValue.trim()];
                  const newData = { ...localData, waterSources: updated };
                  setLocalData(newData);
                  onChange(newData); // save immediately
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
        checked={localData.trackWaterUsage}
        onCheck={(val) => {
          const updated = { ...localData, trackWaterUsage: val };
          setLocalData(updated);
          onChange(updated);
        }}
      />

      {/* Monitoring notes */}
      {localData.trackWaterUsage === true && (
        <>
          <p className="ml-8 mt-2 flex items-center gap-2 mr-4 font-medium accent-blue-600 whitespace-nowrap">
            How do you monitor and report it?
          </p>
          <textarea
            placeholder="e.g. Smart meters, weekly audits..."
            className="ml-8 mt-2 border w-1/2 px-2 py-1 rounded-md"
            value={localData.monitoringNotes ?? ''}
            onChange={(e) =>
              setLocalData((prev) => ({ ...prev, monitoringNotes: e.target.value }))
            }
            onBlur={handleBlur}
          />
        </>
      )}
    </div>
  );
};

export default WaterStep;
