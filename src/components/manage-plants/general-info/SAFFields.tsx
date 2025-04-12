'use client';
import React from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithSelect from '../common/QuestionWithSelect';
import QuestionWithRadio from '../common/QuestionWithRadio';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';

interface SAFData {
  answers: string[];
  feedstock: string[];
  isGasInjected: boolean | null;
  isSAFBlended: boolean | null;
  isRFNBO: boolean | null;
}

interface Props {
  data: Partial<SAFData>;
  onChange: (updated: Partial<SAFData>) => void;
}

const SAFFields: React.FC<Props> = ({ data, onChange }) => {
  const questions = fuelConfigurations.saf;

  const feedstockQuestion = questions.find(q => q.label === 'What is the feedstock used?');
  const mainQuestions = questions.filter(q => q.label !== 'What is the feedstock used?');

  const answers: string[] = data.answers ?? Array(mainQuestions.length).fill('');
  const feedstock = data.feedstock ?? [];
  const isGasInjected = data.isGasInjected ?? null;
  const isSAFBlended = data.isSAFBlended ?? null;
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
        label="Is the gas injected into the grid or transported separately?"
        checked={isGasInjected}
        onCheck={(val) => onChange({ ...data, isGasInjected: val })}
      />

      <QuestionWithRadio
        label="Is the SAF blended with fossil jet fuel?"
        checked={isSAFBlended}
        onCheck={(val) => onChange({ ...data, isSAFBlended: val })}
      />

      <QuestionWithRadio
        label="Is your fuel classified as RFNBO?"
        checked={isRFNBO}
        onCheck={(val) => onChange({ ...data, isRFNBO: val })}
      />
    </>
  );
};

export default SAFFields;
