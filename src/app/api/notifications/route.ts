import { NextResponse } from "next/server";
import pool from "@/lib/db";

// API Route - Fetch notifications
export async function GET() {
  try {
    const query = `SELECT * FROM notifications ORDER BY timestamp DESC`;
    const { rows } = await pool.query(query);
    
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
