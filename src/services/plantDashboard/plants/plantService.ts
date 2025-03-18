import pool from "@/lib/db";

export async function getPlants() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT plant_id, plant_name FROM plants;");
    client.release();
    
    return result.rows;
  } catch (error) {
    console.error("Error fetching plants:", error);
    throw new Error("Failed to fetch plants");
  }
}
