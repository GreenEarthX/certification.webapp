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

  async upsertPlantForm(data: {
    coverage_id: number;
    section_general_info: any;
    section_market_and_offtakers: any;
    section_electricity_water: any;
    section_ghg_reduction: any;
    section_traceability: any;
    section_certifications: any;
  }): Promise<void> {
    const {
      coverage_id,
      section_general_info,
      section_market_and_offtakers,
      section_electricity_water,
      section_ghg_reduction,
      section_traceability,
      section_certifications,
    } = data;

    try {
      await pool.query(
        `INSERT INTO manage_plants_forms (
          coverage_id,
          section_general_info,
          section_market_and_offtakers,
          section_electricity_water,
          section_ghg_reduction,
          section_traceability,
          section_certifications
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (coverage_id) DO UPDATE SET
          section_general_info = EXCLUDED.section_general_info,
          section_market_and_offtakers = EXCLUDED.section_market_and_offtakers,
          section_electricity_water = EXCLUDED.section_electricity_water,
          section_ghg_reduction = EXCLUDED.section_ghg_reduction,
          section_traceability = EXCLUDED.section_traceability,
          section_certifications = EXCLUDED.section_certifications`,
        [
          coverage_id,
          section_general_info,
          section_market_and_offtakers,
          section_electricity_water,
          section_ghg_reduction,
          section_traceability,
          section_certifications,
        ]
      );
    } catch (error) {
      console.error("Error upserting plant form:", error);
      throw new Error("Failed to save plant form");
    }
  }

  async getPlantFormByCoverageId(coverageId: string): Promise<any | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM manage_plants_forms WHERE coverage_id = $1',
        [coverageId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error fetching plant form:", error);
      throw new Error("Failed to fetch plant form");
    }
  }

}

export const plantService = new PlantService();
