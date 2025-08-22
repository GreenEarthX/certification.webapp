
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'plants':
        const plantsResult = await pool.query(`
          SELECT 
            p.plant_id,
            p.plant_name,
            a.country AS manufacturing_country,
            p.plant_details->'generalInfo'->'technology'->>'mainProduct' AS fuel_name,
            COALESCE(
              (SELECT array_agg(DISTINCT l->>'country') 
               FROM jsonb_array_elements(p.plant_details->'offtakers'->'locations') AS l
               WHERE l->>'country' IS NOT NULL),
              ARRAY[]::text[]
            ) AS target_markets
          FROM plants p
          LEFT JOIN address a ON p.address_id = a.address_id
        `);
        console.log('Plants Query Result:', plantsResult.rows);
        return NextResponse.json(
          plantsResult.rows.map((plant) => ({
            plant_id: plant.plant_id,
            plant_name: plant.plant_name,
            address: { country: plant.manufacturing_country || '' },
            fuel_type: { fuel_name: plant.fuel_name || '' },
            target_markets: plant.target_markets || [],
          }))
        );

      case 'fuel-types':
        const fuelTypesResult = await pool.query('SELECT fuel_id, fuel_name FROM fuel_types');
        console.log('Fuel Types Query Result:', fuelTypesResult.rows);
        return NextResponse.json(fuelTypesResult.rows);

      case 'certification-schemes':
const schemesResult = await pool.query(`
  SELECT 
    cs.certification_scheme_id,
    cs.certification_scheme_name,
    cs.framework,
    cs.certificate_type,
    cs.rfnbo_check,
    cs.lifecycle_coverage,
    cs.pcf_approach,
    cs.geographic_coverage,
    COALESCE(c.countries, ARRAY[]::text[]) AS coverage_countries,
    COALESCE(
      (SELECT array_agg(ft.fuel_name)
       FROM certification_schemes_fuel_types csft
       JOIN fuel_types ft ON csft.fuel_id = ft.fuel_id
       WHERE csft.certification_scheme_id = cs.certification_scheme_id
      ), ARRAY[]::text[]
    ) AS fuel_types
  FROM certification_schemes cs
  LEFT JOIN coverage c ON c.coverage_id::text = cs.coverage
`);




  return NextResponse.json(
    schemesResult.rows.map((scheme) => ({
      certification_scheme_id: scheme.certification_scheme_id,
      certification_scheme_name: scheme.certification_scheme_name,
      framework: scheme.framework || 'Unknown',
      certificate_type: scheme.certificate_type || 'Unknown',
      rfnbo_check: scheme.rfnbo_check === true ? 'Yes' : 'No',
      lifecycle_coverage: scheme.lifecycle_coverage || 'Unknown',
      pcf_approach: scheme.pcf_approach || 'Unknown',
      geographic_coverage: scheme.geographic_coverage || 'Unknown',
      coverage_countries: scheme.coverage_countries || [],
      fuel_types: scheme.fuel_types || [],
    }))
  );


      case 'countries':
        // Fetch all countries from the coverage table (explode the text[])
        const coverageCountriesResult = await pool.query(`
          SELECT DISTINCT unnest(countries) AS country 
          FROM coverage
        `);

        // Still fetch from addresses (plants)
        const addressesResult = await pool.query(`
          SELECT DISTINCT country 
          FROM address 
          WHERE country IS NOT NULL
        `);

        console.log('Countries Query Result:', {
          coverageCountries: coverageCountriesResult.rows,
          addresses: addressesResult.rows,
        });

        // Merge into one set
        const countries = new Set([
          ...coverageCountriesResult.rows.map((r: any) => r.country?.trim()),
          ...addressesResult.rows.map((r: any) => r.country?.trim()),
        ].filter((c: string) => c)); // filter out null/empty

        return NextResponse.json(Array.from(countries).sort());


      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error: any) {
    console.error(`Error fetching ${type}:`, error.stack);
    return NextResponse.json({ error: `Failed to fetch ${type}`, details: error.message }, { status: 500 });
  }
}
