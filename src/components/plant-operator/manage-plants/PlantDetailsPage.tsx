'use client';
import React, { useState } from 'react';
import HydrogenFields from '@/components/plant-operator/manage-plants/general-info/HydrogenFields';
import AmmoniaFields from '@/components/plant-operator/manage-plants/general-info/AmmoniaFields';
import ENGFields from '@/components/plant-operator/manage-plants/general-info/ENGFields';
import SAFFields from '@/components/plant-operator/manage-plants/general-info/SAFFields';
import BiofuelFields from '@/components/plant-operator/manage-plants/general-info/BiofuelFields';
import MethanolFields from '@/components/plant-operator/manage-plants/general-info/MethanolFields';
import ElectricityStep from '@/components/plant-operator/manage-plants/electricity-generation/ElectricityStep';
import WaterStep from '@/components/plant-operator/manage-plants/electricity-generation/WaterStep';
import GHGReductionStep from '@/components/plant-operator/manage-plants/ghg-reduction/GHGReductionStep';
import TraceabilityStep from '@/components/plant-operator/manage-plants/traceability/TraceabilityStep';
import OffTakersStep from '@/components/plant-operator/manage-plants/off-takers/OffTakersStep';
import CertificationStep from '@/components/plant-operator/manage-plants/certification-preferences/CertificationStep';
import StepNotice from '@/components/plant-operator/manage-plants/common/StepNotice';
import FacilityDropdown from '@/components/plant-operator/plant-dashboard/FacilityDropdown';
import { usePlantDetails } from '@/hooks/managePlants/usePlantDetails';



interface Plant {
  id: number;
  name: string;
  type: string;
  address: string;
  riskScore: number;
  fuel_id: number;
}

const steps = [
  'General informations',
  'Electricity Generation & Water Consumption',
  'GHG Reduction & Carbon Footprint (PCF)',
  'Traceability & Chain Custody',
  'Off-Takers & Market Positioning',
  'Certification Preferences'
];


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
  treatmentLocation: { [source: string]: string[]; };
}

interface FormDataType {
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

export default function PlantDetailsPage() { 
  const [currentStep, setCurrentStep] = useState(0);
  
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
      <FacilityDropdown
        selectedPlant={selectedPlantId !== null ? String(selectedPlantId) : ''}
        onChange={(e) => {
          const newId = Number(e.target.value);
          setSelectedPlantId(newId);
          router.push(`/plant-operator/manage-plants?selected=${newId}`);
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
      <div className="flex justify-between items-center pb-4 mb-8 relative">
        <div className="absolute top-[5px] left-[6%] right-[7%] h-[1px] bg-gray-400 z-0"></div>
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center cursor-pointer z-10" onClick={() => handleStepClick(index)}>
            <div className={`w-3 h-3 rounded-full ${currentStep === index ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
            <span className={`text-xs mt-2 text-center ${currentStep === index ? 'text-blue-500 font-semibold' : 'text-gray-500'}`}>{step}</span>
          </div>
        ))}
      </div>

      {/* Steps */}
      {currentStep === 0 && (
        <StepContainer title={steps[0]}>
          <div className="flex items-center mb-4">
          <label className="block accent-blue-600 mr-4 font-medium whitespace-nowrap">
            What type of fuel does your plant produce?
          </label>
          <select
            className={`border rounded-md px-3 py-1.5 outline-none shadow-sm text-sm flex-1 ${
              selectedPlant ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
            }`}
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            disabled={!!selectedPlant}
          >
            <option value="">Select</option>
            <option value="hydrogen">Hydrogen</option>
            <option value="ammonia">Ammonia</option>
            <option value="methanol">Methanol</option>
            <option value="saf">Sustainable Aviation Fuel (SAF)</option>
            <option value="biofuels">Biofuels</option>
            <option value="e-ng">e-NG</option>
          </select>
        </div>

          {fuelType === 'hydrogen' && <HydrogenFields data={formData.hydrogen} onChange={(updated) => setFormData(prev => ({ ...prev, hydrogen: updated }))} />}
          {fuelType === 'ammonia' && <AmmoniaFields data={formData.ammonia} onChange={(updated) => setFormData(prev => ({ ...prev, ammonia: updated }))} />}
          {fuelType === 'e-ng' && <ENGFields data={formData.eng} onChange={(updated) => setFormData(prev => ({ ...prev, eng: updated }))} />}
          {fuelType === 'saf' && <SAFFields data={formData.saf} onChange={(updated) => setFormData(prev => ({ ...prev, saf: updated }))} />}
          {fuelType === 'biofuels' && <BiofuelFields data={formData.biofuels} onChange={(updated) => setFormData(prev => ({ ...prev, biofuels: updated }))} />}
          {fuelType === 'methanol' && <MethanolFields data={formData.methanol} onChange={(updated) => setFormData(prev => ({ ...prev, methanol: updated }))} />}
        </StepContainer>
      )}

      {currentStep === 1 && (
        <div>
          <StepContainer title={steps[1]}>
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
          </StepContainer>
          <br />
          <StepContainerNoNotice title={'Water Consumption'}>
            <WaterStep
              data={formData.water}
              onChange={(updated) =>
                setFormData((prev) => ({
                  ...prev,
                  water: {
                    ...prev.water,
                    ...updated,
                  },
                }))
              }
            />
          </StepContainerNoNotice>
        </div>
      )}

      {currentStep === 2 && (
        <StepContainer title={steps[2]}>
          <GHGReductionStep data={formData.ghg} onChange={(updated) => setFormData(prev => ({ ...prev, ghg: updated }))} />
        </StepContainer>
      )}

      {currentStep === 3 && (
        <StepContainer title={steps[3]}>
          <TraceabilityStep data={formData.traceability} onChange={(updated) => setFormData(prev => ({ ...prev, traceability: updated }))} />
        </StepContainer>
      )}

      {currentStep === 4 && (
        <StepContainer title={steps[4]}>
          <OffTakersStep data={formData.offtakers} onChange={(updated) => setFormData(prev => ({ ...prev, offtakers: updated }))} />
        </StepContainer>
      )}

      {currentStep === 5 && (
        <StepContainersplited title={steps[5]}>
          <CertificationStep data={formData.certifications} onChange={(updated) => setFormData(prev => ({ ...prev, certifications: updated }))} />
        </StepContainersplited>
      )}

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
