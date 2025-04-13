'use client';
import React from 'react';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface Props {
  data: {
    chainOfCustody?: string[];
    traceabilityLevels?: string[];
    customTraceability?: string;
    usesDigitalPlatform?: boolean | null;
  };
  onChange: (updated: any) => void;
}

const TraceabilityStep: React.FC<Props> = ({ data, onChange }) => {
  const handleToggle = (
    list: string[],
    key: 'chainOfCustody' | 'traceabilityLevels',
    value: string
  ) => {
    const updated = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    onChange({ ...data, [key]: updated });

    // Clear custom input if "Other" is deselected
    if (key === 'traceabilityLevels' && value === 'Other' && list.includes('Other')) {
      onChange({ ...data, traceabilityLevels: updated, customTraceability: '' });
    }
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
                checked={(data.chainOfCustody || []).includes(option)}
                onChange={() =>
                  handleToggle(data.chainOfCustody || [], 'chainOfCustody', option)
                }
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
          <div key={option} className="ml-8">
            <label className="flex font-medium items-center mb-1 cursor-pointer">
              <input
                type="checkbox"
                value={option}
                checked={(data.traceabilityLevels || []).includes(option)}
                onChange={() =>
                  handleToggle(data.traceabilityLevels || [], 'traceabilityLevels', option)
                }
                className="accent-blue-600 font-medium mr-2"
              />
              {option}
              {option === 'Other' &&
                (data.traceabilityLevels || []).includes('Other') && (
                  <input
                    type="text"
                    placeholder="Level"
                    value={data.customTraceability || ''}
                    onChange={(e) =>
                      onChange({ ...data, customTraceability: e.target.value })
                    }
                    className="ml-2 border font-medium px-2 py-1 text-sm rounded-md w-24"
                  />
                )}
            </label>
          </div>
        ))}
      </div>


      {/* 3. Digital platform tracking */}
      <QuestionWithRadio
        label="Are you using digital platforms for certification tracking?"
        checked={data.usesDigitalPlatform ?? null}
        onCheck={(val) => onChange({ ...data, usesDigitalPlatform: val })}
      />
    </div>
  );
};

export default TraceabilityStep;
