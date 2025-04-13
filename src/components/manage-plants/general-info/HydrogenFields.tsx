'use client';
import React, { useEffect, useState } from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithSelect from '../common/QuestionWithSelect';
import QuestionWithRadioAndInput from '../common/QuestionWithRadioAndInput';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface Props {
  data: any;
  onChange: (updated: any) => void;
}

const HydrogenFields: React.FC<Props> = ({ data, onChange }) => {
  const questions = fuelConfigurations.hydrogen;

  const feedstockQuestion = questions.find(q => q.label === 'What is the feedstock used?');
  const mainQuestions = questions.filter(q => q.label !== 'What is the feedstock used?');

  const [answers, setAnswers] = useState(data.answers || Array(mainQuestions.length).fill(''));
  const [electrolysis, setElectrolysis] = useState(data.electrolysis || '');
  const [ccusUsed, setCcusUsed] = useState(data.ccusUsed || false);
  const [ccusPercentage, setCcusPercentage] = useState(data.ccusPercentage || '');
  const [feedstock, setFeedstock] = useState(data.feedstock || []);
  const [isRFNBO, setIsRFNBO] = useState(data.isRFNBO ?? null);

  useEffect(() => {
    setAnswers(data.answers || Array(mainQuestions.length).fill(''));
    setElectrolysis(data.electrolysis || '');
    setCcusUsed(data.ccusUsed || false);
    setCcusPercentage(data.ccusPercentage || '');
    setFeedstock(data.feedstock || []);
    setIsRFNBO(data.isRFNBO ?? null);
  }, [data]);

  const handleChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
    onChange({ ...data, answers: updated });
  };

  const handleElectrolysisChange = (value: string) => {
    setElectrolysis(value);
    onChange({ ...data, electrolysis: value });
  };

  const handleCCUSCheck = (val: boolean) => {
    setCcusUsed(val);
    onChange({ ...data, ccusUsed: val });
  };

  const handleCCUSPercentageBlur = () => {
    onChange({ ...data, ccusPercentage });
  };

  const handleFeedstockChange = (val: string[]) => {
    setFeedstock(val);
    onChange({ ...data, feedstock: val });
  };

  const handleRFNBOChange = (val: boolean) => {
    setIsRFNBO(val);
    onChange({ ...data, isRFNBO: val });
  };

  const showElectrolysis = answers[0] === 'Electrolysis';
  const showCCUS = ['Steam Methane Reforming', 'Biomass gasification', 'Coal gasification'].includes(answers[0]);

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
            question={{ label: 'Technology used:', options: ['PEM', 'Alkaline', 'SOEC'] }}
            value={electrolysis}
            onChange={handleElectrolysisChange}
          />
        </div>
      )}

      {showCCUS && (
        <div className="ml-20">
          <QuestionWithRadioAndInput
            label="Do you use Carbon Capture Storage Utilization?"
            checked={ccusUsed}
            percentage={ccusPercentage}
            onCheck={handleCCUSCheck}
            onPercentageChange={(val) => setCcusPercentage(val)}
            onPercentageBlur={handleCCUSPercentageBlur} // ✅ trigger sync on blur
          />
        </div>
      )}

      {feedstockQuestion && (
        <QuestionWithMultiSelect
          label={feedstockQuestion.label}
          options={feedstockQuestion.options}
          selected={feedstock}
          onChange={handleFeedstockChange}
        />
      )}

      <QuestionWithRadio
        label="Is your fuel classified as RFNBO?"
        checked={isRFNBO}
        onCheck={handleRFNBOChange}
      />
    </>
  );
};

export default HydrogenFields;
