'use client';
import React, { useEffect, useState } from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithRadioAndInput from '../common/QuestionWithRadioAndInput';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface MethanolData {
  mainChoice: 'fossil' | 'renewable' | null;
  ccus: boolean;
  ccusPercentage: string;
  renewableType: string;
  feedstock: string[];
  isRFNBO: boolean | null;
}

interface Props {
  data: Partial<MethanolData>;
  onChange: (updated: Partial<MethanolData>) => void;
}

const MethanolFields: React.FC<Props> = ({ data, onChange }) => {
  const feedstockQuestion = fuelConfigurations.methanol.find(
    (q) => q.label === 'What is the feedstock used?'
  );
  const subtypeOptions = fuelConfigurations.methanol_subtypes?.[0]?.options || [];

  const [localData, setLocalData] = useState<Partial<MethanolData>>(data);
  const [ccusPercentInput, setCcusPercentInput] = useState(data.ccusPercentage || '');

  useEffect(() => {
    setLocalData(data);
    setCcusPercentInput(data.ccusPercentage || '');
  }, [data]);

  const updateAndSync = (partial: Partial<MethanolData>) => {
    const updated = { ...localData, ...partial };
    setLocalData(updated);
    onChange(updated);
  };

  const handleCCUSPercentageBlur = () => {
    updateAndSync({ ccusPercentage: ccusPercentInput });
  };

  return (
    <>
      {/* Main choice */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mr-4 font-medium accent-blue-600 whitespace-nowrap">
          Are you producing:
        </label>

        <div className="ml-16 mb-2 flex flex-col gap-2">
          {/* Fossil-based */}
          <label className="flex font-medium items-center gap-2">
            <input
              type="radio"
              name="methanol_type"
              checked={localData.mainChoice === 'fossil'}
              onChange={() =>
                updateAndSync({
                  mainChoice: 'fossil',
                  renewableType: '',
                })
              }
              className="accent-blue-600"
            />
            Fossil fuel-based Methanol
          </label>

          {localData.mainChoice === 'fossil' && (
            <div className="ml-6">
              <QuestionWithRadioAndInput
                label="Do you use Carbon Capture Storage Utilization CCUS?"
                checked={localData.ccus || false}
                percentage={ccusPercentInput}
                onCheck={(val) => updateAndSync({ ccus: val })}
                onPercentageChange={(val) => setCcusPercentInput(val)} // local only
                onPercentageBlur={handleCCUSPercentageBlur} // sync on blur
              />
            </div>
          )}

          {/* Renewable-based */}
          <label className="flex font-medium items-center gap-2">
            <input
              type="radio"
              name="methanol_type"
              checked={localData.mainChoice === 'renewable'}
              onChange={() =>
                updateAndSync({
                  mainChoice: 'renewable',
                  ccus: false,
                  ccusPercentage: '',
                })
              }
              className="accent-blue-600"
            />
            Renewable and low carbon methanol
          </label>

          {localData.mainChoice === 'renewable' && (
            <div className="ml-6 flex flex-col gap-1">
              {subtypeOptions.map((option, idx) => (
                <label key={idx} className="flex font-medium items-center gap-2">
                  <input
                    type="radio"
                    name="renewable_subtype"
                    checked={localData.renewableType === option}
                    onChange={() => updateAndSync({ renewableType: option })}
                    className="accent-blue-600"
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedstock */}
      {feedstockQuestion && (
        <QuestionWithMultiSelect
          label={feedstockQuestion.label}
          options={feedstockQuestion.options}
          selected={localData.feedstock || []}
          onChange={(val) => updateAndSync({ feedstock: val })}
        />
      )}

      {/* RFNBO */}
      <QuestionWithRadio
        label="Is your fuel classified as RFNBO?"
        checked={localData.isRFNBO ?? null}
        onCheck={(val) => updateAndSync({ isRFNBO: val })}
      />
    </>
  );
};

export default MethanolFields;
