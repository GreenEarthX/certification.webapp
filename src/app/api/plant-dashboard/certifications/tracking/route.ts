import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { authErrorResponse } from "@/lib/api-auth";
import { assertPlantOwnership } from "@/lib/ownership";

export async function GET(req: NextRequest) {
  try {
    // Previously unauthenticated with no ownership check, unlike its sibling
    // routes in this folder - any plant's pending certifications were
    // readable by id.
    const userSub = await getSessionUser(req);

    const { searchParams } = new URL(req.url);
    const plantId = searchParams.get("plantId");

    if (!plantId) {
      return NextResponse.json({ error: "Missing plant ID" }, { status: 400 });
    }

    await assertPlantOwnership(plantId, userSub);

    const result = await pool.query(
      `SELECT c.certification_id, cs.certification_scheme_name, c.ib_id
       FROM certifications c
       JOIN certification_schemes cs ON c.certification_scheme_id = cs.certification_scheme_id
       WHERE c.plant_id = $1 AND c.status = 'Pending';`,
      [plantId]
    );

    return NextResponse.json(
      result.rows.map(row => ({
        name: row.certification_scheme_name,
        entity: `Entity #${row.ib_id}`,
        progress: Math.floor(Math.random() * 100), // Fake progress for now
      }))
    );
  } catch (error) {
    const denied = authErrorResponse(error);
    if (denied) return denied;

    if (error instanceof Error && error.message === "Plant not found") {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    console.error("Database query error:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
