import pool from "@/lib/db";

class RecommendationService {
  async getAllRecommendations(userSub: string) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        `
        SELECT 
          r.recommendation_id AS id,
          cs.certification_scheme_name AS title,
          COALESCE(cs.overview->'recommendation_overview'->>'description', '') AS overview,
          COALESCE(cs.overview->'recommendation_overview'->'features', '[]'::jsonb) AS details,
          STRING_AGG(DISTINCT cb.cb_name, ', ') AS "certifyingEntity",  
          cs.certification_details->>'validity' AS validity,
          cov.coverage_label AS "certificationCoverage",
          r.compliance_score AS "compliancePercentage",
          p.plant_id AS "plantId",
          p.plant_name AS "plantName"
        FROM users u
        JOIN plants p ON u.user_id = p.operator_id
        JOIN recommendations r ON r.plant_id = p.plant_id
        JOIN certification_schemes cs ON r.certification_scheme_id = cs.certification_scheme_id
        JOIN certification_schemes_certification_bodies cscb ON cs.certification_scheme_id = cscb.certification_scheme_id
        JOIN certification_bodies cb ON cscb.cb_id = cb.cb_id
        LEFT JOIN coverage cov ON cs.coverage::int = cov.coverage_id
        WHERE u.auth0sub = $1
        GROUP BY r.recommendation_id, cs.certification_scheme_name, cs.overview, cs.certification_details->>'validity', cov.coverage_label, r.compliance_score, p.plant_id, p.plant_name;
        `,
        [userSub]
      );
      

      client.release();
      return result.rows;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw new Error("Failed to fetch recommendations");
    }
  }

  async getComplianceScore(recommendationId: string) {
    try {
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

      const { compliance_score, certification_scheme_name } = result.rows[0];

      return {
        complianceScore: compliance_score,
        schemeName: certification_scheme_name,
      };
    } catch (error) {
      console.error("Error fetching compliance score:", error);
      throw new Error("Failed to fetch compliance score");
    }
  }


  async getSchemeDetailsByRecommendationId(recommendationId: string) {
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
        console.log("No scheme details found for recommendation ID:", recommendationId);
        return null;
      }

      console.log("Scheme details fetched:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching scheme details:", error);
      throw new Error("Failed to fetch scheme details");
    }
  }
}


export const recommendationService = new RecommendationService();
