'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const ReactFlagsSelect = dynamic(() => import('react-flags-select').then((mod) => mod.default), {
  ssr: false,
});

interface CountryInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CountryInput: React.FC<CountryInputProps> = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
      <ReactFlagsSelect
        selected={value}
        onSelect={onChange}
        searchable
        placeholder="Select Country"
        searchPlaceholder="Search countries"
        className="country-select"
      />
    </div>
  );
};

export default CountryInput;
