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
  const productionOptions = questions.find(q => q.label === 'Method of production')?.options || [];

  const [productionMethod, setProductionMethod] = useState<string>(data.productionMethod || '');
  const [electrolysisTechnology, setElectrolysisTechnology] = useState<string>(data.electrolysisTechnology || '');
  const [usesCCUS, setUsesCCUS] = useState<boolean>(data.usesCCUS || false);
  const [ccusPercentage, setCcusPercentage] = useState<string>(data.ccusPercentage || '');
  const [feedstock, setFeedstock] = useState<string[]>(data.feedstock || []);
  const [isRFNBO, setIsRFNBO] = useState<boolean>(data.isRFNBO ?? null);

  useEffect(() => {
    setProductionMethod(data.productionMethod || '');
    setElectrolysisTechnology(data.electrolysisTechnology || '');
    setUsesCCUS(data.usesCCUS || false);
    setCcusPercentage(data.ccusPercentage || '');
    setFeedstock(data.feedstock || []);
    setIsRFNBO(data.isRFNBO ?? null);
  }, [data]);

  const handleProductionChange = (value: string) => {
    setProductionMethod(value);
    // Reset dependent fields when production method changes
    const update: any = {
      productionMethod: value,
      electrolysisTechnology: '',
      usesCCUS: false,
      ccusPercentage: '',
    };
    onChange({ ...data, ...update });
  };

  const handleElectrolysisChange = (value: string) => {
    setElectrolysisTechnology(value);
    onChange({ ...data, electrolysisTechnology: value });
  };

  const handleCCUSCheck = (val: boolean) => {
    setUsesCCUS(val);
    onChange({ ...data, usesCCUS: val });
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

  const showElectrolysis = productionMethod === 'Electrolysis';
  const showCCUS = ['Steam Methane Reforming', 'Biomass gasification', 'Coal gasification'].includes(productionMethod);

  return (
    <>
      <QuestionWithSelect
        question={{ label: 'Method of production', options: productionOptions }}
        value={productionMethod}
        onChange={handleProductionChange}
      />

      {showElectrolysis && (
        <div className="ml-20">
          <QuestionWithSelect
            question={{ label: 'Technology used:', options: ['PEM', 'Alkaline', 'SOEC'] }}
            value={electrolysisTechnology}
            onChange={handleElectrolysisChange}
          />
        </div>
      )}

      {showCCUS && (
        <div className="ml-20">
          <QuestionWithRadioAndInput
            label="Do you use Carbon Capture Storage Utilization?"
            checked={usesCCUS}
            percentage={ccusPercentage}
            onCheck={handleCCUSCheck}
            onPercentageChange={(val) => setCcusPercentage(val)}
            onPercentageBlur={handleCCUSPercentageBlur}
          />
        </div>
      )}

    </>
  );
};

export default HydrogenFields;
