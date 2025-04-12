'use client';
import React from 'react';
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
  const toggleFromArray = (
    current: string[],
    value: string,
    key: 'methods' | 'regulations' | 'scopes'
  ) => {
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...data, [key]: updated });
  };

  return (
    <div className="space-y-6">
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
        selected={data.methods || []}
        onChange={(val) => onChange({ ...data, methods: val })}
      />

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
        selected={data.regulations || []}
        onChange={(val) => onChange({ ...data, regulations: val })}
      />

      <QuestionWithPercentageInput
        label="What is your current GHG reduction target?"
        value={data.reductionTarget || ''}
        onChange={(val) => onChange({ ...data, reductionTarget: val })}
      />

      <QuestionWithRadio
        label="Have you verified your product Carbon Footprint (PCF) calculations with a third-party auditor?"
        checked={data.auditorVerified ?? null}
        onCheck={(val) => onChange({ ...data, auditorVerified: val })}
      />

      {data.auditorVerified && (
        <div className="ml-28">
          <p className="font-medium mb-2">Which emissions accounting methodology do you follow?</p>
          <div className="ml-36">
            {['Scope 1', 'Scope 2', 'Scope 3'].map(scope => (
              <label key={scope} className="block mb-1">
                <input
                  type="checkbox"
                  checked={(data.scopes || []).includes(scope)}
                  onChange={() =>
                    toggleFromArray(data.scopes || [], scope, 'scopes')
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
