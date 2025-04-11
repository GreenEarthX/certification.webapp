'use client';
import React, { useState } from 'react';
import SelectWithCheckboxTags from '../common/SelectWithTags';
import QuestionWithPercentageInput from '../common/QuestionWithPercentageInput';
import QuestionWithRadio from '../common/QuestionWithRadio';

const GHGReductionStep: React.FC = () => {
  const [methods, setMethods] = useState<string[]>([]);
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
      <div>
        <p className="font-medium mb-2">
          How do you measure your product&apos;s carbon footprint? <span className="text-xs">(select all that apply)</span>
        </p>
        {[
          'Life Cycle Assessment (LCA) using ISO 14067',
          'GHG Protocol Corporate Standard',
          'Default values from regulatory frameworks (RED II, EU ETS, CBAM)',
          'No formal calculation method yet',
        ].map(method => (
          <div key={method} className="ml-8">
            <label className="block mb-1">
              <input
                type="checkbox"
                checked={methods.includes(method)}
                onChange={() => toggleFromArray(methods, setMethods, method)}
                className="mr-2 accent-blue-600"
              />
              {method}
            </label>
          </div>
        ))}
      </div>

      {/* 2. GHG reduction target (custom component) */}
      <QuestionWithPercentageInput
        label="What is your current GHG reduction target?"
        value={reductionTarget}
        onChange={setReductionTarget}
      />

      {/* 3. Audit verified? (custom radio) */}
      <QuestionWithRadio
        label="Have you verified your product Carbon Footprint (PCF) calculations with a third-party auditor?"
        checked={auditorVerified}
        onCheck={setAuditorVerified}
      />

      {/* 4. Emissions scopes */}
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


      {/* 5. Multi-select regulations (custom component) */}
      <SelectWithCheckboxTags
        label="What are the regulations/directives that you follow or plan to follow for GHG reporting and accounting:"
        options={['RED II', 'RED III', 'CBAM', 'Fuel quality Directive', 'EU ETS', 'EU taxonomy', 'PEF', 'ESRS', 'CRSD']}
        selected={regulations}
        onChange={setRegulations}
      />
    </div>
  );
};

export default GHGReductionStep;
