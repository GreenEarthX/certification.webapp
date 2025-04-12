'use client';
import React, { useState } from 'react';
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

  const answers = data.answers || Array(mainQuestions.length).fill('');
  const electrolysis = data.electrolysis || '';
  const ccusUsed = data.ccusUsed || false;
  const ccusPercentage = data.ccusPercentage || '';
  const feedstock = data.feedstock || [];
  const isRFNBO = data.isRFNBO ?? null;

  const showElectrolysis = answers[0] === 'Electrolysis';
  const showCCUS = ['Steam Methane Reforming', 'Biomass gasification', 'Coal gasification'].includes(answers[0]);

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

      {showElectrolysis && (
        <div className="ml-20">
          <QuestionWithSelect
            question={{ label: 'Technology used:', options: ['PEM', 'Alkaline', 'SOEC'] }}
            value={electrolysis}
            onChange={(val) => onChange({ ...data, electrolysis: val })}
          />
        </div>
      )}

      {showCCUS && (
        <div className="ml-20">
          <QuestionWithRadioAndInput
            label="Do you use Carbon Capture Storage Utilization?"
            checked={ccusUsed}
            percentage={ccusPercentage}
            onCheck={(val) => onChange({ ...data, ccusUsed: val })}
            onPercentageChange={(val) => onChange({ ...data, ccusPercentage: val })}
          />
        </div>
      )}

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

export default HydrogenFields;
