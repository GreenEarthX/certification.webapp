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
}

export const certificationService = new CertificationService();
