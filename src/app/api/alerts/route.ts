import { NextResponse } from "next/server";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432, 
});

// API Route - Fetch alerts
export async function GET() {
  try {
    const query = `
      SELECT 
        alert_description AS title, 
        alert_severity AS severity, 
        timestamp
      FROM alerts;
    `;

    const { rows } = await pool.query(query);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching alerts:", error);

    return new Response(JSON.stringify({ error: "Failed to fetch alerts" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
