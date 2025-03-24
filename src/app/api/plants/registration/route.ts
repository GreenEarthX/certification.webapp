import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { PlantRegistrationService } from "@/services/plantRegistration/plantRegistrationService";

export async function GET() {
  try {
    const data = await PlantRegistrationService.fetchFormData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch form data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth0Sub = await getSessionUser(req);
    const { plantName, fuelType, address, plantStage } = await req.json();
    console.log("🔵 Received Data:", { plantName, fuelType, address, plantStage });

    const userRes = await pool.query(
      `SELECT user_id FROM users WHERE "auth0Sub" = $1`,
      [auth0Sub]
    );

    if (userRes.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const operatorId = userRes.rows[0].user_id;

    const [country, region] = address.split(",").map((item: string) => item.trim());
    const addressRes = await pool.query(
      `SELECT address_id FROM address WHERE country = $1 AND region = $2`,
      [country, region]
    );

    if (addressRes.rowCount === 0) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const addressId = addressRes.rows[0].address_id;

    const insertPlantRes = await pool.query(
      `INSERT INTO plants (plant_name, operator_id, address_id, fuel_id, stage_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [plantName, operatorId, addressId, parseInt(fuelType), parseInt(plantStage)]
    );

    return NextResponse.json({ plant: insertPlantRes.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Plant registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await PlantRegistrationService.registerCertification(body);
    return NextResponse.json({ certification: result }, { status: 201 });
  } catch (error) {
    console.error("Certification registration error:", error);
    return NextResponse.json({ error: "Certification failed" }, { status: 500 });
  }
}

