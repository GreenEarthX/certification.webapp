import { NextResponse } from "next/server";
import pool from "@/lib/db";


// API Route - Fetch plant details with type, address, and risk profile
export async function GET() {
  try {
    const query = `
      SELECT 
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
    
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching plant data:", error);
    return NextResponse.json({ error: "Failed to fetch plant data" }, { status: 500 });
  }
}
