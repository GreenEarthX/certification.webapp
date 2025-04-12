'use client';
import React, { useState } from 'react';
import QuestionWithRadio from '../common/QuestionWithRadio';
import SelectWithTags from '../common/SelectWithTags'; 

const CertificationStep: React.FC = () => {
  const [selectedSchemes, setSelectedSchemes] = useState<string[]>([]);
  const [primaryReason, setPrimaryReason] = useState<string>('');
  const [certificationRequirement, setCertificationRequirement] = useState<string>(''); // 'Voluntary labeling' or 'Mandatory compliance'
  const [labeling, setLabeling] = useState<string[]>([]);
  const [hasBodyCriteria, setHasBodyCriteria] = useState<boolean | null>(null);
  const [bodyCriteriaText, setBodyCriteriaText] = useState('');
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);
  const [preferencesText, setPreferencesText] = useState('');

  const [requirementText, setRequirementText] = useState('');

  const schemeOptions = [
    'CertifHy EU RFNBO Scheme',
    'CertifHy NGC Scheme',
    'TÜV Rheinland “H2.21” Standard',
    'ISCC EU',
    'ISCC PLUS',
    'ISCC CORSIA',
    'RSB',
    '2BSvs',
    'REDcert-EU',
    'SCOTTISH QUALITY FARM ASSURED COMBINABLE CROPS (SQC)',
    'Better Biomass',
    'KZR INiG system',
    'REDcert, Red Tractor Farm Assurance Combinable Crops & Sugar Beet Scheme (Red Tractor)',
    'Austrian Agricultural Certification Scheme (AACS)',
    'Bonsucro EU',
    'Round Table on Responsible Soy EU RED (RTRS EU RED)',
    'Sustainable Biomass Program (SBP)',
    'Sustainable Resources (Sure) voluntary Scheme',
    'Universal Feed Assurance Scheme (UFAS)',
    'French Low Carbon Label',
    'Guarantee of Origin (GO) for Renewable Gas',
    'German CertifHy Equivalent (H2Global Initiative)',
    'Smart Gas Grid Certification (SGGC)',
    'Carbon Trust Carbon Neutral Certification',
    'PosHYdon Certification (Hydrogen from Offshore Wind)',
    'European Energy Certificate System (EECS)',
    'Swedish Biogas & Biofuels Sustainability Certification',
    'Programme for the Endorsement of Forest Certification (PEFC)',
    'Trade Assurance Scheme for Combinable Crops (TASCC)',
    'GHG Reduction Certificate',
    'SÜD CMS 70',
    'Renewable Ammonia Certification',
    'REDcert Certification for SAF',
  ];
  
  

  const reasons = ['Regulatory Compliance', 'Market Access', 'Carbon Credits', 'Corporate Sustainability'];

  /*const toggleScheme = (scheme: string) => {
    setSelectedSchemes((prev) =>
      prev.includes(scheme) ? prev.filter((s) => s !== scheme) : [...prev, scheme]
    );
  };

  const toggleLabeling = (option: string) => {
    setLabeling((prev) =>
      prev.includes(option) ? prev.filter((l) => l !== option) : [...prev, option]
    );
  };*/

  return (
    <div className="space-y-6 bg-transparent ">
      {/* Certification Schemes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
      <SelectWithTags
        label="Which certification schemes are you currently considering?"
        options={schemeOptions}
        selected={selectedSchemes}
        onChange={setSelectedSchemes}
      />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      {/* Primary Reason */}
      <div>
        <p className="font-medium mb-2">What is you primary reason for seeking certification?</p>
        {reasons.map((reason) => (
          <label key={reason} className="block ml-8 mb-1">
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

      {/* Certification for */}
      <div>
      <p className="font-medium mb-2">Do you require certification for:</p>
        {['Voluntary labeling', 'Mandatory compliance'].map((option) => (
          <label key={option} className="block ml-8 mb-1">
            <input
              type="radio"
              name="certificationRequirement"
              className="mr-2 accent-blue-600"
              checked={certificationRequirement === option}
              onChange={() => setCertificationRequirement(option)}
            />
            {option}
          </label>
        ))}

        {certificationRequirement === 'Mandatory compliance' && (
          <textarea
            placeholder="Please describe which regulations or directives you need to comply with..."
            className="ml-8 mt-2 border w-1/2 px-2 py-1 rounded-md"
            value={requirementText}
            onChange={(e) => setRequirementText(e.target.value)}
          />
        )}
      </div>

      {/* Specific Body Criteria */}
      <QuestionWithRadio
        label="Do you have specific certification body selection criteria?"
        checked={hasBodyCriteria}
        onCheck={setHasBodyCriteria}
      />
      {hasBodyCriteria && (
        <textarea
          placeholder="Please describe your selection criteria..."
          className="ml-8 border w-1/2 px-2 py-1 rounded-md"
          value={bodyCriteriaText}
          onChange={(e) => setBodyCriteriaText(e.target.value)}
        />
      )}

      {/* Additional Preferences */}
      <QuestionWithRadio
        label="Do you have any additional preferences we should consider?"
        checked={hasPreferences}
        onCheck={setHasPreferences}
      />
      {hasPreferences && (
        <textarea
          placeholder="Add any specific preferences..."
          className="ml-8 border w-1/2 px-2 py-1 rounded-md"
          value={preferencesText}
          onChange={(e) => setPreferencesText(e.target.value)}
        />
      )}
    </div>
    </div>
  );
};

export default CertificationStep;
