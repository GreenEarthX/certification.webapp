'use client';
import React, { useState } from 'react';

const OffTakersStep: React.FC = () => {
  const [offTakers, setOffTakers] = useState<string[]>([]);
  const [requiresLabels, setRequiresLabels] = useState<boolean | null>(null);
  const [selectedMarketing, setSelectedMarketing] = useState<string>('');
  const [customMarketing, setCustomMarketing] = useState('');

  const offTakerOptions = [
    'Industrial buyers',
    'Aviation sector (SAF compliance)',
    'Energy utilities (Power-to-Gas applications)',
    'Transport companies (Hydrogen fuel cell vehicles)',
    'Voluntary buyers (Carbon-neutral initiatives)',
  ];

  const marketingOptions = ['Carbon Neutral', 'Low-Carbon', 'Other'];

  const toggleCheckbox = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary Off-Takers */}
      <div>
        <p className="font-medium mb-2">
          Who are your primary Off-Takers? <span className="text-sm text-gray-500">(select all that apply)</span>
        </p>
        {offTakerOptions.map((option) => (
          <label key={option} className="block mb-1">
            <input
              type="checkbox"
              className="mr-2 accent-blue-600"
              checked={offTakers.includes(option)}
              onChange={() => toggleCheckbox(option, offTakers, setOffTakers)}
            />
            {option}
          </label>
        ))}
      </div>

      {/* Require Sustainability Labels */}
      <div>
        <p className="font-medium mb-2">Do your Off-Takers require specific sustainability labels?</p>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="requiresLabels"
              className="mr-2 accent-blue-600"
              checked={requiresLabels === true}
              onChange={() => setRequiresLabels(true)}
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="requiresLabels"
              className="mr-2 accent-blue-600"
              checked={requiresLabels === false}
              onChange={() => setRequiresLabels(false)}
            />
            No
          </label>
        </div>
      </div>

      {/* Marketing Claims as Radio */}
      <div>
        <p className="font-medium mb-2">Are you marketing your fuel as:</p>
        {marketingOptions.map((option) => (
          <div key={option} className="flex items-center mb-2">
            <input
              type="radio"
              name="marketingClaim"
              className="mr-2 accent-blue-600"
              checked={selectedMarketing === option}
              onChange={() => setSelectedMarketing(option)}
            />
            <label>{option}</label>
            {option === 'Other' && selectedMarketing === 'Other' && (
              <input
                type="text"
                placeholder=""
                value={customMarketing}
                onChange={(e) => setCustomMarketing(e.target.value)}
                className="ml-2 border px-2 py-1 text-sm rounded-md w-48"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffTakersStep;
