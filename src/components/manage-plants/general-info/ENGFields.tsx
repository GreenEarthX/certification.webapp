'use client';
import React from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithSelect from '../common/QuestionWithSelect';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface ENGData {
  answers: string[];
  feedstock: string[];
  isRFNBO: boolean | null;
}

interface Props {
  data: Partial<ENGData>;
  onChange: (updated: Partial<ENGData>) => void;
}

const ENGFields: React.FC<Props> = ({ data, onChange }) => {
  const questions = fuelConfigurations.eng;

  const feedstockQuestion = questions.find(q => q.label === 'What is the feedstock used?');
  const mainQuestions = questions.filter(q => q.label !== 'What is the feedstock used?');

  const answers = data.answers ?? Array(mainQuestions.length).fill('');
  const feedstock = data.feedstock ?? [];
  const isRFNBO = data.isRFNBO ?? null;

  const handleChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    onChange({ ...data, answers: updated });
  };

  return (
    <>
      {mainQuestions.map((question, index) => (
        <QuestionWithSelect
          key={index}
          question={question}
          value={answers[index]}
          onChange={(val) => handleChange(index, val)}
        />
      ))}

      {feedstockQuestion && (
        <QuestionWithMultiSelect
          label={feedstockQuestion.label}
          options={feedstockQuestion.options}
          selected={feedstock}
          onChange={(val) => onChange({ ...data, feedstock: val })}
        />
      )}

      <QuestionWithRadio
        label="Is your fuel classified as RFNBO?"
        checked={isRFNBO}
        onCheck={(val) => onChange({ ...data, isRFNBO: val })}
      />
    </>
  );
};

export default ENGFields;
