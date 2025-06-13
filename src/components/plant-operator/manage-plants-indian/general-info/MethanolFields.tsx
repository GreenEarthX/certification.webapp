'use client';
import React, { useEffect, useState } from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithRadioAndInput from '../common/QuestionWithRadioAndInput';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface MethanolData {
  methanolType: 'fossil' | 'renewable' | null;
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

  const [localData, setLocalData] = useState<Partial<MethanolData>>({
    methanolType: data.methanolType ?? null,
    ccus: data.ccus ?? false,
    ccusPercentage: data.ccusPercentage ?? '',
    renewableType: data.renewableType ?? '',
    feedstock: data.feedstock ?? [],
    isRFNBO: data.isRFNBO ?? null,
  });

  const [ccusPercentInput, setCcusPercentInput] = useState(localData.ccusPercentage || '');

  useEffect(() => {
    setLocalData({
      methanolType: data.methanolType ?? null,
      ccus: data.ccus ?? false,
      ccusPercentage: data.ccusPercentage ?? '',
      renewableType: data.renewableType ?? '',
      feedstock: data.feedstock ?? [],
      isRFNBO: data.isRFNBO ?? null,
    });
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
      {/* Methanol Type Choice */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mr-4 block mb-1 text-sm font-medium accent-blue-600 whitespace-nowrap">
          Are you producing:
        </label>

        <div className="ml-16 mb-2 flex flex-col gap-2">
          {/* Fossil-based */}
          <label className="flex block mb-1 text-sm font-medium items-center gap-2">
            <input
              type="radio"
              name="methanol_type"
              checked={localData.methanolType === 'fossil'}
              onChange={() =>
                updateAndSync({
                  methanolType: 'fossil',
                  renewableType: '',
                })
              }
              className="accent-blue-600"
            />
            Fossil fuel-based Methanol
          </label>

          {localData.methanolType === 'fossil' && (
            <div className="ml-6">
              <QuestionWithRadioAndInput
                label="Do you use Carbon Capture Storage Utilization CCUS?"
                checked={localData.ccus || false}
                percentage={ccusPercentInput}
                onCheck={(val) => updateAndSync({ ccus: val })}
                onPercentageChange={(val) => setCcusPercentInput(val)}
                onPercentageBlur={handleCCUSPercentageBlur}
              />
            </div>
          )}

          {/* Renewable-based */}
          <label className="flex block mb-1 text-sm font-medium items-center gap-2">
            <input
              type="radio"
              name="methanol_type"
              checked={localData.methanolType === 'renewable'}
              onChange={() =>
                updateAndSync({
                  methanolType: 'renewable',
                  ccus: false,
                  ccusPercentage: '',
                })
              }
              className="accent-blue-600"
            />
            Renewable and low carbon methanol
          </label>

          {localData.methanolType === 'renewable' && (
            <div className="ml-6 flex flex-col gap-1">
              {subtypeOptions.map((option, idx) => (
                <label key={idx} className="flex block mb-1 text-sm font-medium items-center gap-2">
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

    </>
  );
};

export default MethanolFields;
