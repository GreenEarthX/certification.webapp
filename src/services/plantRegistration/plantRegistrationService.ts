import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextRequest } from "next/server";
import { CertificationRegistrationPayload } from "@/models/plantRegistration";


function formatDate(dateStr: string): string {
  // Converts "25/03/2025" → "2025-03-25"
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}
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

    console.log("🔵 Received Data:", { plantName, fuelType, address, plantStage });

    // Get operator_id
    const userRes = await pool.query(
      `SELECT user_id FROM users WHERE auth0sub = $1`,
      [auth0Sub]
    );

    if (userRes.rowCount === 0) {
      throw new Error("User not found");
    }

    const operatorId = userRes.rows[0].user_id;

    // 🆕 Insert full address
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

    // 🌱 Insert plant with that address_id
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


  

  static async registerCertification(body: CertificationRegistrationPayload) {
    const {
      plant_id,
      certificationName,
      certificationBody, // ← cb_name (string)
      issueDate,
      certificateNumber,
      entity, // ← ib_name (string from frontend)
    } = body;
  
    try {
      // 1. Get certification_scheme_id
      const schemeRes = await pool.query(
        `SELECT certification_scheme_id FROM certification_schemes WHERE certification_scheme_name = $1`,
        [certificationName.trim()]
      );
  
      if (schemeRes.rowCount === 0) {
        throw new Error("Certification scheme not found");
      }
  
      const certification_scheme_id = schemeRes.rows[0].certification_scheme_id;
  
      // 2. Validate certificationBody only if it's provided
      if (certificationBody && certificationBody.trim() !== "") {
        const cbRes = await pool.query(
          `
          SELECT cb.cb_id
          FROM certification_schemes_certification_bodies csb
          JOIN certification_bodies cb ON csb.cb_id = cb.cb_id
          WHERE csb.certification_scheme_id = $1 AND cb.cb_name = $2
          `,
          [certification_scheme_id, certificationBody.trim()]
        );

        if (cbRes.rowCount === 0) {
          throw new Error("Certification body not linked to this certification scheme");
        }
      }

  
      // 3. Get ib_id from entity (issuing body name)
      let ib_id: number | null = null;
      if (entity) {
        const ibRes = await pool.query(
          `SELECT ib_id FROM issuing_bodies WHERE ib_name = $1`,
          [entity.trim()]
        );
  
        if (ibRes.rows.length > 0) {
          ib_id = ibRes.rows[0].ib_id;
        } else {
          throw new Error("Issuing body not found for the provided entity");
        }
      }
  
      // 4. Insert certification with ib_id
      const insertRes = await pool.query(
        `
        INSERT INTO certifications (
          plant_id,
          certification_scheme_id,
          ib_id,
          status,
          issue_date,
          certificate_number,
          created_at
        )
        VALUES ($1, $2, $3, 'Active', $4, $5, NOW())
        RETURNING *
        `,
        [
          plant_id,
          certification_scheme_id,
          ib_id || null,
          issueDate ? formatDate(issueDate) : null,
          certificateNumber || null,
        ]
      );
  
      return insertRes.rows[0];
    } catch (error) {
      console.error("❌ Error registering certification:", error);
      throw new Error((error as Error).message || "Certification registration failed");
    }
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
  
    return res.json(); // returns { plant }
  };
  
  

}
