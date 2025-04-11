'use client';
import React, { useState } from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithSelect from '../common/QuestionWithSelect';
import QuestionWithRadioAndInput from '../common/QuestionWithRadioAndInput';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import QuestionWithRadio from '../common/QuestionWithRadio';

const HydrogenFields = () => {
  const questions = fuelConfigurations.hydrogen;

  const feedstockQuestion = questions.find(q => q.label === 'What is the feedstock used?');
  const mainQuestions = questions.filter(q => q.label !== 'What is the feedstock used?');

  const [answers, setAnswers] = useState<string[]>(Array(mainQuestions.length).fill(''));
  const [electrolysis, setElectrolysis] = useState('');
  const [showElectrolysis, setShowElectrolysis] = useState(false);
  const [showCCUS, setShowCCUS] = useState(false);
  const [ccusUsed, setCcusUsed] = useState(false);
  const [ccusPercentage, setCcusPercentage] = useState('');
  const [feedstock, setFeedstock] = useState<string[]>([]);
  const [isRFNBO, setIsRFNBO] = useState<boolean | null>(null);


  const handleChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);

    if (index === 0) {
      setShowElectrolysis(value === 'Electrolysis');

      const methodsThatNeedCCUS = [
        'Steam Methane Reforming',
        'Biomass gasification',
        'Coal gasification'
      ];
      setShowCCUS(methodsThatNeedCCUS.includes(value));
    }
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

      {showElectrolysis && (
        <div className="ml-20">
        <QuestionWithSelect
          question={{ label: 'Electrolysis', options: ['PEM', 'Alkaline', 'SOEC'] }}
          value={electrolysis}
          onChange={setElectrolysis}
        />
        </div>
      )}

      {showCCUS && (
        <div className="ml-20">
        <QuestionWithRadioAndInput
          label="Do you use Carbon Capture Storage Utilization?"
          checked={ccusUsed}
          percentage={ccusPercentage}
          onCheck={setCcusUsed}
          onPercentageChange={setCcusPercentage}
        />
        </div>
      )}

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

export default HydrogenFields;