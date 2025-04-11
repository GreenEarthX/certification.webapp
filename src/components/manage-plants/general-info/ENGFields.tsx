'use client';
import React, { useState } from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithSelect from '../common/QuestionWithSelect';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import QuestionWithRadio from '../common/QuestionWithRadio';

const ENGFields: React.FC = () => {
  const questions = fuelConfigurations.eng;

  const feedstockQuestion = questions.find(q => q.label === 'What is the feedstock used?');
  const mainQuestions = questions.filter(q => q.label !== 'What is the feedstock used?');

  const [answers, setAnswers] = useState<string[]>(Array(mainQuestions.length).fill(''));
  const [feedstock, setFeedstock] = useState<string[]>([]); // <-- changed to array
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
              label="Is your fuel classified as RFNBO?"
              checked={isRFNBO}
              onCheck={setIsRFNBO}
      />
    </>
  );
};

export default ENGFields;
