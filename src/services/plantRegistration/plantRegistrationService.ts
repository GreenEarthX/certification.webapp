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
  static async registerPlant(req: NextRequest): Promise<any> {
    const auth0Sub = await getSessionUser(req);
    const { plantName, fuelType, address, plantStage } = await req.json();
  
    console.log("🔵 Received Data:", { plantName, fuelType, address, plantStage });
  
    // Get user ID
    const userRes = await pool.query(
      `SELECT user_id FROM users WHERE auth0sub = $1`,
      [auth0Sub]
    );
  
    if (userRes.rowCount === 0) {
      throw new Error("User not found");
    }
  
    const operatorId = userRes.rows[0].user_id;
  
    // Parse address
    const [country, region] = address.split(",").map((item: string) => item.trim());
  
    const addressRes = await pool.query(
      `SELECT address_id FROM address WHERE country = $1 AND region = $2`,
      [country, region]
    );
  
    if (addressRes.rowCount === 0) {
      throw new Error("Address not found");
    }
  
    const addressId = addressRes.rows[0].address_id;
  
    // Insert plant
    const insertPlantRes = await pool.query(
      `INSERT INTO plants (plant_name, operator_id, address_id, fuel_id, stage_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [plantName, operatorId, addressId, parseInt(fuelType), parseInt(plantStage)]
    );
  
    return insertPlantRes.rows[0];
  }
  

  static async registerCertification(body: CertificationRegistrationPayload) {
    const {
      plant_id,
      certificationName,
      certificationBody,
      //type,
      //entity,
      //issueDate,
      //validityDate,
      //certificateNumber,
      //compliesWith,
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
