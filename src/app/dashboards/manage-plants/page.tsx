'use client';
import React, { useEffect, useState } from 'react';
import HydrogenFields from '@/components/manage-plants/general-info/HydrogenFields';
import AmmoniaFields from '@/components/manage-plants/general-info/AmmoniaFields';
import ENGFields from '@/components/manage-plants/general-info/ENGFields';
import SAFFields from '@/components/manage-plants/general-info/SAFFields';
import BiofuelFields from '@/components/manage-plants/general-info/BiofuelFields';
import MethanolFields from '@/components/manage-plants/general-info/MethanolFields';
import ElectricityStep from '@/components/manage-plants/electricity-generation/ElectricityStep';
import WaterStep from '@/components/manage-plants/electricity-generation/WaterStep';
import GHGReductionStep from '@/components/manage-plants/ghg-reduction/GHGReductionStep';
import TraceabilityStep from '@/components/manage-plants/traceability/TraceabilityStep';
import OffTakersStep from '@/components/manage-plants/off-takers/OffTakersStep';
import CertificationStep from '@/components/manage-plants/certification-preferences/CertificationStep';
import StepNotice from '@/components/manage-plants/common/StepNotice';
import FacilityDropdown from '@/components/plantDashboard/FacilityDropdown';
import {useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";







interface Plant {
  id: string;
  name: string;
  type: string;
  address: string;
  riskScore: number;
}

const steps = [
  'General informations',
  'Electricity Generation & Water Consumption',
  'GHG Reduction & Carbon Footprint (PCF)',
  'Traceability & Chain Custody',
  'Off-Takers & Market Positioning',
  'Certification Preferences'
];

interface ElectricityData {
  selectedSources: string[];
  ppaFile: File | null;
  energyMix: { type: string; percent: string }[];
  ppaDetails: any;
  directGridDetails: any;
  selfGenerationDetails: any;
  greenTariffsDetails: any;
  spotMarketDetails: any;
  contractDiffDetails: any;
}

interface WaterData {
  waterConsumption: string;
  waterSources: string[];
  trackWaterUsage: boolean | null;
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
  const router = useRouter();
  const [selectedFromQuery, setSelectedFromQuery] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const selected = params.get('selected');
      if (selected) {
        setSelectedFromQuery(selected);
      }
    }
  }, []);


  const [currentStep, setCurrentStep] = useState(0);
  const [fuelType, setFuelType] = useState('');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

 

  const [formData, setFormData] = useState<FormDataType>({
    hydrogen: {},
    ammonia: {},
    biofuels: {},
    saf: {},
    eng: {},
    methanol: {},
    electricity: {
      selectedSources: [],
      ppaFile: null,
      energyMix: [{ type: '', percent: '' }],
      ppaDetails: {},
      directGridDetails: {},
      selfGenerationDetails: {},
      greenTariffsDetails: {},
      spotMarketDetails: {},
      contractDiffDetails: {},
    },
    water: {
      waterConsumption: '',
      waterSources: [],
      trackWaterUsage: null,
    },
    ghg: {},
    traceability: {},
    offtakers: {},
    certifications: {},
  });

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await fetch('/api/plants');
        const data: Plant[] = await res.json();
        setPlants(data);
  
        // Wait until plants are loaded, then apply selection
        const defaultId = data[0]?.id || '';
        const paramId = selectedFromQuery || defaultId;
        const foundPlant = data.find((p) => p.id === paramId);
  
        setSelectedPlantId(paramId);
        setSelectedPlant(foundPlant || null);
      } catch (err) {
        console.error('Failed to fetch plants:', err);
      }
    };
  
    if (selectedFromQuery !== '' || plants.length === 0) {
      fetchPlants();
    }
  }, [selectedFromQuery]);
  
  
  
  useEffect(() => {
    const current = plants.find((p) => p.id === selectedPlantId);
    setSelectedPlant(current || null);
  }, [selectedPlantId, plants]);

  
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
    const filePreview = (file: File | null) =>
      file ? { name: file.name, size: file.size, type: file.type } : null;
  
    const previewFormData = {
      ...formData,
      electricity: {
        plant_id: selectedPlantId, // plant id: we need it to register plant documents in the plant_documents table
        ...formData.electricity,
        ppaFile: filePreview(formData.electricity.ppaFile),
        ppaDetails: {
          ...formData.electricity.ppaDetails,
          onSiteFile: filePreview(formData.electricity.ppaDetails?.onSiteFile),
          offSiteFile: filePreview(formData.electricity.ppaDetails?.offSiteFile),
          gridFile: filePreview(formData.electricity.ppaDetails?.gridFile),
        },
        directGridDetails: {
          ...formData.electricity.directGridDetails,
          goOFile: filePreview(formData.electricity.directGridDetails?.goOFile),
          invoiceFile: filePreview(formData.electricity.directGridDetails?.invoiceFile),
        },
        selfGenerationDetails: {
          ...formData.electricity.selfGenerationDetails,
          file: filePreview(formData.electricity.selfGenerationDetails?.file),
        },
        greenTariffsDetails: {
          ...formData.electricity.greenTariffsDetails,
          file: filePreview(formData.electricity.greenTariffsDetails?.file),
        },
        spotMarketDetails: {
          ...formData.electricity.spotMarketDetails,
          purchaseFile: filePreview(formData.electricity.spotMarketDetails?.purchaseFile),
          goOFile: filePreview(formData.electricity.spotMarketDetails?.goOFile),
        },
        contractDiffDetails: {
          ...formData.electricity.contractDiffDetails,
          file: filePreview(formData.electricity.contractDiffDetails?.file),
        },
      },
    };
  
    console.log('📦 Full form data with file info:\n', JSON.stringify(previewFormData, null, 2));
    router.push('/dashboards/manage-plants/loading');
  };
  
  return (
    <form className="w-full p-8 min-h-screen" autoComplete="off">
      <div className="flex justify-between items-center p-4 rounded-lg">
      <FacilityDropdown
  selectedPlant={selectedPlantId} // ✅ FIXED: send the ID (string), not name or object
  onChange={(e) => {
    const newId = e.target.value;
    setSelectedPlantId(newId);
    router.push(`/dashboards/manage-plants?selected=${newId}`);
  }}
/>






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
          {fuelType === 'hydrogen' && <HydrogenFields data={formData.hydrogen} onChange={(updated) => setFormData(prev => ({ ...prev, hydrogen: updated }))} />}
          {fuelType === 'ammonia' && <AmmoniaFields data={formData.ammonia} onChange={(updated) => setFormData(prev => ({ ...prev, ammonia: updated }))} />}
          {fuelType === 'eng' && <ENGFields data={formData.eng} onChange={(updated) => setFormData(prev => ({ ...prev, eng: updated }))} />}
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
            <WaterStep data={formData.water} onChange={(updated) => setFormData(prev => ({ ...prev, water: updated }))} />
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
            type="button" // 🔴 This line prevents form submission!
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
            type="button" // 🔴 Same here!
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
