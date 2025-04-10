'use client';
import React, { useState } from 'react';
import QuestionWithRadio from '../common/QuestionWithRadio';
import SelectWithCheckboxTags from '../common/SelectWithTags';

const OffTakersStep: React.FC = () => {
  const [offTakers, setOffTakers] = useState<string[]>([]);
  const [requiresLabels, setRequiresLabels] = useState<boolean | null>(null);
  const [labelsText, setLabelsText] = useState<string>('');


  const offTakerOptions = [
    'Refineries',
    'Chemical Manufacturers',
    'Steel Industry',
    'Glass Industry',
    'Electronics and Semiconductor Industry',
    'Heavy Duty Transport',
    'Aviation',
    'Automotive Industry',
    'Power Plants',
    'Energy Storage and Grid Balancing',
    'Natural Gas Infrastructure',
    'Public Sector Infrastructure',
    'Fertilizer Producers',
    'Agricultural Industry',
    'Shipping Industry',
    'Methanol Producers',
    'Petrochemical Industry',
    'Pharmaceuticals and Cosmetics',
    'Marine Shipping',
    'Cogeneration Plants',
    'Fuel Retailers',
    'Regulatory Bodies',
    'Government and Municipal Offtakers',
    'Public Sector Fleets',
    'Power Generation',
    'Gas Utilities',
    'Industrial Heat Applications',
    'Maritime Shipping',
    'Gas Suppliers and Retailers',
    'Energy Utilities',
    'Private Jet Operators',
    'Cargo Airlines',
    'Airport Operators',
    'Aviation Fuel Suppliers',
    'Methanol-Based Fuel Cell Developers',
    'E-fuel Production Companies',
    'Heavy Duty Transport Manufacturers',
    'International Shipping Organizations',
    'Renewable Energy'
  ];
  

  return (
    <div className="space-y-6">
      {/* Primary Off-Takers */}
      <SelectWithCheckboxTags
        label="Who are your primary Off-Takers?"
        options={offTakerOptions}
        selected={offTakers}
        onChange={setOffTakers}
      />

      {/* Require Sustainability Labels */}
      <QuestionWithRadio
        label="Do your Off-Takers require specific sustainability labels?"
        checked={requiresLabels}
        onCheck={setRequiresLabels}
      />
      {requiresLabels && (
        <textarea
          className="ml-8 border w-1/2 px-2 py-1 rounded-md"
          placeholder="Please describe which labels are required..."
          value={labelsText}
          onChange={(e) => setLabelsText(e.target.value)}
        />
      )}
      
    </div>
  );
};

export default OffTakersStep;
