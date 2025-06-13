'use client';
import React from 'react';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface GenerationBlock {
  generation: string;
  technologies: string[];
}

interface BiofuelData {
  biofuels: GenerationBlock[];        // ⬅ array of generation + selected sub-techs
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

  const biofuels: GenerationBlock[] = data.biofuels ?? [];
  const feedstock: string[] = data.feedstock ?? [];
  const isRFNBO: boolean | null = data.isRFNBO ?? null;

  const getTechnologies = (generation: string) => {
    return config.find(q => q.label === generation)?.options ?? [];
  };

  const isGenSelected = (gen: string) =>
    biofuels.some(block => block.generation === gen);

  const getBlock = (gen: string) =>
    biofuels.find(block => block.generation === gen);

  const toggleGeneration = (gen: string) => {
    const exists = isGenSelected(gen);
    const updated = exists
      ? biofuels.filter(block => block.generation !== gen)
      : [...biofuels, { generation: gen, technologies: [] }];

    onChange({ ...data, biofuels: updated });
  };

  const toggleTechnology = (gen: string, tech: string) => {
    const existingBlock = getBlock(gen);

    if (!existingBlock) return;

    const isSelected = existingBlock.technologies.includes(tech);
    const updatedTechs = isSelected
      ? existingBlock.technologies.filter(t => t !== tech)
      : [...existingBlock.technologies, tech];

    const updatedBiofuels = biofuels.map(block =>
      block.generation === gen
        ? { ...block, technologies: updatedTechs }
        : block
    );

    onChange({ ...data, biofuels: updatedBiofuels });
  };

  return (
    <>
      <div className="mb-4">
        <label className="flex items-center gap-2 mr-4 accent-blue-600 whitespace-nowrap font-medium">
          Are you producing:
        </label>

        {generationTypes?.options.map((gen) => {
          const techOptions = getTechnologies(gen);
          const isSelected = isGenSelected(gen);
          const currentTechs = getBlock(gen)?.technologies ?? [];

          return (
            <div key={gen} className="ml-20 mb-2">
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  name="generation"
                  checked={isSelected}
                  onChange={() => toggleGeneration(gen)}
                  className="accent-blue-600"
                />
                {gen}
              </label>

              {isSelected && techOptions.length > 0 && (
                <div className="ml-16 mt-2 flex flex-col gap-1">
                  {techOptions.map((tech, idx) => (
                    <label key={idx} className="flex items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        name="tech"
                        checked={currentTechs.includes(tech)}
                        onChange={() => toggleTechnology(gen, tech)}
                        className="accent-blue-600"
                      />
                      {tech}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feedstock */}
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
