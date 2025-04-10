'use client';
import React, { useState } from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithSelect from '../common/QuestionWithSelect';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';

const ENGFields: React.FC = () => {
  const questions = fuelConfigurations.eng;

  const feedstockQuestion = questions.find(q => q.label === 'What is the feedstock used?');
  const mainQuestions = questions.filter(q => q.label !== 'What is the feedstock used?');

  const [answers, setAnswers] = useState<string[]>(Array(mainQuestions.length).fill(''));
  const [feedstock, setFeedstock] = useState<string[]>([]); // <-- changed to array

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
    </>
  );
};

export default ENGFields;
