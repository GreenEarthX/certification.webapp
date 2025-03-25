import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plantId = searchParams.get("plantId");

  if (!plantId) {
    return NextResponse.json({ error: "Missing plant ID" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `SELECT c.certification_id, cs.certification_scheme_name, c.ib_id
       FROM certifications c
       JOIN certification_schemes cs ON c.certification_scheme_id = cs.certification_scheme_id
       WHERE c.plant_id = $1 AND c.status = 'Pending';`,
      [plantId]
    );

    return NextResponse.json(
      result.rows.map(req => ({
        name: req.certification_scheme_name,
        entity: `Entity #${req.ib_id}`,
        progress: Math.floor(Math.random() * 100), // Fake progress for now
      }))
    );
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
