'use client';
import React, { useState } from 'react';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithRadio from '../common/QuestionWithRadio';

const BiofuelFields: React.FC = () => {
  const config = fuelConfigurations.biofuels;

  const generationTypes = config.find(q => q.label === 'Biofuel generation type');
  const feedstockQuestion = config.find(q => q.label === 'What is the feedstock used?');

  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [feedstock, setFeedstock] = useState<string[]>([]);
    const [isRFNBO, setIsRFNBO] = useState<boolean | null>(null);

  const handleMainChange = (value: string) => {
    setSelectedMain(value);
    setSelectedSub(null);
  };

  const getSubOptions = (main: string) => {
    return config.find(q => q.label === main)?.options ?? [];
  };

  return (
    <>
      {/* Main generation type */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mr-4 accent-blue-600 whitespace-nowrap">
          Are you producing:
        </label>

        {generationTypes?.options.map((gen) => (
          <div key={gen} className="ml-20 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="generation"
                checked={selectedMain === gen}
                onChange={() => handleMainChange(gen)}
                className="accent-blue-600"
              />
              {gen}
            </label>

            {/* Sub-generation options */}
            {selectedMain === gen && getSubOptions(gen).length > 0 && (
              <div className="ml-16 mt-2 flex flex-col gap-1">
                {getSubOptions(gen).map((child, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sub-generation"
                      checked={selectedSub === child}
                      onChange={() => setSelectedSub(child)}
                      className="accent-blue-600"
                    />
                    {child}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feedstock MultiSelect */}
      {feedstockQuestion && (
        <QuestionWithMultiSelect
          label={feedstockQuestion.label}
          options={feedstockQuestion.options}
          selected={feedstock}
          onChange={setFeedstock}
        />
      )}

      <QuestionWithRadio
              label="Is your fuel classified as RFNBO?"
              checked={isRFNBO}
              onCheck={setIsRFNBO}
      />
    </>
  );
};

export default BiofuelFields;
