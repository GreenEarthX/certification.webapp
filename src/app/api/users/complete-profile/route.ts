import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth0sub = await getSessionUser(req);
    const body = await req.json();

    const {
      firstName,
      lastName,
      company,
      position,
      phoneNumber,
      address,
      country,
      state,
      city,
      postalCode,
    } = body;

    // 1. Insert into address table
    const addressInsert = await pool.query(
      `
      INSERT INTO address (street, city, state, postal_code, country)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING address_id
      `,
      [address, city, state, postalCode, country]
    );

    const addressId = addressInsert.rows[0].address_id;

    // 2. Update user row
    await pool.query(
      `
      UPDATE users
      SET
        first_name = $1,
        last_name = $2,
        company = $3,
        position = $4,
        phone_number = $5,
        address_id = $6
      WHERE auth0sub = $7
      `,
      [
        firstName,
        lastName,
        company,
        position,
        phoneNumber,
        addressId,
        auth0sub,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to complete profile" }, { status: 500 });
  }
}
