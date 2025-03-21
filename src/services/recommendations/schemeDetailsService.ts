import pool from "@/lib/db";

export async function getSchemeDetailsByRecommendationId(recommendationId: string) {
  console.log(`🔍 Fetching scheme details for recommendation ID: ${recommendationId}`);

  try {
    const query = `
    SELECT 
      (cs.overview -> 'overview') AS overview,
      (cs.overview -> 'requirements') AS requirements,
      (cs.overview -> 'process') AS process,
      r.compliance_score
    FROM certification_schemes cs
    JOIN recommendations r ON r.certification_scheme_id = cs.certification_scheme_id
    WHERE r.recommendation_id = $1
    LIMIT 1;
  `;


    const result = await pool.query(query, [recommendationId]);

    if (result.rows.length === 0) {
      console.log("⚠️ No scheme details found in DB for recommendation ID:", recommendationId);
      return null;
    }

    console.log("✅ Data fetched from DB:", result.rows[0]); // Debugging log
    return result.rows[0];
  } catch (error) {
    console.error("❌ Database error:", error);
    throw new Error("Failed to fetch scheme details");
  }
}
