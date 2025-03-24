import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { CertificationRegistrationPayload } from "@/models/plantRegistration";

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

  static async registerCertification(body: CertificationRegistrationPayload) {
    const {
      plant_id,
      certificationName,
      certificationBody,
      type,
      entity,
      issueDate,
      validityDate,
      certificateNumber,
      compliesWith,
    } = body;

    try {
      // 1. Get certification_scheme_id
      const schemeRes = await pool.query(
        `SELECT certification_scheme_id FROM certification_schemes WHERE certification_scheme_name = $1`,
        [certificationName]
      );

      if (schemeRes.rowCount === 0) {
        throw new Error("Certification scheme not found");
      }

      const certification_scheme_id = schemeRes.rows[0].certification_scheme_id;

      // 2. Insert certification
      const insertRes = await pool.query(
        `
        INSERT INTO certifications (
          plant_id, certification_scheme_id, ib_id, status, created_at
        ) VALUES (
          $1, $2,
          (SELECT ib_id FROM issuing_bodies WHERE ib_name = $3),
          'Pending',
          NOW()
        )
        RETURNING *
        `,
        [plant_id, certification_scheme_id, certificationBody]
      );

      return insertRes.rows[0];
    } catch (error) {
      console.error("Error registering certification:", error);
      throw new Error("Certification registration failed");
    }
  }

}
