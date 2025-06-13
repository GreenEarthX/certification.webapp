'use client';
import React, { useEffect, useRef, useState } from 'react';
import QuestionWithRadio from '../common/QuestionWithRadio';
import SelectWithCheckboxTags from '../common/SelectWithTags';
import FileUpload from './FileUpload'; 

interface WaterData {
  waterConsumption: string;
  waterSources: string[];
  trackWaterUsage: boolean | null;
  treatmentLocation: { [source: string]: string[] };  // ✅ Onsite/Offsite
  monitoringFile?: File | null; // ✅ Uploaded doc
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
    setLocalData(data);
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

  const handleTreatmentToggle = (source: string, location: string) => {
    const current = localData.treatmentLocation?.[source] || [];
    const updatedForSource = current.includes(location)
      ? current.filter((v) => v !== location)
      : [...current, location];
  
    const updated = {
      ...localData,
      treatmentLocation: {
        ...localData.treatmentLocation,
        [source]: updatedForSource,
      },
    };
  
    setLocalData(updated);
    onChange(updated);
  };
  

  return (
    <div className="space-y-6">
      {/* Water Consumption */}
      <div className="flex items-center mb-4">
        <label className="flex items-center gap-2 mr-4 block text-sm font-medium whitespace-nowrap">
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

      {/* Water Sources */}
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
                  onChange(newData);
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

      {/* Water treatment location - only if at least one water source is selected */}
      {localData.waterSources.map((source) => (
        <div key={source} className="mt-4">
          <label className="block text-sm font-medium mb-1 text-gray-800">
            Water treatment location for <span className="font-semibold">{source}</span>
          </label>
          <div className="flex gap-6 ml-2 mt-1">
            {['Onsite', 'Offsite'].map((label) => (
              <label key={label} className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={(localData.treatmentLocation?.[source] || []).includes(label)}
                  onChange={() => handleTreatmentToggle(source, label)}
                  className="accent-blue-600"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}


      {/* Radio: track water usage */}
      <QuestionWithRadio
        label="Do you measure and track water usage in your plant?"
        checked={localData.trackWaterUsage}
        onCheck={(val) => {
          const updated = { ...localData, trackWaterUsage: val };
          setLocalData(updated);
          onChange(updated);
        }}
      />

      {/* File Upload: only when tracking is Yes */}
      {localData.trackWaterUsage === true && (
        <div className="ml-6 space-y-2">
          <label className="block text-sm font-medium">Submit document</label>
          <FileUpload
            label="Attach File"
            onChange={(file) =>
              onChange({
                ...localData,
                monitoringFile: file,
              })
            }
            fileName={localData.monitoringFile?.name}
          />
        </div>
      )}
    </div>
  );
};

export default WaterStep;
