'use client';
import React, { useState } from 'react';

const GHGReductionStep: React.FC = () => {
  const [methods, setMethods] = useState<string[]>([]);
  const [reductionTarget, setReductionTarget] = useState<string>('');
  const [customTarget, setCustomTarget] = useState('');
  const [auditorVerified, setAuditorVerified] = useState<boolean | null>(null);
  const [scopes, setScopes] = useState<string[]>([]);

  const handleMethodChange = (method: string) => {
    setMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleScopeChange = (scope: string) => {
    setScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  return (
    <div className="space-y-6">

      {/* 1. GHG calculation methods */}
      <div>
        <p className="font-medium mb-2">
          How do you measure your product's carbon footprint? <span className="text-xs">(select all that apply)</span>
        </p>
        {[
          'Life Cycle Assessment (LCA) using ISO 14067',
          'GHG Protocol Corporate Standard',
          'Default values from regulatory frameworks (RED II, EU ETS, CBAM)',
          'No formal calculation method yet',
        ].map((method) => (
          <div key={method} className="ml-8">
            <label className="block mb-1">
              <input
                type="checkbox"
                checked={methods.includes(method)}
                onChange={() => handleMethodChange(method)}
                className="mr-2 accent-blue-600"
              />
              {method}
            </label>
          </div>
        ))}

      </div>

      {/* 2. GHG reduction target */}
      <div>
        <p className="font-medium mb-2">What is your current GHG reduction target?</p>
        {['50%', '70%', 'Net Zero by 2050', 'Other'].map((option) => (
          <div key={option} className="flex ml-8 items-center mb-1">
            <input
              type="radio"
              name="reductionTarget"
              value={option}
              checked={reductionTarget === option}
              onChange={(e) => setReductionTarget(e.target.value)}
              className="mr-2 accent-blue-600"
            />
            <label>{option}</label>
            {option === 'Other' && reductionTarget === 'Other' && (
              <input
                type="text"
                className="ml-2 border px-2 py-1 text-sm rounded-md w-24"
                placeholder="%"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {/* 3. Third-party audit */}
      <div>
        <p className="font-medium mb-2">
          Have you verified your product Carbon Footprint (PCF) calculations with a third-party auditor?
        </p>
        <div className="flex ml-60 gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="auditor"
              checked={auditorVerified === true}
              onChange={() => setAuditorVerified(true)}
              className="mr-2 accent-blue-600"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="auditor"
              checked={auditorVerified === false}
              onChange={() => setAuditorVerified(false)}
              className="mr-2 accent-blue-600"
            />
            No
          </label>
        </div>
      </div>

      {/* 4. Scope options if verified */}
      {auditorVerified === true && (
        <div className='ml-40'>
          <p className="font-medium mb-2">Which emissions accounting methodology do you follow?</p>
          {['Scope 1', 'Scope 2', 'Scope 3'].map((scope) => (
            <label key={scope} className="block mb-1">
              <input
                type="checkbox"
                checked={scopes.includes(scope)}
                onChange={() => handleScopeChange(scope)}
                className="mr-2 ml-24 accent-blue-600"
              />
              {scope}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default GHGReductionStep;
