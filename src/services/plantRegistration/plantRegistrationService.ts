import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export class PlantRegistrationService {
  // Fetch initial data: address, fuel, and plant stages
  static async fetchFormData() {
    const queries = {
      address: "SELECT country, region FROM address;",
      fuel: "SELECT fuel_id, fuel_name FROM fuel_types;",
      stage: "SELECT stage_id, stage_name FROM plant_stages;",
    };

    try {
      const [addressResult, fuelResult, stageResult] = await Promise.all([
        pool.query(queries.address),
        pool.query(queries.fuel),
        pool.query(queries.stage),
      ]);

      return {
        address: addressResult.rows,
        fuel: fuelResult.rows,
        stage: stageResult.rows,
      };
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Database query failed");
    }
  }

  // Register a new plant with associated operator from session
  static async registerPlant(req: NextRequest, body: any) {
    const userSub = await getSessionUser(req);

    // Get user ID from sub
    const userResult = await pool.query(
      `SELECT user_id FROM users WHERE "auth0Sub" = $1`,
      [userSub]
    );

    if (userResult.rowCount === 0) {
      throw new Error("User not found");
    }

    const operatorId = userResult.rows[0].user_id;

    const {
      plantName,
      fuelType,
      address,
      plantStage,
      certification,
    } = body;

    try {
      const insertResult = await pool.query(
        `INSERT INTO plants (plant_name, fuel_type, address_id, stage_id, operator_id, has_certification)
         VALUES ($1, $2, (SELECT address_id FROM address WHERE region = $3), $4, $5, $6)
         RETURNING *`,
        [plantName, fuelType, address, plantStage, operatorId, certification]
      );

      return insertResult.rows[0];
    } catch (error) {
      console.error("Error inserting plant:", error);
      throw new Error("Failed to register plant");
    }
  }
}
