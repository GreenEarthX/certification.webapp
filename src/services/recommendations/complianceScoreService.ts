import pool from "@/lib/db";

export async function getComplianceScore(recommendationId: string) {
  const query = `
    SELECT 
      r.compliance_score,
      cs.certification_scheme_name
    FROM recommendations r
    JOIN certification_schemes cs ON r.certification_scheme_id = cs.certification_scheme_id
    WHERE r.recommendation_id = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [recommendationId]);

  if (result.rows.length === 0) {
    throw new Error("Compliance score not found");
  }

  return result.rows[0].compliance_score;
}
