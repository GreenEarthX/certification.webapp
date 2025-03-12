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

// API Route - Update read status 
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // Extracts last segment (ID)

  if (!id) {
    return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *;",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

