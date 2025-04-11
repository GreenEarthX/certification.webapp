'use client';
import React, { useState } from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithSelect from '../common/QuestionWithSelect';
import QuestionWithRadio from '../common/QuestionWithRadio';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';

const SAFFields = () => {
  const questions = fuelConfigurations.saf;

  const feedstockQuestion = questions.find(q => q.label === 'What is the feedstock used?');
  const mainQuestions = questions.filter(q => q.label !== 'What is the feedstock used?');

  const [answers, setAnswers] = useState<string[]>(Array(mainQuestions.length).fill(''));
  const [feedstock, setFeedstock] = useState<string[]>([]);

  const [isGasInjected, setIsGasInjected] = useState<boolean | null>(null);
  const [isSAFBlended, setIsSAFBlended] = useState<boolean | null>(null);
  const [isRFNBO, setIsRFNBO] = useState<boolean | null>(null);

  const handleChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
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
          onChange={setFeedstock}
        />
      )}

      <QuestionWithRadio
        label="Is the gas injected into the grid or transported separately ?"
        checked={isGasInjected}
        onCheck={setIsGasInjected}
      />

      <QuestionWithRadio
        label="Is the SAF blended with fossil jet fuel?"
        checked={isSAFBlended}
        onCheck={setIsSAFBlended}
      />

      <QuestionWithRadio
              label="Is your fuel classified as RFNBO?"
              checked={isRFNBO}
              onCheck={setIsRFNBO}
      />
    </>
  );
};

export default SAFFields;
