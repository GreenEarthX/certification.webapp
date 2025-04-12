'use client';
import React from 'react';
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

  const mainChoice = data.mainChoice ?? null;
  const ccus = data.ccus ?? false;
  const ccusPercentage = data.ccusPercentage ?? '';
  const renewableType = data.renewableType ?? '';
  const feedstock = data.feedstock ?? [];
  const isRFNBO = data.isRFNBO ?? null;

  return (
    <>
      {/* Main question */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mr-4 font-medium accent-blue-600 whitespace-nowrap">
          Are you producing:
        </label>

        <div className="ml-16 mb-2 flex flex-col gap-2">
          {/* Fossil */}
          <label className="flex font-medium items-center gap-2">
            <input
              type="radio"
              name="methanol_type"
              checked={mainChoice === 'fossil'}
              onChange={() =>
                onChange({
                  ...data,
                  mainChoice: 'fossil',
                  renewableType: '',
                })
              }
              className="accent-blue-600"
            />
            Fossil fuel-based Methanol
          </label>

          {mainChoice === 'fossil' && (
            <div className="ml-6">
              <QuestionWithRadioAndInput
                label="Do you use Carbon Capture Storage Utilization CCUS?"
                checked={ccus}
                percentage={ccusPercentage}
                onCheck={(val) => onChange({ ...data, ccus: val })}
                onPercentageChange={(val) => onChange({ ...data, ccusPercentage: val })}
              />
            </div>
          )}

          {/* Renewable */}
          <label className="flex font-medium items-center gap-2">
            <input
              type="radio"
              name="methanol_type"
              checked={mainChoice === 'renewable'}
              onChange={() =>
                onChange({
                  ...data,
                  mainChoice: 'renewable',
                  ccus: false,
                  ccusPercentage: '',
                })
              }
              className="accent-blue-600"
            />
            Renewable and low carbon methanol
          </label>

          {mainChoice === 'renewable' && (
            <div className="ml-6 flex flex-col gap-1">
              {subtypeOptions.map((option, idx) => (
                <label key={idx} className="flex font-medium items-center gap-2">
                  <input
                    type="radio"
                    name="renewable_subtype"
                    checked={renewableType === option}
                    onChange={() => onChange({ ...data, renewableType: option })}
                    className="accent-blue-600"
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedstock always last */}
      {feedstockQuestion && (
        <QuestionWithMultiSelect
          label={feedstockQuestion.label}
          options={feedstockQuestion.options}
          selected={feedstock}
          onChange={(val) => onChange({ ...data, feedstock: val })}
        />
      )}

      {/* RFNBO */}
      <QuestionWithRadio
        label="Is your fuel classified as RFNBO?"
        checked={isRFNBO}
        onCheck={(val) => onChange({ ...data, isRFNBO: val })}
      />
    </>
  );
};

export default MethanolFields;
