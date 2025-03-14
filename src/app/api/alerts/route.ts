import { NextResponse } from "next/server";
import pool from "@/lib/db";

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
