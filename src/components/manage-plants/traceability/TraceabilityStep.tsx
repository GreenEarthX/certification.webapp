'use client';
import React, { useState } from 'react';
import QuestionWithRadio from '../common/QuestionWithRadio';

const TraceabilityStep: React.FC = () => {
  // ✅ Types explicites
  const [chainOfCustody, setChainOfCustody] = useState<string[]>([]);
  const [traceabilityLevels, setTraceabilityLevels] = useState<string[]>([]);
  const [customTraceability, setCustomTraceability] = useState('');
  const [usesDigitalPlatform, setUsesDigitalPlatform] = useState<boolean | null>(null);

  // ✅ Typage correct
  const handleToggle = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Chain of custody */}
      <div>
        <p className="font-medium mb-2">Which chain of custody do you follow?</p>
        {[
          'Mass Balance',
          'Book & Claim',
          'Identity Preservation',
          'Physical Segregation',
          'No formal model yet',
        ].map((option) => (
          <div key={option} className="ml-8">
            <label className="block font-medium mb-1">
              <input
                type="checkbox"
                value={option}
                checked={chainOfCustody.includes(option)}
                onChange={() => handleToggle(chainOfCustody, setChainOfCustody, option)}
                className="mr-2 accent-blue-600"
              />
              {option}
            </label>
          </div>
        ))}
      </div>

      {/* 2. Traceability level */}
      <div>
        <p className="font-medium mb-2">What level of traceability is required by your customers?</p>
        {['Batch-level', 'Real-time', 'Blockchain-based', 'ERP system', 'Other'].map((option) => (
          <div key={option} className="flex font-medium items-center mb-1 ml-8">
            <input
              type="checkbox"
              value={option}
              checked={traceabilityLevels.includes(option)}
              onChange={() => handleToggle(traceabilityLevels, setTraceabilityLevels, option)}
              className="accent-blue-600 font-medium mr-2"
            />
            <label>{option}</label>
            {option === 'Other' && traceabilityLevels.includes('Other') && (
              <input
                type="text"
                placeholder="Level"
                value={customTraceability}
                onChange={(e) => setCustomTraceability(e.target.value)}
                className="ml-2 border font-medium px-2 py-1 text-sm rounded-md w-24"
              />
            )}
          </div>
        ))}
      </div>

      {/* 3. Digital platform tracking */}
      <QuestionWithRadio
        label="Are you using digital platforms for certification tracking?"
        checked={usesDigitalPlatform}
        onCheck={setUsesDigitalPlatform}
      />
    </div>
  );
};

export default TraceabilityStep;
