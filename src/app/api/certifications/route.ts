import { NextResponse } from "next/server";
import pool from "@/lib/db";

// API Route - Fetch Certifications
export async function GET() {
  try {
    const query = `
      SELECT 
          cs.certification_scheme_name AS "Certification",
          cs.framework AS "Type",
          cb.cb_name AS "Entity",
          p.plant_name AS "Plant Name",
          TO_CHAR(c.created_at, 'DD Mon YYYY') AS "Submission Date",
          c.status AS "Status",
          c.certification_id AS "id"
      FROM certifications c
      JOIN certification_schemes cs 
          ON c.certification_scheme_id = cs.certification_scheme_id
      JOIN plants p 
          ON c.plant_id = p.plant_id
      LEFT JOIN certification_bodies cb 
          ON cs.issuing_body_id = cb.cb_id
      ORDER BY c.created_at DESC;`;

    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
