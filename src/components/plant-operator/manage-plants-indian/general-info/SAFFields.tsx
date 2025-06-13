'use client';
import React from 'react';
import { fuelConfigurations } from '@/utils/fuelConfigurations';
import QuestionWithSelect from '../common/QuestionWithSelect';
import QuestionWithRadio from '../common/QuestionWithRadio';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';

interface SAFData {
  productionMethod: string;
  feedstock: string[];
  isGasInjected: boolean | null;
  isSAFBlended: boolean | null;
  isRFNBO: boolean | null;
}

interface Props {
  data: Partial<SAFData>;
  onChange: (updated: Partial<SAFData>) => void;
}

const SAFFields: React.FC<Props> = ({ data, onChange }) => {
  const questions = fuelConfigurations.saf;

  const productionQuestion = questions.find(q => q.label === 'Method of production');
  const feedstockQuestion = questions.find(q => q.label === 'What is the feedstock used?');

  const productionMethod = data.productionMethod ?? '';
  const feedstock = data.feedstock ?? [];
  const isGasInjected = data.isGasInjected ?? null;
  const isSAFBlended = data.isSAFBlended ?? null;
  const isRFNBO = data.isRFNBO ?? null;

  return (
    <>
      {/* Production method (e.g. PtL, HEFA, FT Synthesis...) */}
      {productionQuestion && (
        <QuestionWithSelect
          question={productionQuestion}
          value={productionMethod}
          onChange={(val) => onChange({ ...data, productionMethod: val })}
        />
      )}

      
    </>
  );
};

export default SAFFields;
