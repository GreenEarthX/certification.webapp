
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Plant {
  plant_id: number;
  plant_name: string;
  address: { country: string };
  fuel_type: { fuel_name: string };
  target_markets: string[];
}

interface FuelType {
  fuel_id: number;
  fuel_name: string;
}

interface CertificationScheme {
  certification_scheme_id: number;
  certification_scheme_name: string;
  framework: string;
  certificate_type: string;
  rfnbo_check: string;
  lifecycle_coverage: string;
  pcf_approach: string;
  geographic_coverage: string;
  coverage_countries: string[];
  fuel_types: string[];
}

interface Recommendation {
  certification_scheme_id: number;
  scheme_name: string;
  score: number;
  reasons: string[];
  framework: string;
  geographic_coverage: string;
  compliance_requirements: string[];
}

interface Criteria {
  productType: string;
  manufacturingCountry: string;
  targetMarkets: string[];
}

const RecommendationEngine = {
  generateRecommendations(
    certificationSchemes: CertificationScheme[],
    criteria: Criteria,
    maxResults: number = 5
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    console.log('=== Running Recommendation Engine ===');
    console.log('Criteria:', criteria);
    console.log('Certification Schemes:', certificationSchemes);

    for (const scheme of certificationSchemes) {
      console.log(`\nChecking scheme: ${scheme.certification_scheme_name}`);

      // Allow all fuel types if scheme.fuel_types is empty
      const productMatch = scheme.fuel_types.length === 0 || scheme.fuel_types.some(
        (f) => f.toLowerCase() === criteria.productType.toLowerCase()
      );
      console.log('  Product Match:', productMatch, 'Fuel Types:', scheme.fuel_types);
      if (!productMatch) continue;

      const manufacturingMatch =
        scheme.geographic_coverage === 'Global' ||
        scheme.coverage_countries.includes('*') ||
        scheme.coverage_countries.some(
          (c) => c.toLowerCase() === criteria.manufacturingCountry.toLowerCase()
        );
      console.log('  Manufacturing Match:', manufacturingMatch, 'Coverage Countries:', scheme.coverage_countries);
      if (!manufacturingMatch) continue;

      const coverageMatch =
        scheme.geographic_coverage === 'Global' ||
        scheme.coverage_countries.includes('*') ||
        criteria.targetMarkets.some((target) =>
          scheme.coverage_countries.some((c) => c.toLowerCase() === target.toLowerCase())
        );
      console.log('  Coverage Match (target markets):', coverageMatch, 'Target Markets:', criteria.targetMarkets);
      if (!coverageMatch) continue;

      const score = 100; // All three matched
      const rec: Recommendation = {
        certification_scheme_id: scheme.certification_scheme_id,
        scheme_name: scheme.certification_scheme_name,
        score,
        reasons: [
          `Supports fuel type ${criteria.productType}`,
          `Applicable in manufacturing country (${criteria.manufacturingCountry})`,
          `Covers at least one of target markets (${criteria.targetMarkets.join(', ')})`,
        ],
        framework: scheme.framework,
        geographic_coverage: scheme.geographic_coverage,
        compliance_requirements: ['Standard certification procedures'],
      };

      recommendations.push(rec);
    }

    console.log('\n=== Final Recommendations ===');
    console.log(JSON.stringify(recommendations, null, 2));

    return recommendations.slice(0, maxResults);
  },
};

export default function RecommendationsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [certificationSchemes, setCertificationSchemes] = useState<CertificationScheme[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [plantId, setPlantId] = useState<string>('');
  const [productType, setProductType] = useState<string>('');
  const [manufacturingCountry, setManufacturingCountry] = useState<string>('');
  const [targetMarkets, setTargetMarkets] = useState<string[]>([]);
  const [maxResults, setMaxResults] = useState<number>(5);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const logMessage = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [plantsRes, fuelTypesRes, schemesRes, countriesRes] = await Promise.all([
          fetch('/api/recommendation_engine?type=plants').then(res => res.json().then(data => ({ ok: res.ok, data }))),
          fetch('/api/recommendation_engine?type=fuel-types').then(res => res.json().then(data => ({ ok: res.ok, data }))),
          fetch('/api/recommendation_engine?type=certification-schemes').then(res => res.json().then(data => ({ ok: res.ok, data }))),
          fetch('/api/recommendation_engine?type=countries').then(res => res.json().then(data => ({ ok: res.ok, data }))),
        ]);

        if (!plantsRes.ok) logMessage(`Error fetching plants: ${JSON.stringify(plantsRes.data)}`);
        if (!fuelTypesRes.ok) logMessage(`Error fetching fuel types: ${JSON.stringify(fuelTypesRes.data)}`);
        if (!schemesRes.ok) logMessage(`Error fetching certification schemes: ${JSON.stringify(schemesRes.data)}`);
        if (!countriesRes.ok) logMessage(`Error fetching countries: ${JSON.stringify(countriesRes.data)}`);

        setPlants(plantsRes.ok ? plantsRes.data : []);
        setFuelTypes(fuelTypesRes.ok ? fuelTypesRes.data : []);
        setCertificationSchemes(schemesRes.ok ? schemesRes.data : []);
        setCountries(countriesRes.ok ? countriesRes.data : []);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        logMessage(`Error fetching data: ${error.message}`);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handlePlantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlantId = e.target.value;
    setPlantId(selectedPlantId);

    if (selectedPlantId) {
      const plant = plants.find((p) => p.plant_id === parseInt(selectedPlantId));
      if (plant) {
        const normalizedFuel = plant.fuel_type.fuel_name.charAt(0).toUpperCase() + 
                              plant.fuel_type.fuel_name.slice(1).toLowerCase();
        setProductType(normalizedFuel);
        setManufacturingCountry(plant.address.country);
        setTargetMarkets(plant.target_markets);
      }

    } else {
      setProductType('');
      setManufacturingCountry('');
      setTargetMarkets([]);
    }
  };

  const handleRunEngine = () => {
    setLog([]);
    const criteria: Criteria = {
      productType,
      manufacturingCountry,
      targetMarkets,
    };

    const recs = RecommendationEngine.generateRecommendations(
      certificationSchemes,
      criteria,
      maxResults
    );
    setRecommendations(recs);
    logMessage('=== Running Recommendation Engine ===');
    logMessage(`Criteria: ${JSON.stringify(criteria)}`);
    recs.forEach((rec) => {
      logMessage(`Recommendation: ${rec.scheme_name} (Score: ${rec.score})`);
    });
  };

  const handleSampleCriteria = () => {
    setProductType('Ammonia');
    setManufacturingCountry('Germany');
    setTargetMarkets(['Germany', 'India']);
    setMaxResults(5);
    setPlantId('');
    handleRunEngine();
  };

  const handleReset = () => {
    setPlantId('');
    setProductType('');
    setManufacturingCountry('');
    setTargetMarkets([]);
    setMaxResults(5);
    setRecommendations([]);
    setLog([]);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6 bg-slate-50 text-slate-800">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Certification Recommendation Engine – Demo</h1>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-2xl bg-slate-200 hover:bg-slate-300"
        >
          Reset
        </button>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-semibold">Input Criteria</h2>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Select Existing Plant (optional)</label>
            <select
              value={plantId}
              onChange={handlePlantChange}
              className="w-full border rounded-xl p-2"
            >
              <option value="">-- None (manual input) --</option>
              {plants.map((plant) => (
                <option key={plant.plant_id} value={plant.plant_id}>
                  {plant.plant_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">End Product Type</label>
            <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="w-full border rounded-xl p-2"
          >
            <option value="">Select a product type</option>
            {/* Add plant’s fuel if not already in the list */}
            {productType && !fuelTypes.some(f => f.fuel_name === productType) && (
              <option value={productType}>{productType}</option>
            )}
            {fuelTypes.map((fuel) => {
              const normalizedFuel = fuel.fuel_name.charAt(0).toUpperCase() + 
                                    fuel.fuel_name.slice(1).toLowerCase();
              return (
                <option key={fuel.fuel_id} value={normalizedFuel}>
                  {normalizedFuel}
                </option>
              );
            })}
          </select>

          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Manufacturing Country</label>
            <input
              value={manufacturingCountry}
              onChange={(e) => setManufacturingCountry(e.target.value)}
              list="countryList"
              className="w-full border rounded-xl p-2"
              placeholder="e.g., Germany"
            />
            <datalist id="countryList">
              {countries.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Target Markets (select multiple)</label>
            <select
              multiple
              value={targetMarkets}
              onChange={(e) =>
                setTargetMarkets(Array.from(e.target.selectedOptions, (option) => option.value))
              }
              className="w-full border rounded-xl p-2 h-40"
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Tip: Hold Ctrl/⌘ to select multiple options.</p>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium">Max Results</label>
            <input
              type="number"
              min="1"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value) || 5)}
              className="w-28 border rounded-xl p-2"
            />
          </div>
          <div className="pt-2 flex gap-3">
            <button
              onClick={handleRunEngine}
              className="px-4 py-2 rounded-2xl bg-black text-white hover:opacity-90"
            >
              Run Engine
            </button>
            <button
              onClick={handleSampleCriteria}
              className="px-4 py-2 rounded-2xl bg-slate-900 text-white/90 hover:opacity-90"
            >
              Use Sample Criteria
            </button>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Results</h2>
            <span className="text-sm text-slate-500">
              {recommendations.length} item{recommendations.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="space-y-3 min-h-[120px]">
            {recommendations.length === 0 ? (
              <p className="text-sm text-slate-500">Run the engine to see recommendations…</p>
            ) : (
              recommendations.map((rec) => (
                <article key={rec.certification_scheme_id} className="border rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{rec.scheme_name}</h3>
                      <p className="text-xs text-slate-500">
                        Framework: {rec.framework} • Coverage: {rec.geographic_coverage}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{rec.score}</div>
                      <div className="text-xs text-slate-500">score</div>
                    </div>
                  </div>
                  <ul className="list-disc pl-5 mt-3 text-sm space-y-1">
                    {rec.reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <span className="text-xs bg-slate-100 rounded-full px-2 py-1">
                      {rec.compliance_requirements[0]}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-white shadow-sm rounded-2xl p-5 space-y-3">
        <details className="group" open>
          <summary className="cursor-pointer select-none flex items-center justify-between">
            <h2 className="text-lg font-semibold">Debug Logs</h2>
            <span className="text-xs text-slate-500 group-open:hidden">(open)</span>
            <span className="text-xs text-slate-500 hidden group-open:inline">(close)</span>
          </summary>
          <pre className="bg-slate-950 text-slate-50 rounded-xl p-4 overflow-auto text-xs min-h-[120px]">
            {log.join('\n')}
          </pre>
        </details>
      </section>

      <footer className="py-6 text-center text-xs text-slate-500">
        Next.js demo integrated with backend APIs.
      </footer>
    </main>
  );
}
