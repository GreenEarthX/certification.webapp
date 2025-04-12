'use client';
import React, { useState } from 'react';
import SelectWithCheckboxTags from '../common/SelectWithTags';
import QuestionWithPercentageInput from '../common/QuestionWithPercentageInput';
import QuestionWithRadio from '../common/QuestionWithRadio';

const GHGReductionStep: React.FC = () => {
  const [methods, setMethods] = useState<string[]>([]);
  const [accountingMethods, setAccountingMethods] = useState<string[]>([]);
  const [reductionTarget, setReductionTarget] = useState<string>('');
  const [auditorVerified, setAuditorVerified] = useState<boolean | null>(null);
  const [scopes, setScopes] = useState<string[]>([]);
  const [regulations, setRegulations] = useState<string[]>([]);

  const toggleFromArray = (
    current: string[],
    setFn: (val: string[]) => void,
    value: string
  ) => {
    setFn(current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
  };

  return (
    <div className="space-y-6">

      {/* 1. Carbon footprint methods */}
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
        selected={methods}
        onChange={setMethods}
      />

      {/* 2. GHG regulations/directives */}
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
        selected={regulations}
        onChange={setRegulations}
      />

      {/* 3. GHG reduction target */}
      <QuestionWithPercentageInput
        label="What is your current GHG reduction target?"
        value={reductionTarget}
        onChange={setReductionTarget}
      />

      {/* 4. Audit verified? */}
      <QuestionWithRadio
        label="Have you verified your product Carbon Footprint (PCF) calculations with a third-party auditor?"
        checked={auditorVerified}
        onCheck={setAuditorVerified}
      />

      {/* 5. Emissions scopes (only shown if verified) */}
      {auditorVerified && (
        <div className="ml-28">
          <p className="font-medium mb-2">Which emissions accounting methodology do you follow?</p>
          <div className="ml-36">
            {['Scope 1', 'Scope 2', 'Scope 3'].map(scope => (
              <label key={scope} className="block mb-1">
                <input
                  type="checkbox"
                  checked={scopes.includes(scope)}
                  onChange={() => toggleFromArray(scopes, setScopes, scope)}
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
