'use client';
import React from 'react';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface BiofuelData {
  selectedMain: string[];
  selectedSub: string[];
  feedstock: string[];
  isRFNBO: boolean | null;
}

interface Props {
  data: Partial<BiofuelData>;
  onChange: (updated: Partial<BiofuelData>) => void;
}

const BiofuelFields: React.FC<Props> = ({ data, onChange }) => {
  const config = fuelConfigurations.biofuels;

  const generationTypes = config.find(q => q.label === 'Biofuel generation type');
  const feedstockQuestion = config.find(q => q.label === 'What is the feedstock used?');

  const selectedMain: string[] = data.selectedMain ?? [];
  const selectedSub: string[] = data.selectedSub ?? [];
  const feedstock: string[] = data.feedstock ?? [];
  const isRFNBO: boolean | null = data.isRFNBO ?? null;

  const toggleMain = (value: string) => {
    const updated = selectedMain.includes(value)
      ? selectedMain.filter((v) => v !== value)
      : [...selectedMain, value];

    const removed = !updated.includes(value);
    const children = getSubOptions(value);
    const updatedSubs = removed
      ? selectedSub.filter((sub) => !children.includes(sub))
      : selectedSub;

    onChange({ ...data, selectedMain: updated, selectedSub: updatedSubs });
  };

  const toggleSub = (value: string) => {
    const updated = selectedSub.includes(value)
      ? selectedSub.filter((v) => v !== value)
      : [...selectedSub, value];
    onChange({ ...data, selectedSub: updated });
  };

  const getSubOptions = (main: string) => {
    return config.find(q => q.label === main)?.options ?? [];
  };

  return (
    <>
      {/* Main generation type */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mr-4 accent-blue-600 whitespace-nowrap font-medium">
          Are you producing:
        </label>

        {generationTypes?.options.map((gen) => (
          <div key={gen} className="ml-20 mb-2">
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                name="generation"
                checked={selectedMain.includes(gen)}
                onChange={() => toggleMain(gen)}
                className="accent-blue-600"
              />
              {gen}
            </label>

            {/* Sub-generation options */}
            {selectedMain.includes(gen) && getSubOptions(gen).length > 0 && (
              <div className="ml-16 mt-2 flex flex-col gap-1">
                {getSubOptions(gen).map((child, i) => (
                  <label key={i} className="flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      name="sub-generation"
                      checked={selectedSub.includes(child)}
                      onChange={() => toggleSub(child)}
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
          onChange={(val) => onChange({ ...data, feedstock: val })}
        />
      )}

      {/* RFNBO */}
      <QuestionWithRadio
        label="Is your fuel classified as RFNBO?"
        checked={isRFNBO}
        onCheck={(val) => onChange({ ...data, isRFNBO: val })}
      />
    </>
  );
};

export default BiofuelFields;
