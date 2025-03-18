import pool from "@/lib/db";

export async function getCertifications() {
  console.log("🔍 getCertifications() function called!"); // ✅ Vérification
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
      FROM certifications c
      JOIN certification_schemes cs 
          ON c.certification_scheme_id = cs.certification_scheme_id
      JOIN plants p 
          ON c.plant_id = p.plant_id
      LEFT JOIN issuing_bodies ib 
          ON cs.issuing_body_id = ib.ib_id
      ORDER BY c.created_at DESC;`;

    const result = await pool.query(query);
    // Debugging: Log the exact database result
    console.log("Database Query Result:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error fetching certifications:", error);
    throw new Error("Failed to fetch certifications");
  }
}
