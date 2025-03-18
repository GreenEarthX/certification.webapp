import pool from "@/lib/db";

export async function getCertifications(plantId: string) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT 
          c.certification_id, 
          cs.certification_scheme_name, 
          ib.ib_name AS entity,  
          c.created_at, 
          c.status
       FROM certifications c
       JOIN certification_schemes cs ON c.certification_scheme_id = cs.certification_scheme_id
       LEFT JOIN issuing_bodies ib ON c.ib_id = ib.ib_id  -- ✅ Proper join to get entity name
       WHERE c.plant_id = $1;`,
      [plantId]
    );

    client.release();
    
    return result.rows.map(cert => ({
      id: cert.certification_id,
      name: cert.certification_scheme_name,
      entity: cert.entity || "Unknown Entity", // ✅ Correct name
      date: new Date(cert.created_at).toLocaleDateString(),
      type: "Regulatory", // Assuming type is always "Regulatory"
      status: cert.status,
    }));
  } catch (error) {
    console.error("Error fetching certifications:", error);
    throw new Error("Failed to fetch certifications");
  }
}
