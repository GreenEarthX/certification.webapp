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
      `SELECT status, COUNT(*) AS count FROM certifications 
       WHERE plant_id = $1 GROUP BY status;`,
      [plantId]
    );

    const stats = {
      active: 0,
      pending: 0,
      expired: 0,
      rejected: 0,
    };

    result.rows.forEach(row => {
      if (row.status === "Active") stats.active = row.count;
      if (row.status === "Expiring") stats.pending = row.count;
      if (row.status === "Expired") stats.expired = row.count;
      if (row.status === "Rejected") stats.rejected = row.count;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
