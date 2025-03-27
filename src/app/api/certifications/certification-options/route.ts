import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();

    const { rows: schemes } = await client.query(`
      SELECT
        cs.certification_scheme_id,
        cs.certification_scheme_name,
        cs.certificate_type,
        cs.validity,
        ib.ib_name AS entity,
        ARRAY(
          SELECT cb.cb_name
          FROM certification_schemes_certification_bodies csb
          JOIN certification_bodies cb ON csb.cb_id = cb.cb_id
          WHERE csb.certification_scheme_id = cs.certification_scheme_id
        ) AS certification_bodies,
        ARRAY(
          SELECT lc.lc_name
          FROM certification_schemes_legislation_compliances cslc
          JOIN legislation_compliances lc ON cslc.lc_id = lc.lc_id
          WHERE cslc.certification_scheme_id = cs.certification_scheme_id
        ) AS complies_with
      FROM certification_schemes cs
      LEFT JOIN issuing_bodies ib ON cs.issuing_body_id = ib.ib_id
    `);

    client.release();
    return NextResponse.json(schemes);
  } catch (error) {
    console.error("Error fetching certification options:", error);
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 });
  }
}
