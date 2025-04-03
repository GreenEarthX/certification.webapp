'use client';
import React, { useState } from 'react';
import QuestionWithRadio from './QuestionWithRadio';
import QuestionWithRadioAndInput from './QuestionWithRadioAndInput';
import QuestionWithInput from './QuestionWithInput';
import QuestionWithMultiSelect from './MultiSelectDropdown';
import { fuelConfigurations } from '@/utils/fuelConfigurations';

const AmmoniaFields: React.FC = () => {
  const [usesHaberBosch, setUsesHaberBosch] = useState<boolean | null>(null);
  const [usesCCUS, setUsesCCUS] = useState(false);
  const [ccusPercentage, setCcusPercentage] = useState('');
  const [otherMethod, setOtherMethod] = useState('');
  const [feedstock, setFeedstock] = useState<string[]>([]);

  const ammoniaQuestions = fuelConfigurations.ammonia;
  const feedstockQuestion = ammoniaQuestions.find(q => q.label === 'What is the feedstock used?');

  return (
    <>
      {/* 1. Hober-Bosch */}
      <QuestionWithRadio
        label="Do you use Hober-Bosch process ?"
        checked={usesHaberBosch}
        onCheck={(val) => {
          setUsesHaberBosch(val);
          if (!val) {
            setUsesCCUS(false);
            setCcusPercentage('');
          }
        }}
      />

      {/* 2. CCUS if yes */}
      {usesHaberBosch === true && (
        <QuestionWithRadioAndInput
          label="Do you use Carbon Capture Storage Utilization ?"
          checked={usesCCUS}
          percentage={ccusPercentage}
          onCheck={setUsesCCUS}
          onPercentageChange={setCcusPercentage}
        />
      )}

      {/* 3. Input method if Hober-Bosch not used */}
      {usesHaberBosch === false && (
        <QuestionWithInput
          label="Write down the method used :"
          value={otherMethod}
          onChange={setOtherMethod}
        />
      )}

      {/* 4. Feedstock (multi-select) */}
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

export default AmmoniaFields;
