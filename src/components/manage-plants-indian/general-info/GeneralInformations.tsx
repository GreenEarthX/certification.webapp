'use client';

import React, { useState } from 'react';
import StepNotice from '@/components/manage-plants/common/StepNotice';
import HydrogenFields from './HydrogenFields';
import AmmoniaFields from './AmmoniaFields';
import MethanolFields from './MethanolFields';
import SAFFields from './SAFFields';
import BiofuelFields from './BiofuelFields';
import ENGFields from './ENGFields';
import QuestionWithMultiSelect from '@/components/manage-plants-indian/common/MultiSelectDropdown';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';




interface Props {
  currentStep: number;
  steps: string[];
  selectedPlant: boolean;
  fuelType: string;
  setFuelType: (val: string) => void;
  formData: any;
  setFormData: (val: any) => void;
}


const feedstockOptions: Record<string, string[]> = {
  hydrogen: [
    'Renewable electricity', 'Water', 'Natural gas', 'Coal or lignite', 'Biogas', 'Oil-based reforming processes', 'Biomass gasification'
  ],
  biofuels: [
    'Sugarcane', 'Corn', 'Wheat', 'Barley', 'Sugar beet', 'Rapeseed', 'Sunflower', 'Palm oil', 'Soybean oil', 'Used cooking oil',
    'Animal fats', 'Tall oil & tall oil pitch', 'Palm fatty acid distillate', 'Agricultural residues', 'Forestry residues',
    'Municipal solid waste', 'Black liquor from pulp & paper mills', 'Microalgae', 'Macroalgae', 'Cyanobacteria'
  ],
  ammonia: [
    'Green hydrogen from electrolysis', 'Nitrogen from air separation', 'Blue hydrogen', 'Grey hydrogen', 'Biogas-derived hydrogen+ Nitrogen from air separation'
  ],
  methanol: [
    'Renewable hydrogen + biogenic CO₂', 'Biomass gasification', 'Biogas upgrading', 'Natural gas-based methanol',
    'Coal-based methanol', 'Municipal solid waste', 'Industrial waste CO₂ + H₂ utilization'
  ],
  'e-ng': [
    'Renewable hydrogen', 'CO₂ from DAC', 'Biogenic CO₂ from fermentation, biogas upgrading', 'Biogas', 'Syngas', 'Natural gas'
  ],
  saf: [
    'Used cooking oil', 'Animal fats', 'Vegetable oils', 'Forestry residues', 'Agricultural residues', 'Municipal solid waste',
    'Ethanol', 'Butanol', 'Renewable hydrogen', 'CO₂ from DAC', 'Hydrothermal liquefaction (HTL) of wet biomass',
    'Catalytic conversion of lignocellulosic biomass'
  ]
};


const GeneralInformations: React.FC<Props> = ({
  currentStep,
  steps,
  selectedPlant,
  fuelType,
  setFuelType,
  formData,
  setFormData
}) => {
  const [plantStage, setPlantStage] = useState('');
  const [reachedDate, setReachedDate] = useState('');
  const [subsidyStatus, setSubsidyStatus] = useState('');
  const [coProduct, setCoProduct] = useState('');
  const [monthlyProduction, setMonthlyProduction] = useState('');
  const [feedstockType, setFeedstockType] = useState('');
  const [feedstockAmount, setFeedstockAmount] = useState('');
  const [feedstockList, setFeedstockList] = useState<string[]>([]);

  const [govSource, setGovSource] = useState('');
  const [stateName, setStateName] = useState('');
  const [govContribution, setGovContribution] = useState('');
  const [awardeeScheme, setAwardeeScheme] = useState('');
  const [contributionType, setContributionType] = useState('');
  const [awardScheme, setAwardScheme] = useState('');



  if (currentStep !== 0) return null;


  const indianStatesAndUTs = [
    // States
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  
    // Union Territories
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
  


  return (
    <div>
      <StepNotice />
      <h2 className="text-lg font-semibold text-blue-900 mb-2">{steps[0]}</h2>
      <div>
      <br/>
        {/* ─── Plant Details ───────────────────────────────────────────── */}
        <h3 className="text-md font-semibold text-gray-800 mb-4">Plant details</h3>
        <div className='bg-white shadow rounded-lg p-6 mb-4'>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Plant stage</label>
            <select
              className="w-full border bg-white rounded-md px-3 py-2 text-sm"
              value={plantStage}
              onChange={(e) => setPlantStage(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Project Initiation (Before Pre-FEED)">Project Initiation (Before Pre-FEED)</option>
              <option value="Project Foundation-Pre-FEED">Project Foundation-Pre-FEED</option>
              <option value="FEED">FEED</option>
              <option value="Pre-FID">Pre-FID</option>
              <option value="FID">FID</option>
              <option value="EPC">EPC</option>
              <option value="Pre-Commissionnig & Commissionnig">Pre-Commissionnig & Commissionnig</option>
              <option value="Start-Up & Initial Production (COD)">Start-Up & Initial Production (COD)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">When did you reach this stage?</label>
            <input
              type="date"
              className="w-full bg-white text-gray-800 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={reachedDate}
              onChange={(e) => setReachedDate(e.target.value)}
            />
          </div>


          <div className="mb-2">
          <label className="block mb-2 text-sm font-medium">
            Did you receive or intend to receive subsidies and/or incentives from the government?
          </label>

          {/* Subsidy Radio Buttons */}
          <div className="flex justify-center gap-8 mt-2">
            {['received', 'intend', 'no'].map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="subsidy"
                  className="accent-blue-600"
                  checked={subsidyStatus === value}
                  onChange={() => setSubsidyStatus(value)}
                />
                {value === 'received' && 'Yes, I received'}
                {value === 'intend' && 'Yes, I intend to'}
                {value === 'no' && 'No'}
              </label>
            ))}
          </div>

          {/* Conditional Fields */}
          {subsidyStatus === 'received' && (
            <div className="mt-6 space-y-4">

              {/* Source of Subsidy */}
              <div className="flex gap-4 items-center ml-28">
                <label className="text-sm font-medium whitespace-nowrap">Did you receive it from:</label>
                {['state', 'central'].map((govLevel) => (
                  <label key={govLevel} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="govLevel"
                      value={govLevel}
                      checked={govSource === govLevel}
                      onChange={() => setGovSource(govLevel)}
                      className="accent-blue-600"
                    />
                    {govLevel === 'state' ? 'State government' : 'Central government'}
                  </label>
                ))}
              </div>

              {/* State Dropdown */}
              {govSource === 'state' && (
                <div className="ml-28">
                  <label className="block mb-1 text-sm font-medium">Specify the state</label>
                  <select
                    className="w-full border bg-white rounded-md px-3 py-2 text-sm"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                  >
                    <option value="">Select</option>
                    {indianStatesAndUTs.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              )}


              {/* Government Contribution */}
              <div className="ml-28">
                <label className="block mb-1 text-sm font-medium">Specify the government contribution</label>
                <select
                  className="w-full border bg-white rounded-md px-3 py-2 text-sm"
                  value={govContribution}
                  onChange={(e) => setGovContribution(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Award">Award</option>
                  <option value="Incentive">Incentive</option>
                  <option value="Subsidy">Subsidy</option>
                </select>
              </div>

              {/* Award Scheme */}
              {govContribution === 'Award' && (
                <div className="ml-28">
                  <label className="block mb-1 text-sm font-medium">Specify the Awardees scheme</label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={awardeeScheme}
                    onChange={(e) => setAwardeeScheme(e.target.value)}
                    placeholder="Enter scheme name"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        </div>

        {/* ─── Technology ─────────────────────────────────────────────── */}
        <br />
        <h3 className="text-md font-semibold text-gray-800 mb-4">Technology</h3>
        <div className="bg-white shadow rounded-lg p-6 mb-4">

          {/* Main Product */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Specify the Main Product</label>
            <select
              className={`w-full border bg-white rounded-md px-3 py-2 text-sm ${
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

          {/* ─── Fuel-specific Fields ───────────────────────────────────── */}
          {fuelType === 'hydrogen' && (
            <HydrogenFields
              data={formData.hydrogen}
              onChange={(updated) =>
                setFormData((prev: typeof formData) => ({ ...prev, hydrogen: updated }))
              }
            />
          )}
          {fuelType === 'ammonia' && (
            <AmmoniaFields
              data={formData.ammonia}
              onChange={(updated) =>
                setFormData((prev: typeof formData) => ({ ...prev, ammonia: updated }))
              }
            />
          )}
          {fuelType === 'methanol' && (
            <MethanolFields
              data={formData.methanol}
              onChange={(updated) =>
                setFormData((prev: typeof formData) => ({ ...prev, methanol: updated }))
              }
            />
          )}
          {fuelType === 'saf' && (
            <SAFFields
              data={formData.saf}
              onChange={(updated) =>
                setFormData((prev: typeof formData) => ({ ...prev, saf: updated }))
              }
            />
          )}
          {fuelType === 'biofuels' && (
            <BiofuelFields
              data={formData.biofuels}
              onChange={(updated) =>
                setFormData((prev: typeof formData) => ({ ...prev, biofuels: updated }))
              }
            />
          )}
          {fuelType === 'e-ng' && (
            <ENGFields
              data={formData.eng}
              onChange={(updated) =>
                setFormData((prev: typeof formData) => ({ ...prev, eng: updated }))
              }
            />
          )}

          {/* Co-product */}
          <div>
            <label className="block mb-1 text-sm font-medium">Specify the Co-product</label>
            <select
              className="w-full border  bg-white rounded-md px-3 py-2 text-sm"
              value={coProduct}
              onChange={(e) => setCoProduct(e.target.value)}
            >
              <option value="">Select</option>
              <option value="hydrogen">Hydrogen</option>
              <option value="ammonia">Ammonia</option>
              <option value="saf">Sustainable Aviation Fuel (SAF)</option>
              <option value="methanol">Methanol</option>
              <option value="e-ng">e-NG</option>
              <option value="biofuel">Biofuel</option>
            </select>
          </div>
        </div>

        


        {/* ─── Feedstock ──────────────────────────────────────────────── */}
        <br/>
        <h3 className="text-md font-semibold text-gray-800 mb-4">Feedstock</h3>
        <div className='bg-white shadow rounded-lg p-6 mb-4'>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Monthly fuel production (Average)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={monthlyProduction}
                onChange={(e) => setMonthlyProduction(e.target.value)}
                placeholder="tons"
              />
              <span className="text-sm text-gray-600">tons</span>
            </div>
          </div>

          {fuelType && (
          <QuestionWithMultiSelect
            label="Feedstock list"
            options={feedstockOptions[fuelType] || []}
            selected={feedstockList}
            onChange={setFeedstockList}
          />
        )}

          <div>
            <label className="block mb-1 text-sm font-medium">Feedstock average quantity used monthly</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={feedstockAmount}
                onChange={(e) => setFeedstockAmount(e.target.value)}
                placeholder="tons"
              />
              <span className="text-sm text-gray-600">tons</span>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default GeneralInformations;
