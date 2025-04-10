'use client';
import React, { useState } from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithRadioAndInput from '../common/QuestionWithRadioAndInput';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';

const MethanolFields: React.FC = () => {
  const [mainChoice, setMainChoice] = useState<'fossil' | 'renewable' | null>(null);
  const [ccus, setCcus] = useState(false);
  const [ccusPercentage, setCcusPercentage] = useState('');
  const [renewableType, setRenewableType] = useState<string>('');
  const [feedstock, setFeedstock] = useState<string[]>([]);

  const feedstockQuestion = fuelConfigurations.methanol.find(q => q.label === 'What is the feedstock used?');
  const subtypeOptions = fuelConfigurations.methanol_subtypes?.[0]?.options || [];

  return (
    <>
      {/* Main question */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mr-4 accent-blue-600 whitespace-nowrap">
          Are you producing:
        </label>

        <div className="ml-16 mb-2 flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="methanol_type"
              checked={mainChoice === 'fossil'}
              onChange={() => {
                setMainChoice('fossil');
                setRenewableType('');
              }}
              className="accent-blue-600"
            />
            Fossil fuel-based Methanol
          </label>

          {mainChoice === 'fossil' && (
            <div className="ml-6">
              <QuestionWithRadioAndInput
                label="Do you use Carbon Capture Storage Utilization CCUS ?"
                checked={ccus}
                percentage={ccusPercentage}
                onCheck={setCcus}
                onPercentageChange={setCcusPercentage}
              />
            </div>
          )}

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="methanol_type"
              checked={mainChoice === 'renewable'}
              onChange={() => {
                setMainChoice('renewable');
                setCcus(false);
                setCcusPercentage('');
              }}
              className="accent-blue-600"
            />
            Renewable and low carbon methanol
          </label>

          {mainChoice === 'renewable' && (
            <div className="ml-6 flex flex-col gap-1">
              {subtypeOptions.map((option, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="renewable_subtype"
                    checked={renewableType === option}
                    onChange={() => setRenewableType(option)}
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
          onChange={setFeedstock}
        />
      )}
    </>
  );
};

export default MethanolFields;
