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

// API Route - Fetch certification status counts
export async function GET() {
  try {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END), 0) AS active,
        COALESCE(SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END), 0) AS expired,
        COALESCE(SUM(CASE WHEN status = 'Expiring' THEN 1 ELSE 0 END), 0) AS expiring
      FROM certifications;
    `;

    const { rows } = await pool.query(query);
    const data = rows[0];

    const responseData = {
      active: data.active || 0,
      expired: data.expired || 0,
      expiring: data.expiring || 0,
      pending: 0,  // Always return 0
      rejected: 0  // Always return 0
    };
    
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching certification stats:", error);
    return NextResponse.json({ error: "Failed to fetch certification stats" }, { status: 500 });
  }
}
