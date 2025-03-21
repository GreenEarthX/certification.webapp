import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: 'Certification ID is required' },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      `
      SELECT
        c.certification_id,
        c.status,
        c.created_at,
        cs.certification_scheme_name,
        cs.imageUrl,
        cs.framework,
        cs.certificate_type,
        cs.geographic_coverage,
        ib.ib_name AS issuing_body,
        p.plant_name,
        p.email AS plant_email,
        p.operator_id
      FROM certifications c
      JOIN certification_schemes cs ON c.certification_scheme_id = cs.certification_scheme_id
      JOIN issuing_bodies ib ON c.ib_id = ib.ib_id
      JOIN plants p ON c.plant_id = p.plant_id
      WHERE c.certification_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
