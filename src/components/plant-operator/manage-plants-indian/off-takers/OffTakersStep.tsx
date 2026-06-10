'use client';
import React, { useEffect, useState } from 'react';
import QuestionWithRadio from '../common/QuestionWithRadio';
import QuestionWithMultiSelect from '../common/MultiSelectDropdown';

interface Props {
  data: any;
  onChange: (updated: any) => void;
}

const offTakerOptions = [
  'Refineries',
  'Chemical Manufacturers',
  'Steel Industry',
  'Glass Industry',
  'Electronics and Semiconductor Industry',
  'Heavy Duty Transport',
  'Aviation',
  'Automotive Industry',
  'Power Plants',
  'Energy Storage and Grid Balancing',
  'Natural Gas Infrastructure',
  'Public Sector Infrastructure',
  'Fertilizer Producers',
  'Agricultural Industry',
  'Shipping Industry',
  'Methanol Producers',
  'Petrochemical Industry',
  'Pharmaceuticals and Cosmetics',
  'Marine Shipping',
  'Cogeneration Plants',
  'Fuel Retailers',
  'Regulatory Bodies',
  'Government and Municipal Offtakers',
  'Public Sector Fleets',
  'Power Generation',
  'Gas Utilities',
  'Industrial Heat Applications',
  'Maritime Shipping',
  'Gas Suppliers and Retailers',
  'Energy Utilities',
  'Private Jet Operators',
  'Cargo Airlines',
  'Airport Operators',
  'Aviation Fuel Suppliers',
  'Methanol-Based Fuel Cell Developers',
  'E-fuel Production Companies',
  'Heavy Duty Transport Manufacturers',
  'International Shipping Organizations',
  'Renewable Energy',
];



const countryOptions = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
  'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo (Congo-Brazzaville)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic (Czechia)', 'Democratic Republic of the Congo', 'Denmark',
  'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini (fmr. "Swaziland")',
  'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany',
  'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
  'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar (formerly Burma)',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
  'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Palestine State', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States of America',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];


const MarketPositioningStep: React.FC<Props> = ({ data, onChange }) => {
  const [localData, setLocalData] = useState(data);
  const [locations, setLocations] = useState(data.locations || []);



  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleChange = (key: string, value: any) => {
    const updated = { ...localData, [key]: value };
    setLocalData(updated);
    onChange(updated);
  };

  useEffect(() => {
    setLocalData(data);
    setLocations(data.locations || []);
  }, [data]);

  const updateLocation = (index: number, key: 'country' | 'portion', value: any) => {
    const updated = [...locations];
    updated[index][key] = value;
    setLocations(updated);
    onChange({ ...localData, locations: updated });
  };

  const addLocation = () => {
    const updated = [...locations, { country: '', portion: 0 }];
    setLocations(updated);
    onChange({ ...localData, locations: updated });
  };

  const removeLocation = (index: number) => {
    const updated = locations.filter((_:any, i:any) => i !== index);
    setLocations(updated);
    onChange({ ...localData, locations: updated });
  };

  const totalPortion = locations.reduce((sum:any, loc:any) => sum + Number(loc.portion || 0), 0);

  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-gray-800">Market Positioning</h3>
      <div className="border p-4 rounded-md bg-white">
        <QuestionWithRadio
          label="Do you already have offtake agreements or interested buyers"
          checked={localData.hasAgreements ?? null}
          onCheck={(val) => onChange({ ...localData, hasAgreements: val })}
        />

        <p className="block mb-1 text-sm font-medium mt-4">
          {localData.hasAgreements === true
            ? 'Where are your offtakers located?'
            : 'Where do you intend to sell/use your product?'}
        </p>

        <p className="text-sm text-gray-700 mb-3">
          From your overall production, what portion is allocated to this location?
        </p>

        {locations.map((entry: any, index: number) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-2">
            {/* Country Dropdown */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium whitespace-nowrap w-36">Country:</label>
              <select
                value={entry.country}
                onChange={(e) => updateLocation(index, 'country', e.target.value)}
                className="border px-3 py-1.5 rounded-md text-sm flex-1 bg-white"
              >
                <option value="">Select</option>
                {countryOptions.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    disabled={locations.some((l: any, i: number) => l.country === opt && i !== index)}
                  >
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Portion Input */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap w-20">Portion</label>
              <input
                type="number"
                placeholder="%"
                value={entry.portion}
                onChange={(e) => updateLocation(index, 'portion', Number(e.target.value))}
                className="border px-3 py-1.5 rounded-md text-sm w-24"
              />
              <span className="text-sm font-medium">%</span>
              {locations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                  className="text-red-500 text-sm ml-2"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}

        {totalPortion < 100 && (
          <button
            type="button"
            onClick={addLocation}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            + Add Country
            
          </button>
        )}
        <br/>
        <p className={`text-sm mt-2 ${totalPortion > 100 ? 'text-red-600' : 'text-gray-600'}`}>
          Total: {totalPortion}% {totalPortion > 100 && '(exceeds 100%)'}
        </p>
      </div>

      <br/>
      <h3 className="text-md font-semibold text-gray-800">Off-Takers</h3>
      <div className="border p-4 rounded-md bg-white space-y-4">
        {/* Primary Off-Takers */}
        <QuestionWithMultiSelect
          label="Who are you primary Off-Takers ? (select all that apply)"
          options={offTakerOptions}
          selected={localData.offTakers || []}
          onChange={(val) => handleChange('offTakers', val)}
        />

        {/* Subsidies */}
        <QuestionWithRadio
          label="Do your offtakers need to access market-based incentives or subsidies ?"
          checked={localData.needSubsidies ?? null}
          onCheck={(val) => handleChange('needSubsidies', val)}
        />

        {/* Conditional Section for Label */}
        {localData.needSubsidies === true && (
          <div className="flex flex-col space-y-4">
            <div className="w-full max-w-lg ml-24">
              <QuestionWithRadio
                label="Do they require a specific label ?"
                checked={localData.requiresLabel ?? null}
                onCheck={(val) => handleChange('requiresLabel', val)}
              />
            </div>

            <div className="w-full max-w-lg">
              <label className="block text-sm font-medium mb-1 ml-36">
                {localData.requiresLabel === true ? 'Specify:' : 'What are their requirements ?'}
              </label>
              <textarea
                value={localData.labelRequirements || ''}
                onChange={(e) => handleChange('labelRequirements', e.target.value)}
                className="border rounded-md w-full px-3 py-2 text-sm ml-36"
                rows={3}
                placeholder="Enter requirements"
              />
            </div>
          </div>
        )}
      </div>

    </div>

  );
};

export default MarketPositioningStep;
