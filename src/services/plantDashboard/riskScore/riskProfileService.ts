import pool from "@/lib/db";

export async function getRiskScore(plantId: string) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT risk_score FROM risk_profiles WHERE plant_id = $1;",
      [plantId]
    );
    client.release();

    return result.rows[0] || { risk_score: 0 }; // Default to 0 if no record found
  } catch (error) {
    console.error("Error fetching risk score:", error);
    throw new Error("Failed to fetch risk score");
  }
}
