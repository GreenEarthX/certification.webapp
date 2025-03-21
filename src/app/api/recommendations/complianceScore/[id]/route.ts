import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id: recommendationId } = await context.params; // Await the params object

  const query = `
    SELECT 
      r.compliance_score,
      cs.certification_scheme_name
    FROM recommendations r
    JOIN certification_schemes cs ON r.certification_scheme_id = cs.certification_scheme_id
    WHERE r.recommendation_id = $1
    LIMIT 1;
  `;

  try {
    const result = await pool.query(query, [recommendationId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    const { compliance_score, certification_scheme_name } = result.rows[0];

    return NextResponse.json({
      complianceScore: compliance_score,
      schemeName: certification_scheme_name,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
