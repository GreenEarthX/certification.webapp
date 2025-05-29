import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      certification_scheme_name,
      overview,
      coverage,
      certification_details
    } = body;

    const result = await pool.query(
      `INSERT INTO certification_schemes (
        certification_scheme_name,
        overview,
        coverage,
        certification_details
      ) VALUES (
        $1, $2::jsonb, $3, $4::jsonb
      ) RETURNING *`,
      [
        certification_scheme_name,
        JSON.stringify(overview),
        coverage,
        JSON.stringify(certification_details)
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('❌ Error saving certification scheme:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
