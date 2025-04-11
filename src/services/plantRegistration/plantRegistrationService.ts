import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export class PlantRegistrationService {
  // Fetch initial data: fuel, and plant stages
  static async fetchFormData() {
    const [fuelResult, stageResult] = await Promise.all([
      pool.query("SELECT fuel_id, fuel_name FROM fuel_types;"),
      pool.query("SELECT stage_id, stage_name FROM plant_stages;"),
    ]);

    return {
      fuel: fuelResult.rows,
      stage: stageResult.rows,
    };
  }

  static async registerPlant(req: NextRequest): Promise<any> {
    const auth0Sub = await getSessionUser(req);
    const { plantName, fuelType, address, plantStage } = await req.json();

    console.log(" Received Data:", { plantName, fuelType, address, plantStage });

    // Get operator_id
    const userRes = await pool.query(
      `SELECT user_id FROM users WHERE auth0sub = $1`,
      [auth0Sub]
    );

    if (userRes.rowCount === 0) {
      throw new Error("User not found");
    }

    const operatorId = userRes.rows[0].user_id;

    //  Insert full address
    const addressInsert = await pool.query(
      `
      INSERT INTO address (street, city, state, postal_code, country)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING address_id
    `,
      [
        address.street,
        address.city,
        address.state,
        address.postalCode,
        address.country,
      ]
    );

    const addressId = addressInsert.rows[0].address_id;

    // Insert plant with that address_id
    const plantInsert = await pool.query(
      `
      INSERT INTO plants (plant_name, operator_id, address_id, fuel_id, stage_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [
        plantName,
        operatorId,
        addressId,
        parseInt(fuelType),
        parseInt(plantStage),
      ]
    );

    return plantInsert.rows[0];
  }

  
  
  fetchFormData = async () => {
    const res = await fetch("/api/plants/registration");
    if (!res.ok) throw new Error("Failed to fetch form data");
    return res.json();
  };
  
  submitPlantRegistration = async (formData: any) => {
    const res = await fetch("/api/plants/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    
    if (!res.ok) throw new Error("Failed to submit plant data");
  
    return res.json();
  };
  
  

}
