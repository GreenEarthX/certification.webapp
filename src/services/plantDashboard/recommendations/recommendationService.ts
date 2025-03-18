import pool from "@/lib/db";

export async function getRecommendations(plantId: string) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT cs.certification_scheme_name 
       FROM recommendations r
       JOIN certification_schemes cs ON r.certification_scheme_id = cs.certification_scheme_id
       WHERE r.plant_id = $1;`,
      [plantId]
    );

    client.release();

    return result.rows.map(rec => rec.certification_scheme_name);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw new Error("Failed to fetch recommendations");
  }
}
