'use client';
import React, { useState } from 'react';
import HydrogenFields from '@/components/manage-plants/general-info/HydrogenFields';
import AmmoniaFields from '@/components/manage-plants/general-info/AmmoniaFields';
import ENGFields from '@/components/manage-plants/general-info/ENGFields';
import SAFFields from '@/components/manage-plants/general-info/SAFFields';
import BiofuelFields from '@/components/manage-plants/general-info/BiofuelFields';
import MethanolFields from '@/components/manage-plants/general-info/MethanolFields';
import ElectricityStep from '@/components/manage-plants/electricity-generation/ElectricityStep';
import GHGReductionStep from '@/components/manage-plants/ghg-reduction/GHGReductionStep';
import TraceabilityStep from '@/components/manage-plants/traceability/TraceabilityStep';
import OffTakersStep from '@/components/manage-plants/off-takers/OffTakersStep';
import CertificationStep from '@/components/manage-plants/certification-preferences/CertificationStep';

const steps = [
  'General informations',
  'Electricity Generation',
  'GHG Reduction & Carbon Footprint (PCF)',
  'Traceability &Chain Custody',
  'Off-Takers & Market Positioning',
  'Certification Preferences'
];

export default function PlantDetailsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fuelType, setFuelType] = useState('');

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const StepContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
      <h2 className="text-lg font-semibold text-blue-900 mb-2">{title}</h2>
      <div className="bg-white shadow rounded-lg p-6">{children}</div>
    </div>
  );

  return (
    <div className="w-full p-8  min-h-screen">
      {/* Steps navigation */}
      <div className="flex justify-between items-center border-b-2 pb-4 mb-8 relative">
        <div className="absolute top-[5px] left-[6%] right-[7%] h-[1px] bg-gray-400 z-0"></div>
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center cursor-pointer z-10" onClick={() => handleStepClick(index)}>
            <div className={`w-3 h-3 rounded-full ${currentStep === index ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
            <span className={`text-xs mt-2 text-center ${currentStep === index ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>{step}</span>
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      {currentStep === 0 && (
        <StepContainer title={steps[0]}>
          <div className="flex items-center mb-4">
            <label className="block accent-blue-600 mr-4 font-medium whitespace-nowrap">
              What type of fuel does your plant produce?
            </label>
            <select
              className="border rounded-md px-3 py-1.5 outline-none bg-white shadow-sm text-sm flex-1"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
            >
              <option value="" disabled>Select</option>
              <option value="hydrogen">Hydrogen</option>
              <option value="ammonia">Ammonia</option>
              <option value="saf">Sustainable Aviation Fuel (SAF)</option>
              <option value="methanol">Methanol</option>
              <option value="eng">e-NG</option>
              <option value="biofuels">Biofuels</option>
            </select>
          </div>
          {fuelType === 'hydrogen' && <HydrogenFields />}
          {fuelType === 'ammonia' && <AmmoniaFields />}
          {fuelType === 'eng' && <ENGFields />}
          {fuelType === 'saf' && <SAFFields />}
          {fuelType === 'biofuels' && <BiofuelFields />}
          {fuelType === 'methanol' && <MethanolFields />}
        </StepContainer>
      )}

      {currentStep === 1 && (
        <StepContainer title={steps[1]}>
          <ElectricityStep />
        </StepContainer>
      )}

      {currentStep === 2 && (
        <StepContainer title={steps[2]}>
          <GHGReductionStep />
        </StepContainer>
      )}

      {currentStep === 3 && (
        <StepContainer title={steps[3]}>
          <TraceabilityStep />
        </StepContainer>
      )}

      {currentStep === 4 && (
        <StepContainer title={steps[4]}>
          <OffTakersStep />
        </StepContainer>
      )}

      {currentStep === 5 && (
        <StepContainer title={steps[5]}>
          <CertificationStep />
        </StepContainer>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <div>
          {currentStep > 0 && (
            <button
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md shadow hover:bg-blue-200"
              onClick={prevStep}
            >
              Back
            </button>
          )}
        </div>
        <div>
          {currentStep < steps.length - 1 ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
              onClick={nextStep}
            >
              Next
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
              onClick={() => alert('Finished!')}
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
