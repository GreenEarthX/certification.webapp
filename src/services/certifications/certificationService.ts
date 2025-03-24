import pool from "@/lib/db";

class CertificationService {
  async getCertifications(userSub: string) {
    try {
      const query = `
        SELECT 
            cs.certification_scheme_name AS "Certification",
            cs.framework AS "Type",
            ib.ib_name AS "Entity",
            p.plant_name AS "Plant Name",
            TO_CHAR(c.created_at, 'DD Mon YYYY') AS "Submission Date",
            c.status AS "Status",
            c.certification_id AS "id"
        FROM users u
        JOIN plants p ON u.user_id = p.operator_id
        JOIN certifications c ON c.plant_id = p.plant_id
        JOIN certification_schemes cs ON c.certification_scheme_id = cs.certification_scheme_id
        LEFT JOIN issuing_bodies ib ON cs.issuing_body_id = ib.ib_id
        WHERE u."auth0Sub" = $1
        ORDER BY c.created_at DESC;
      `;

      const result = await pool.query(query, [userSub]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching certifications:", error);
      throw new Error("Failed to fetch certifications");
    }
  }



  async getCertificationById(certificationId: string) {
    try {
      const query = `
        SELECT
          c.certification_id,
          c.status,
          c.created_at,
          cs.certification_scheme_name,
          cs.framework,
          cs.certificate_type,
          cs.geographic_coverage,
          cs.validity,
          cs.overview->>'short_certification_overview' AS short_certification_overview,
          ib.ib_name AS issuing_body,
          p.plant_id,
          p.operator_id,
          p.plant_name,
          p.email AS plant_email
        FROM certifications c
        JOIN certification_schemes cs ON c.certification_scheme_id = cs.certification_scheme_id
        JOIN issuing_bodies ib ON c.ib_id = ib.ib_id
        JOIN plants p ON c.plant_id = p.plant_id
        WHERE c.certification_id = $1
      `;

      const result = await pool.query(query, [certificationId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error fetching certification by ID:", error);
      throw new Error("Failed to fetch certification by ID");
    }
  }

  
}

export const certificationService = new CertificationService();
