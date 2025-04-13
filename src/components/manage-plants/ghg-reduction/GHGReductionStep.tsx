'use client';
import React, { useEffect, useState } from 'react';
import SelectWithCheckboxTags from '../common/SelectWithTags';
import QuestionWithPercentageInput from '../common/QuestionWithPercentageInput';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface Props {
  data: {
    methods?: string[];
    regulations?: string[];
    reductionTarget?: string;
    auditorVerified?: boolean | null;
    scopes?: string[];
  };
  onChange: (updated: any) => void;
}

const GHGReductionStep: React.FC<Props> = ({ data, onChange }) => {
  const [localData, setLocalData] = useState<Props['data']>(data);

  useEffect(() => {
    setLocalData(data); // resync if parent sends new data
  }, [data]);

  const handleBlur = () => {
    onChange(localData);
  };

  const toggleFromArray = (
    current: string[],
    value: string,
    key: 'methods' | 'regulations' | 'scopes'
  ) => {
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    setLocalData((prev) => ({ ...prev, [key]: updated }));
    onChange({ ...localData, [key]: updated }); // sync immediately
  };

  return (
    <div className="space-y-6">
      {/* Methodologies */}
      <SelectWithCheckboxTags
        label="What are the methodologies you use for calculating and reporting your carbon footprint? (select all that apply)"
        options={[
          'GHG Protocol',
          'ISO 14064',
          'ISO 14067',
          'ISO 14040 / ISO 14044',
          'Lifecycle Assessment',
          'PAS 2050',
          'PAS 2060',
        ]}
        selected={localData.methods || []}
        onChange={(val) => {
          setLocalData((prev) => ({ ...prev, methods: val }));
          onChange({ ...localData, methods: val });
        }}
      />

      {/* Regulations */}
      <SelectWithCheckboxTags
        label="What are the regulations/directives that you follow or plan to follow for GHG reporting and accounting:"
        options={[
          'RED II',
          'RED III',
          'CBAM',
          'Fuel quality Directive',
          'EU ETS',
          'EU taxonomy',
          'PEF',
          'ESRS',
          'CRSD',
        ]}
        selected={localData.regulations || []}
        onChange={(val) => {
          setLocalData((prev) => ({ ...prev, regulations: val }));
          onChange({ ...localData, regulations: val });
        }}
      />

      {/* Reduction target */}
      <QuestionWithPercentageInput
        label="What is your current GHG reduction target?"
        value={localData.reductionTarget || ''}
        onChange={(val) =>
          setLocalData((prev) => ({ ...prev, reductionTarget: val }))
        }
        onBlur={handleBlur}
      />

      {/* Auditor verification */}
      <QuestionWithRadio
        label="Have you verified your product Carbon Footprint (PCF) calculations with a third-party auditor?"
        checked={localData.auditorVerified ?? null}
        onCheck={(val) => {
          const updated = { ...localData, auditorVerified: val };
          setLocalData(updated);
          onChange(updated);
        }}
      />

      {/* Emission scopes if auditor verified */}
      {localData.auditorVerified && (
        <div className="ml-28">
          <p className="font-medium mb-2">Which emissions accounting methodology do you follow?</p>
          <div className="ml-36">
            {['Scope 1', 'Scope 2', 'Scope 3'].map((scope) => (
              <label key={scope} className="block mb-1">
                <input
                  type="checkbox"
                  checked={(localData.scopes || []).includes(scope)}
                  onChange={() =>
                    toggleFromArray(localData.scopes || [], scope, 'scopes')
                  }
                  className="mr-2 accent-blue-600"
                />
                {scope}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GHGReductionStep;
