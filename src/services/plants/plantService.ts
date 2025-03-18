import pool from "@/lib/db";
import { Plant } from "@/models/plant";

export async function getPlants(): Promise<Plant[]> {
  try {
    const query = `
      SELECT
        p.plant_id AS "id",  
        p.plant_name AS "name",
        ft.fuel_name AS "type",
        CONCAT(a.country, ' / ', a.region) AS "address",
        COALESCE(rp.risk_score, 0) AS "riskScore"
      FROM plants p
      LEFT JOIN fuel_types ft ON p.fuel_id = ft.fuel_id
      LEFT JOIN address a ON p.address_id = a.address_id
      LEFT JOIN risk_profiles rp ON p.plant_id = rp.plant_id;
    `;

    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching plants from DB:", error);
    throw new Error("Failed to fetch plant data");
  }
}
