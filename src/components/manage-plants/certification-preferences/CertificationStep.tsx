'use client';
import React, { useState } from 'react';

const CertificationStep: React.FC = () => {
  const [selectedSchemes, setSelectedSchemes] = useState<string[]>([]);
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);
  const [primaryReason, setPrimaryReason] = useState<string>('');
  const [labelingType, setLabelingType] = useState<string>('');
  const [hasBodyCriteria, setHasBodyCriteria] = useState<boolean | null>(null);

  const schemeOptions = [
    'ISCC EU, ISCC CORSIA (PLUS), ISCC PLUS',
    'CertifHy – National Green Certificate (NGC), CertifHy – RFNBO',
    'REDcert-EU, 2BSvs, RSB, HVO Certification, RFNBO Certification',
    'EU ETS, French Low Carbon Label, UK RTFO, EKOenergy Label',
    'Guarantee of Origin (GO), CORSIA, GHG Protocol Certification',
    'All EBCS, Better Biomass, Bonsucro EU, BBP, SURE, KZR INiG, UDB',
    'PosHYdon, Rhineland H2.21, German CertifHy Equivalent (H2Global)',
  ];

  const reasons = ['Regulatory Compliance', 'Market Access', 'Carbon Credits', 'Corporate Sustainability'];
  const labelingOptions = ['Voluntary labeling', 'Mandatory compliance'];

  const toggleScheme = (scheme: string) => {
    setSelectedSchemes((prev) =>
      prev.includes(scheme) ? prev.filter((s) => s !== scheme) : [...prev, scheme]
    );
  };

  return (
    <div className="space-y-6">
      {/* Certification Schemes */}
      <div>
        <p className="font-medium mb-2">Which certification schemes are you currently considering? <span className="text-sm text-gray-500">(select all that apply)</span></p>
        {schemeOptions.map((scheme) => (
          <label key={scheme} className="block mb-1">
            <input
              type="checkbox"
              className="mr-2 accent-blue-600"
              checked={selectedSchemes.includes(scheme)}
              onChange={() => toggleScheme(scheme)}
            />
            {scheme}
          </label>
        ))}
      </div>

      {/* Preferences */}
      <div>
        <p className="font-medium mb-2">Do you have any additional preferences we should consider?</p>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="preferences"
              className="mr-2 accent-blue-600"
              checked={hasPreferences === true}
              onChange={() => setHasPreferences(true)}
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="preferences"
              className="mr-2 accent-blue-600"
              checked={hasPreferences === false}
              onChange={() => setHasPreferences(false)}
            />
            No
          </label>
        </div>
      </div>

      {/* Primary Reason */}
      <div>
        <p className="font-medium mb-2">What is your primary reason for seeking certification?</p>
        {reasons.map((reason) => (
          <label key={reason} className="block mb-1">
            <input
              type="radio"
              name="primaryReason"
              className="mr-2 accent-blue-600"
              checked={primaryReason === reason}
              onChange={() => setPrimaryReason(reason)}
            />
            {reason}
          </label>
        ))}
      </div>

      {/* Labeling Type */}
      <div>
        <p className="font-medium mb-2">Do you require certification for:</p>
        {labelingOptions.map((type) => (
          <label key={type} className="block mb-1">
            <input
              type="radio"
              name="labelingType"
              className="mr-2 accent-blue-600"
              checked={labelingType === type}
              onChange={() => setLabelingType(type)}
            />
            {type}
          </label>
        ))}
      </div>

      {/* Specific Body Criteria */}
      <div>
        <p className="font-medium mb-2">Do you have specific certification body selection criteria?</p>
        <div className="flex gap-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="bodyCriteria"
              className="mr-2 accent-blue-600"
              checked={hasBodyCriteria === true}
              onChange={() => setHasBodyCriteria(true)}
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="bodyCriteria"
              className="mr-2 accent-blue-600"
              checked={hasBodyCriteria === false}
              onChange={() => setHasBodyCriteria(false)}
            />
            No
          </label>
        </div>
      </div>
    </div>
  );
};

export default CertificationStep;
