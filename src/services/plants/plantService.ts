import pool from "@/lib/db";
import { Plant } from "@/models/plant";

class PlantService {
  async getPlants(userSub: string): Promise<Plant[]> {
    try {
      const query = `
        SELECT
          p.plant_id AS "id",  
          p.plant_name AS "name",
          ft.fuel_name AS "type",
          CONCAT(a.country, ' / ', a.region) AS "address",
          COALESCE(rp.risk_score, 0) AS "riskScore"
        FROM users u
        JOIN plants p ON u.user_id = p.operator_id
        LEFT JOIN fuel_types ft ON p.fuel_id = ft.fuel_id
        LEFT JOIN address a ON p.address_id = a.address_id
        LEFT JOIN risk_profiles rp ON p.plant_id = rp.plant_id
        WHERE u.auth0sub = $1;
      `;

      const { rows } = await pool.query(query, [userSub]);
      return rows;
    } catch (error) {
      console.error("Error fetching plants from DB:", error);
      throw new Error("Failed to fetch plant data");
    }
  }

  // 🧩 You can add more methods later like:
  // async getPlantById(id: string) { ... }
  // async registerPlant(data: PlantInput) { ... }
}

export const plantService = new PlantService();
