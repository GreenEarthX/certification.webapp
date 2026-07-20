'use client';

import React, { useState, useEffect } from 'react';
import { produce } from 'immer';

// Field step components by category
import ElectricityStep from '@/components/plant-operator/manage-plants-indian/electricity-generation/ElectricityStep';
import WaterStep from '@/components/plant-operator/manage-plants-indian/electricity-generation/WaterStep';
import GHGReductionStep from '@/components/plant-operator/manage-plants-indian/ghg-reduction/GHGReductionStep';
import TraceabilityStep from '@/components/plant-operator/manage-plants-indian/traceability/TraceabilityStep';
import CertificationStep from '@/components/plant-operator/manage-plants-indian/certification-preferences/CertificationStep';
import StepNotice from '@/components/plant-operator/manage-plants-indian/common/StepNotice';
import FacilityDropdown from '@/components/plant-operator/plant-dashboard/FacilityDropdown';

// Hook
import { usePlantDetails } from '@/hooks/managePlants/usePlantDetails';

// Renderer
import SchemaFormRenderer from '@/components/plant-operator/manage-plants-json/SchemaFormRenderer';

// JSON-based schema imports
//import generalInfoSchema from './schemas/general-info.json';
//import facilityInfoSchema from './schemas/facility-info.json';
//import marketPositioningSchema from './schemas/market-positioning.json';

// Types for internal data structures
interface Plant {
  id: number;
  name: string;
  type: string;
  address: string;
  riskScore: number;
  fuel_id: number;
}

interface ElectricitySource {
  type: string;
  details: any;
  file: File | null;
  uri?: string; 
}

interface ElectricityData {
  plant_id?: number;
  energyMix: { type: string; percent: string }[];
  sources: ElectricitySource[];
}

interface WaterData {
  waterConsumption: string;
  waterSources: string[];
  trackWaterUsage: boolean | null;
  treatmentLocation: { [source: string]: string[] };  
  monitoringFile?: File | null;
}

interface FormDataType {
  generalInfo: any;
  hydrogen: any;
  ammonia: any;
  biofuels: any;
  saf: any;
  eng: any;
  methanol: any;
  electricity: ElectricityData;
  water: WaterData;
  ghg: any;
  traceability: any;
  offtakers: any;
  certifications: any;
}


// Step labels for progress tracker
const steps = [
  'General information',
  'Off -Takers & Market positioning',
  'Electricity  & Water Consumption',
  'GHG Reduction & Carbon Footprint',
  'Traceability & Chain of Custody',
  'Preferences'
];


export default function PlantDetailsPage() { 
  const [currentStep, setCurrentStep] = useState(0);
  
  // Custom hook for managing plant and form state
  const {
    plants,
    selectedPlantId,
    selectedPlant,
    setSelectedPlantId,
    fuelType,
    setFuelType,
    formData,
    setFormData,
    saving,
    lastSaved,
    router
  } = usePlantDetails();

  const [schemas, setSchemas] = useState<any | null>(null);

  useEffect(() => {
    const fetchSchemas = async () => {
      try {
        const res = await fetch('/api/manage-plants/schemas');
        const data = await res.json();
        setSchemas(data);
      } catch (err) {
        console.error('Failed to fetch schemas:', err);
      }
    };

    fetchSchemas();
  }, []);
  

  // Automatically update the `mainProduct` when `fuelType` changes
  useEffect(() => {
  if (!fuelType || !selectedPlant) return;

    setFormData(prev =>
      produce(prev, (draft: any) => {
        if (!draft.generalInfo) draft.generalInfo = {};
        if (!draft.generalInfo.technology) draft.generalInfo.technology = {};
        draft.generalInfo.technology.mainProduct = fuelType;
      })
    );
  }, [fuelType, selectedPlant]);
  
  
  // Step navigation logic
  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };
  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Step wrappers
  const StepContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
      <StepNotice />
      <h2 className="text-lg font-semibold text-blue-900 mb-2">{title}</h2>
      <div className="bg-white shadow rounded-lg p-6">{children}</div>
    </div>
  );

  const StepContainerNoNotice: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
      <h2 className="text-lg font-semibold text-blue-900 mb-2">{title}</h2>
      <div className="bg-white shadow rounded-lg p-6">{children}</div>
    </div>
  );

  const StepContainersplited: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
      <StepNotice />
      <h2 className="text-lg font-semibold text-blue-900 mb-2">{title}</h2>
      {children}
    </div>
  );


  // Final submission logic — adds file preview and routes forward
  const handleFinish = () => {
    const filePreview = (file: File | null, uri?: string) =>
      file
        ? {
            name: file.name,
            uri: uri ?? `https://example.com/uploads/${encodeURIComponent(file.name)}`,
            type: file.type
          }
        : null;
    
  
    const previewFormData = {
      ...formData,
      electricity: {
        plant_id: selectedPlantId,
        energyMix: formData.electricity.energyMix,
        sources: formData.electricity.sources.map((src) => ({
          type: src.type,
          file: filePreview(src.file, src.uri),
          details: Object.fromEntries(
            Object.entries(src.details || {}).map(([k, v]: [string, any]) => [
              k,
              v instanceof File ? filePreview(v) : v
            ])
          )
        }))
      }
    };
  
    console.log('📦 Full form data with file info:\n', JSON.stringify(previewFormData, null, 2));
    router.push('/plant-operator/manage-plants/loading');
  };

  
  
  return (
    <form className="w-full p-8 min-h-screen" autoComplete="off">
      <div className="flex justify-between items-center p-4 rounded-lg">
      {/* Header: Plant Selector and Save Status */}
      <FacilityDropdown
        selectedPlant={selectedPlantId !== null ? String(selectedPlantId) : ''}
        onChange={(e) => {
          const newId = Number(e.target.value);
          setSelectedPlantId(newId);
          router.push(`/plant-operator/manage-plants-json?selected=${newId}`);
        }}
      />
      <div className="text-sm text-gray-500 ml-4">
          {saving ? (
            <span className="text-blue-500 animate-pulse">Saving...</span>
          ) : lastSaved ? (
            <span
              className="text-green-600 flex items-center gap-1"
              title={`Last saved at ${new Date(lastSaved).toLocaleTimeString()}`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Saved
            </span>
          ) : null}
        </div>

      </div>

      <br />

      {/* Step Progress Bar */}
      <div className="flex justify-between items-center pb-4 mb-8 relative">
        <div className="absolute top-[5px] left-[6%] right-[3%] h-[1px] bg-gray-400 z-0"></div>
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center cursor-pointer z-10" onClick={() => handleStepClick(index)}>
            <div className={`w-3 h-3 rounded-full ${currentStep === index ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
            <span className={`text-xs mt-2 text-center ${currentStep === index ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>{step}</span>
          </div>
        ))}
      </div>

 
      {/* Step Content Rendering */}
      {currentStep === 0 && schemas?.section_general_info && (
        <div>
          <StepNotice />
          <h2 className="text-lg font-semibold text-blue-900 mb-2">{steps[0]}</h2>
          <br/>
          <SchemaFormRenderer
            schema={schemas.section_general_info}
            formData={formData}
            onChange={setFormData}
          />
        </div>
      )}

      {currentStep === 1 && schemas?.section_market_and_offtakers && (
        <div>
          <StepNotice />
          <h2 className="text-lg font-semibold text-blue-900 mb-2">{steps[1]}</h2>
          <br/>
          <SchemaFormRenderer
            schema={schemas.section_market_and_offtakers}
            formData={formData}
            onChange={setFormData}
          />
        </div>
      )}


      {currentStep === 2 && (
        <div>
            <StepNotice />
          <h2 className="text-lg font-semibold text-blue-900 mb-2">{steps[2]}</h2>
          <br/>
            <ElectricityStep
              data={formData.electricity}
              onChange={(key, value) =>
                setFormData((prev) => ({
                  ...prev,
                  electricity: {
                    ...prev.electricity,
                    [key]: value,
                  },
                }))
              }
            />
          
          <br />
          <div>
          <h3 className="text-md font-semibold text-gray-800 mb-4"> Water Consumption</h3>
          <StepContainerNoNotice title={""}>
            <WaterStep
  data={formData.water}
  onChange={(updated: WaterData) =>
    setFormData((prev) => ({
      ...prev,
      water: {
        ...prev.water,
        ...updated, // ensure merging rather than replacing
      },
    }))
  }
/>

          </StepContainerNoNotice>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div>
        <StepNotice />
        <h2 className="text-lg font-semibold text-blue-900 mb-2">{steps[3]}</h2>
        <br/>
          <GHGReductionStep data={formData.ghg} onChange={(updated) => setFormData(prev => ({ ...prev, ghg: updated }))} />
        </div>
      )}

      {currentStep === 4 && (
        <div>
          <StepNotice />
          <h2 className="text-lg font-semibold text-blue-900 mb-2">{steps[4]}</h2>
          <br/>
          <TraceabilityStep data={formData.traceability} onChange={(updated) => setFormData(prev => ({ ...prev, traceability: updated }))} />
        </div>
      )}

      {currentStep === 5 && (
        <StepContainersplited title={steps[5]}>
          <CertificationStep data={formData.certifications} onChange={(updated) => setFormData(prev => ({ ...prev, certifications: updated }))} />
        </StepContainersplited>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <div>
          {currentStep > 0 && (
            <button
              type="button" 
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
              type="button" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
              onClick={nextStep}
            >
              Next
            </button>
          
          ) : (
            
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
                  onClick={handleFinish}
                >
                  Finish
                </button>
          )}
        </div>
      </div>
    </form>
  );
}
