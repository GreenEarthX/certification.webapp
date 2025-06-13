'use client';
import React, { useState } from 'react';
import QuestionWithRadio from '../common/QuestionWithRadio';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';
interface Props {
  data: any;
  onChange: (updated: any) => void;
}

  const supplyFuelOptions = ['Natural Gas', 'Diesel', 'Biomass'];
  const steamFuelOptions = ['Coal', 'Heavy Fuel Oil (HFO)', 'Natural Gas', 'Electricity'];
  const inputMaterialOptions = ['SMR feedstock', 'Biomass', 'Naphtha', 'Water', 'Ethanol'];
  const TraceabilityStep: React.FC<Props> = ({ data, onChange }) => {
  const [supplyFuels, setSupplyFuels] = useState(data.supplyFuels || []);
  const [steamFuels, setSteamFuels] = useState(data.steamFuels || []);
  const [inputMaterials, setInputMaterials] = useState(data.inputMaterials || []);
  const [supplyFuelSelect, setSupplyFuelSelect] = useState('');
  const [steamFuelSelect, setSteamFuelSelect] = useState('');
  const [inputMaterialSelect, setInputMaterialSelect] = useState('');


  const updateFuel = (
    list: any[],
    setList: any,
    index: number,
    value: string | number,
    key: 'type' | 'quantity'
  ) => {
    const updated = [...list];
    updated[index][key] = value;
    setList(updated);
    onChange({ ...data, [key === 'type' ? 'fuelList' : 'quantities']: updated });
  };

  const addFuel = (
    list: any[],
    setList: any,
    selected: string,
    setSelected: any,
    fieldName: string
  ) => {
    if (!selected) return;
    const updated = [...list, { type: selected, quantity: '' }];
    setList(updated);
    setSelected('');
    onChange({ ...data, [fieldName]: updated });
  };

  const removeFuel = (list: any[], setList: any, index: number, fieldName: string) => {
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    onChange({ ...data, [fieldName]: updated });
  };

  const handleToggle = (
    list: string[],
    key: 'chainOfCustody' | 'traceabilityLevels',
    value: string
  ) => {
    const updated = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
    onChange({ ...data, [key]: updated });

    if (key === 'traceabilityLevels' && value === 'Other' && list.includes('Other')) {
      onChange({ ...data, traceabilityLevels: updated, customTraceability: '' });
    }
  };

  return (
    <div >
       {/* Supply Chain */}
       <h3 className="text-md font-semibold text-gray-800">Supply Chain</h3>
       <br/>
       <div className="border p-4 rounded-md bg-white space-y-6">
        
        {/* 1. Supply Fuel */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Supply fuel used</p>
        <div className="flex gap-2 mb-3">
          <select
            value={supplyFuelSelect}
            onChange={(e) => setSupplyFuelSelect(e.target.value)}
            className="border px-3 py-1.5 rounded-md text-sm bg-white w-64"
          >
            <option value="">Select fuel</option>
            {supplyFuelOptions
              .filter((opt) => !supplyFuels.some((f: any) => f.type === opt))
              .map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={() =>
              addFuel(supplyFuels, setSupplyFuels, supplyFuelSelect, setSupplyFuelSelect, 'supplyFuels')
            }
            className="w-44 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            + Add fuel
          </button>
        </div>

        {supplyFuels.map((fuel: any, index: number) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center mb-2">
            {/* Fuel name as tag */}
            <div className="col-span-6 sm:col-span-6">
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1.5 rounded-md text-sm w-full">
                <span>{fuel.type}</span>
                <button
                  onClick={() => removeFuel(supplyFuels, setSupplyFuels, index, 'supplyFuels')}
                  className="text-red-500 font-semibold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quantity label and input */}
            <div className="col-span-6 sm:col-span-6 flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Quantity (tons)</label>
              <input
                type="number"
                value={fuel.quantity}
                onChange={(e) =>
                  updateFuel(supplyFuels, setSupplyFuels, index, e.target.value, 'quantity')
                }
                className="border px-3 py-1.5 rounded-md text-sm w-28"
              />
            </div>
          </div>
        ))}
      </div>

        {/* 2. Steam Fuel */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-1">Steam fuel used</p>

        <div className="flex gap-2 mb-3">
          <select
            value={steamFuelSelect}
            onChange={(e) => setSteamFuelSelect(e.target.value)}
            className="border px-3 py-1.5 rounded-md text-sm bg-white w-64"
          >
            <option value="">Select fuel</option>
            {steamFuelOptions
              .filter((opt) => !steamFuels.some((f: any) => f.type === opt))
              .map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={() =>
              addFuel(steamFuels, setSteamFuels, steamFuelSelect, setSteamFuelSelect, 'steamFuels')
            }
            className="w-44 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            + Add Steam fuel
          </button>
        </div>

        {steamFuels.map((fuel: any, index: number) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center mb-2">
            <div className="col-span-6">
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1.5 rounded-md text-sm w-full">
                <span>{fuel.type}</span>
                <button
                  onClick={() => removeFuel(steamFuels, setSteamFuels, index, 'steamFuels')}
                  className="text-red-500 font-semibold"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="col-span-6 flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Quantity (tons)</label>
              <input
                type="number"
                value={fuel.quantity}
                onChange={(e) =>
                  updateFuel(steamFuels, setSteamFuels, index, e.target.value, 'quantity')
                }
                className="border px-3 py-1.5 rounded-md text-sm w-28"
              />
            </div>
          </div>
        ))}
      </div>

        {/* 3. Input Materials */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-1">Input material used</p>

        <div className="flex gap-2 mb-3">
          <select
            value={inputMaterialSelect}
            onChange={(e) => setInputMaterialSelect(e.target.value)}
            className="border px-3 py-1.5 rounded-md text-sm bg-white w-64"
          >
            <option value="">Select material</option>
            {inputMaterialOptions
              .filter((opt) => !inputMaterials.some((f: any) => f.type === opt))
              .map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={() =>
              addFuel(
                inputMaterials,
                setInputMaterials,
                inputMaterialSelect,
                setInputMaterialSelect,
                'inputMaterials'
              )
            }
            className="w-44 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            + Add Input Material
          </button>
        </div>

        {inputMaterials.map((mat: any, index: number) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center mb-2">
            <div className="col-span-6">
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1.5 rounded-md text-sm w-full">
                <span>{mat.type}</span>
                <button
                  onClick={() => removeFuel(inputMaterials, setInputMaterials, index, 'inputMaterials')}
                  className="text-red-500 font-semibold"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="col-span-6 flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Quantity (tons)</label>
              <input
                type="number"
                value={mat.quantity}
                onChange={(e) =>
                  updateFuel(inputMaterials, setInputMaterials, index, e.target.value, 'quantity')
                }
                className="border px-3 py-1.5 rounded-md text-sm w-28"
              />
            </div>
          </div>
        ))}
      </div>

      </div>
      <br/>
      <br/>
      {/* Traceability */} <h3 className="text-md font-semibold text-gray-800">Chain of Custody</h3>
       <br/>
      <div className='bg-white shadow rounded-lg p-6 mb-4'>
      {/* 1. Chain of custody */}
      <div className='bg-white'>
        <p className="block mb-1 text-sm font-medium ">Which chain of custody do you follow?</p>
        {[
          'Mass Balance',
          'Book & Claim',
          'Identity Preservation',
          'Physical Segregation',
          'No formal model yet',
        ].map((option) => (
          <div key={option} className="ml-8">
            <label className="block mb-1 text-sm font-medium ">
              <input
                type="checkbox"
                value={option}
                checked={(data.chainOfCustody || []).includes(option)}
                onChange={() =>
                  handleToggle(data.chainOfCustody || [], 'chainOfCustody', option)
                }
                className="mr-2 accent-blue-600"
              />
              {option}
            </label>
          </div>
        ))}
      </div>
        <br/>
      {/* 2. Traceability level */}
      <div>
        <p className="block mb-1 text-sm font-medium ">What level of traceability is required by your customers?</p>
        {['Batch-level', 'Real-time', 'Blockchain-based', 'ERP system', 'Other'].map((option) => (
          <div key={option} className="ml-8">
            <label className="flex block mb-1 text-sm font-medium  items-center mb-1 cursor-pointer">
              <input
                type="checkbox"
                value={option}
                checked={(data.traceabilityLevels || []).includes(option)}
                onChange={() =>
                  handleToggle(data.traceabilityLevels || [], 'traceabilityLevels', option)
                }
                className="accent-blue-600 block mb-1 text-sm font-medium  mr-2"
              />
              {option}
              {option === 'Other' &&
                (data.traceabilityLevels || []).includes('Other') && (
                  <input
                    type="text"
                    placeholder="Level"
                    value={data.customTraceability || ''}
                    onChange={(e) =>
                      onChange({ ...data, customTraceability: e.target.value })
                    }
                    className="ml-2 border font-medium px-2 py-1 text-sm rounded-md w-24"
                  />
                )}
            </label>
          </div>
        ))}
      </div>

    </div>
    </div>
  );
};

export default TraceabilityStep;
