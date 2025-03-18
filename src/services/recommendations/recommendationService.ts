import pool from "@/lib/db";

export async function getRecommendations() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
            r.recommendation_id AS id,
            cs.certification_scheme_name AS title,
            COALESCE(cs.overview->'recommendation_overview'->>'description', '') AS overview,
            COALESCE(cs.overview->'recommendation_overview'->'features', '[]'::jsonb) AS details,
            STRING_AGG(DISTINCT cb.cb_name, ', ') AS "certifyingEntity",  
            cs.validity AS validity,
            r.compliance_score AS "compliancePercentage",
            p.plant_id AS "plantId",
            p.plant_name AS "plantName"
      FROM recommendations r
      JOIN plants p ON r.plant_id = p.plant_id  -- ✅ JOIN plants table to get plant_id & plant_name
      JOIN certification_schemes cs ON r.certification_scheme_id = cs.certification_scheme_id
      JOIN certification_schemes_certification_bodies cscb ON cs.certification_scheme_id = cscb.certification_scheme_id
      JOIN certification_bodies cb ON cscb.cb_id = cb.cb_id
      GROUP BY r.recommendation_id, cs.certification_scheme_name, cs.overview, cs.validity, r.compliance_score, p.plant_id, p.plant_name;
    `);

    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw new Error("Failed to fetch recommendations");
  }
}
