import pool from "@/lib/db";
import { CertificationRegistrationPayload } from "@/models/plantRegistration";


function formatDate(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}
class CertificationService {
  async getCertifications(userSub: string) {
    try {
      const query = `
        SELECT 
            cs.certification_scheme_name AS "Certification",
            cs.certification_details->>'framework' AS "Type",
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
        WHERE u.auth0sub = $1
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


  async registerCertification(body: CertificationRegistrationPayload) {
    const {
      plant_id,
      certificationName,
      certificationBody,
      issueDate,
      certificateNumber,
      entity,
      compliesWith,
      owner
    } = body;
  
    try {
      // 1. Get certification_scheme_id
      const schemeRes = await pool.query(
        `SELECT certification_scheme_id FROM certification_schemes WHERE certification_scheme_name = $1`,
        [certificationName.trim()]
      );
      if (schemeRes.rowCount === 0) throw new Error("Certification scheme not found");
      const certification_scheme_id = schemeRes.rows[0].certification_scheme_id;
  
      // 2. Get cb_id from certificationBody
      let cb_id: number | null = null;
      if (certificationBody) {
        const cbRes = await pool.query(
          `SELECT cb_id FROM certification_bodies WHERE cb_name = $1`,
          [certificationBody.trim()]
        );
        if (cbRes.rowCount === 0) throw new Error("Certification body not found");
        cb_id = cbRes.rows[0].cb_id;
      }
  
      // 3. Get lc_id from compliesWith
      let lc_id: number | null = null;
      if (compliesWith) {
        const lcRes = await pool.query(
          `SELECT lc_id FROM legislation_compliances WHERE lc_name = $1`,
          [compliesWith.trim()]
        );
        if (lcRes.rowCount === 0) throw new Error("Compliance not found");
        lc_id = lcRes.rows[0].lc_id;
      }
  
      // 4. Get csh_id from owner
      let csh_id: number | null = null;
      if (owner) {
        const cshRes = await pool.query(
          `SELECT csh_id FROM certification_scheme_holders WHERE csh_name = $1`,
          [owner.trim()]
        );
        if (cshRes.rowCount === 0) throw new Error("Owner not found");
        csh_id = cshRes.rows[0].csh_id;
      }
  
      // 5. Get ib_id from entity
      let ib_id: number | null = null;
      if (entity) {
        const ibRes = await pool.query(
          `SELECT ib_id FROM issuing_bodies WHERE ib_name = $1`,
          [entity.trim()]
        );
        if (ibRes.rowCount === 0) throw new Error("Issuing body not found");
        ib_id = ibRes.rows[0].ib_id;
      }
  
      // 6. Insert into certifications
      const insertRes = await pool.query(
        `
        INSERT INTO certifications (
          plant_id,
          certification_scheme_id,
          ib_id,
          cb_id,
          lc_id,
          csh_id,
          status,
          issue_date,
          certificate_number,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'Active', $7, $8, NOW())
        RETURNING *
        `,
        [
          plant_id,
          certification_scheme_id,
          ib_id,
          cb_id,
          lc_id,
          csh_id,
          issueDate ? formatDate(issueDate) : null,
          certificateNumber || null
        ]
      );
  
      return insertRes.rows[0];
    } catch (error) {
      console.error("❌ Error registering certification:", error);
      throw new Error((error as Error).message || "Certification registration failed");
    }
  }

  async fetchCertificationOptions() {
    try {
      const { rows } = await pool.query(`
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
          ) AS complies_with,
          ARRAY(
            SELECT csh.csh_name
            FROM certification_schemes_certification_scheme_holders csh_link
            JOIN certification_scheme_holders csh ON csh_link.csh_id = csh.csh_id
            WHERE csh_link.certification_scheme_id = cs.certification_scheme_id
          ) AS owners
        FROM certification_schemes cs
        LEFT JOIN issuing_bodies ib ON cs.issuing_body_id = ib.ib_id
      `);

      return rows;
    } catch (error) {
      console.error("Error fetching certification options:", error);
      throw new Error("Failed to fetch options");
    }
  }

  async uploadFileToExtractAPI(file: Blob) {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch("http://10.0.2.38:8000/extract/", {
      method: "POST",
      body: form,
    });
    if (!response.ok) throw new Error("Failed to extract data from the file");
    return response.json();
  }
  
}

export const certificationService = new CertificationService();