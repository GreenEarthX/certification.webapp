import pool from "@/lib/db";
import { Plant } from "@/models/plant";

class PlantService {
  async getPlants(userSub: string): Promise<Plant[]> {
    try {
      const query = `
        SELECT
          p.plant_id AS "id",  
          p.plant_name AS "name",
          p.fuel_id AS "fuel_id",  
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

  async deletePlantById(userSub: string, plantId: number): Promise<void> {
    try {
      const query = `
        DELETE FROM plants
        WHERE plant_id = $1 AND operator_id = (
          SELECT user_id FROM users WHERE auth0sub = $2
        )
      `;
      await pool.query(query, [plantId, userSub]);
    } catch (error) {
      console.error("Error deleting plant:", error);
      throw new Error("Failed to delete plant");
    }
  }
  

  async getPlantDetailsById(plantId: number): Promise<any> {
    try {
      const result = await pool.query(
        'SELECT plant_details FROM plants WHERE plant_id = $1',
        [plantId]
      );

      if (result.rows.length === 0) {
        throw new Error("Plant not found");
      }

      return result.rows[0].plant_details;
    } catch (error) {
      console.error("Error fetching plant details:", error);
      throw new Error("Failed to fetch plant details");
    }
  }

  async updatePlantDetailsById(plantId: number, data: any): Promise<void> {
    try {
      await pool.query(
        `UPDATE plants
         SET plant_details = $1
         WHERE plant_id = $2`,
        [data, plantId]
      );
    } catch (error) {
      console.error("Error updating plant details:", error);
      throw new Error("Failed to update plant details");
    }
  }
}

export const plantService = new PlantService();
