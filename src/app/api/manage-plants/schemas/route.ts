import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        section_general_info,
        section_market_and_offtakers,
        section_electricity_water,
        section_ghg_reduction,
        section_traceability,
        section_certifications
      FROM manage_plants_forms
      WHERE id = 1
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No schema found in DB' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('❌ Failed to fetch schemas:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
