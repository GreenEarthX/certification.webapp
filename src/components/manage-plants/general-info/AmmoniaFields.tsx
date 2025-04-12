'use client';
import React from 'react';
import QuestionWithRadio from '../common/QuestionWithRadio';
import QuestionWithRadioAndInput from '../common/QuestionWithRadioAndInput';
import QuestionWithInput from '../common/QuestionWithInput';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import { fuelConfigurations } from '@/utils/fuelConfigurations';

interface Props {
  data: any;
  onChange: (updated: any) => void;
}

const AmmoniaFields: React.FC<Props> = ({ data, onChange }) => {
  const ammoniaQuestions = fuelConfigurations.ammonia;
  const feedstockQuestion = ammoniaQuestions.find(q => q.label === 'What is the feedstock used?');

  const usesHaberBosch = data.usesHaberBosch ?? null;
  const usesCCUS = data.usesCCUS ?? false;
  const ccusPercentage = data.ccusPercentage ?? '';
  const otherMethod = data.otherMethod ?? '';
  const feedstock = data.feedstock ?? [];
  const isRFNBO = data.isRFNBO ?? null;

  return (
    <>
      {/* 1. Hober-Bosch */}
      <QuestionWithRadio
        label="Do you use Hober-Bosch process ?"
        checked={usesHaberBosch}
        onCheck={(val) => {
          const reset = val === false ? { usesCCUS: false, ccusPercentage: '' } : {};
          onChange({ ...data, usesHaberBosch: val, ...reset });
        }}
      />

      {/* 2. CCUS if yes */}
      {usesHaberBosch === true && (
        <div className="ml-20">
          <QuestionWithRadioAndInput
            label="Do you use Carbon Capture Storage Utilization ?"
            checked={usesCCUS}
            percentage={ccusPercentage}
            onCheck={(val) => onChange({ ...data, usesCCUS: val })}
            onPercentageChange={(val) => onChange({ ...data, ccusPercentage: val })}
          />
        </div>
      )}

      {/* 3. Input method if Hober-Bosch not used */}
      {usesHaberBosch === false && (
        <QuestionWithInput
          label="Write down the method used :"
          value={otherMethod}
          onChange={(val) => onChange({ ...data, otherMethod: val })}
        />
      )}

      {/* 4. Feedstock (multi-select) */}
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

export default AmmoniaFields;
