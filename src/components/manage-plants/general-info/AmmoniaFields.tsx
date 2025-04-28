'use client';
import React, { useEffect, useState } from 'react';
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

  const [usesHaberBosch, setUsesHaberBosch] = useState(data.usesHaberBosch ?? null);
  const [usesCCUS, setUsesCCUS] = useState(data.usesCCUS ?? false);
  const [ccusPercentage, setCcusPercentage] = useState(data.ccusPercentage ?? '');
  const [alternativeMethod, setAlternativeMethod] = useState(data.alternativeMethod ?? '');
  const [feedstock, setFeedstock] = useState(data.feedstock ?? []);
  const [isRFNBO, setIsRFNBO] = useState(data.isRFNBO ?? null);

  useEffect(() => {
    setUsesHaberBosch(data.usesHaberBosch ?? null);
    setUsesCCUS(data.usesCCUS ?? false);
    setCcusPercentage(data.ccusPercentage ?? '');
    setAlternativeMethod(data.alternativeMethod ?? '');
    setFeedstock(data.feedstock ?? []);
    setIsRFNBO(data.isRFNBO ?? null);
  }, [data]);

  const handleCcusBlur = () => {
    onChange({ ...data, ccusPercentage });
  };

  const handleAlternativeMethodBlur = () => {
    onChange({ ...data, alternativeMethod });
  };

  const handleHaberBoschToggle = (val: boolean) => {
    setUsesHaberBosch(val);
    const reset = val === false ? { usesCCUS: false, ccusPercentage: '' } : {};
    onChange({ ...data, usesHaberBosch: val, ...reset });
  };

  return (
    <>
      {/* 1. Haber-Bosch */}
      <QuestionWithRadio
        label="Do you use Hober-Bosch process ?"
        checked={usesHaberBosch}
        onCheck={handleHaberBoschToggle}
      />

      {/* 2. CCUS if yes */}
      {usesHaberBosch === true && (
        <div className="ml-20">
          <QuestionWithRadioAndInput
            label="Do you use Carbon Capture Storage Utilization ?"
            checked={usesCCUS}
            percentage={ccusPercentage}
            onCheck={(val) => {
              setUsesCCUS(val);
              onChange({ ...data, usesCCUS: val });
            }}
            onPercentageChange={(val) => setCcusPercentage(val)}
            onPercentageBlur={handleCcusBlur}
          />
        </div>
      )}

      {/* 3. Alternative method if no */}
      {usesHaberBosch === false && (
        <QuestionWithInput
          label="Write down the method used :"
          value={alternativeMethod}
          onChange={(val) => setAlternativeMethod(val)}
          onBlur={handleAlternativeMethodBlur}
        />
      )}

      {/* 4. Feedstock */}
      {feedstockQuestion && (
        <QuestionWithMultiSelect
          label={feedstockQuestion.label}
          options={feedstockQuestion.options}
          selected={feedstock}
          onChange={(val) => {
            setFeedstock(val);
            onChange({ ...data, feedstock: val });
          }}
        />
      )}

      {/* 5. RFNBO */}
      <QuestionWithRadio
        label="Is your fuel classified as RFNBO?"
        checked={isRFNBO}
        onCheck={(val) => {
          setIsRFNBO(val);
          onChange({ ...data, isRFNBO: val });
        }}
      />
    </>
  );
};

export default AmmoniaFields;
