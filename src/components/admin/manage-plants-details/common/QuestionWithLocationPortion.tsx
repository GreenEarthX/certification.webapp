
'use client';
import React from 'react';

interface LocationEntry {
  country: string;
  portion: number;
}

interface Props {
  label: string;
  value: LocationEntry[];
  onChange: (val: LocationEntry[]) => void;
  validation?: {
    maxTotal?: number;
    errorMessage?: string;
  };
}

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

const QuestionWithLocationPortion: React.FC<Props> = ({ label, value, onChange, validation }) => {
  const maxTotal = validation?.maxTotal || 100;
  const errorMessage = validation?.errorMessage || 'exceeds 100%';

  const totalPortion = value.reduce((sum, loc) => sum + Number(loc.portion || 0), 0);  
  
  const updateEntry = (index: number, key: keyof LocationEntry, newValue: any) => {
  const updated = [...value];
  const originalPortion = Number(updated[index].portion || 0);
  const newPortion = key === 'portion' ? Number(newValue) : originalPortion;

  const proposedTotal =
    value.reduce((sum, loc, i) =>
      i === index ? sum + newPortion : sum + Number(loc.portion || 0), 0
    );

  if (key === 'portion' && proposedTotal > 100) return;

  updated[index] = { ...updated[index], [key]: newValue };
  onChange(updated);
};

  const addEntry = () => {
  const totalPortion = value.reduce((sum, loc) => sum + Number(loc.portion || 0), 0);
  if (totalPortion >= 100) return;
  onChange([...value, { country: '', portion: 0 }]);
};

  const removeEntry = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>

      {value.map((entry, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-3"
        >
          {/* Country */}
          <div className="flex items-center gap-4">
            <label className="block mb-1 text-sm font-medium w-24">Country</label>
            <select
              value={entry.country}
              onChange={(e) => updateEntry(index, 'country', e.target.value)}
              className="border px-3 py-1.5 rounded-md text-sm flex-1 bg-white"
            >
              <option value="">Select</option>
              {countryOptions.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  disabled={value.some((v, i) => v.country === opt && i !== index)}
                >
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Portion */}
          <div className="flex items-center gap-2">
            <label className="block mb-1 text-sm font-medium w-24">Portion</label>
            <input
              type="number"
              value={entry.portion}
              onChange={(e) => updateEntry(index, 'portion', Number(e.target.value))}
              className="border px-3 py-1.5 rounded-md text-sm w-24"
              min={0}
              max={100}
            />
            <span className="block mb-1 text-sm font-medium w-24">%</span>
            {value.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="text-red-500 ml-2 text-sm"
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
          onClick={addEntry}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          + Add Country
        </button>
      )}

        <p className={`text-sm mt-2 ${totalPortion > maxTotal ? 'text-red-600' : 'text-gray-600'}`}>
            Total: {totalPortion}% {totalPortion > maxTotal && `(${errorMessage})`}
        </p>


    </div>
  );
};

export default QuestionWithLocationPortion;