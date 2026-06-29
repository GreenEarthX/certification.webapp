'use client';
import React from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithSelect from '../common/QuestionWithSelect';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
import QuestionWithRadio from '../common/QuestionWithRadio';

interface ENGData {
  productionMethod: string;
  feedstock: string[];
  isRFNBO: boolean | null;
}

interface Props {
  data: Partial<ENGData>;
  onChange: (updated: Partial<ENGData>) => void;
}

const ENGFields: React.FC<Props> = ({ data, onChange }) => {
  const config = fuelConfigurations.eng;

  const methodQuestion = config.find(q => q.label === 'Method of production');
  const feedstockQuestion = config.find(q => q.label === 'What is the feedstock used?');

  const productionMethod = data.productionMethod ?? '';
  const feedstock = data.feedstock ?? [];
  const isRFNBO = data.isRFNBO ?? null;

  const handleMethodChange = (value: string) => {
    onChange({ ...data, productionMethod: value });
  };

  const handleFeedstockChange = (val: string[]) => {
    onChange({ ...data, feedstock: val });
  };

  const handleRFNBOChange = (val: boolean) => {
    onChange({ ...data, isRFNBO: val });
  };

  return (
    <>
      {/* Method of production */}
      {methodQuestion && (
        <QuestionWithSelect
          question={methodQuestion}
          value={productionMethod}
          onChange={handleMethodChange}
        />
      )}

    </>
  );
};

export default ENGFields;
