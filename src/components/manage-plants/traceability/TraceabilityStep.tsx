'use client';
import React, { useState } from 'react';
import QuestionWithRadio from '../general-info/QuestionWithRadio';

const TraceabilityStep: React.FC = () => {
  const [chainOfCustody, setChainOfCustody] = useState('');
  const [traceabilityLevel, setTraceabilityLevel] = useState('');
  const [customTraceability, setCustomTraceability] = useState('');
  const [usesDigitalPlatform, setUsesDigitalPlatform] = useState<boolean | null>(null);

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
            <label className="block mb-1">
              <input
                type="radio"
                name="chainOfCustody"
                value={option}
                checked={chainOfCustody === option}
                onChange={() => setChainOfCustody(option)}
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
          <div key={option} className="flex items-center mb-1">
            <div className="ml-8">
            <input
              type="radio"
              name="traceabilityLevel"
              value={option}
              checked={traceabilityLevel === option}
              onChange={() => setTraceabilityLevel(option)}
              className="accent-blue-600 mr-2"
            />
            <label>{option}</label>
            {option === 'Other' && traceabilityLevel === 'Other' && (
              <input
                type="text"
                placeholder="Level"
                value={customTraceability}
                onChange={(e) => setCustomTraceability(e.target.value)}
                className="ml-2 border px-2 py-1 text-sm rounded-md w-24"
              />
            )}
          </div>
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
