// src/lib/ownership.ts
//
// Shared resource-ownership checks. Several routes accepted a plant id from
// the query string and returned that plant's data without checking who was
// asking (IDOR). Use these helpers so the check is written the same way
// everywhere.

import pool from "@/lib/db";

/**
 * Throws "Plant not found" unless `userSub` operates `plantId`.
 *
 * Deliberately reports a missing plant and someone else's plant identically -
 * distinguishing them tells an attacker which plant ids exist.
 */
export async function assertPlantOwnership(
  plantId: string | number,
  userSub: string
): Promise<void> {
  const result = await pool.query(
    `SELECT 1
     FROM plants p
     JOIN users u ON p.operator_id = u.user_id
     WHERE p.plant_id = $1 AND u.auth0sub = $2`,
    [plantId, userSub]
  );

  if (!result.rowCount) {
    throw new Error("Plant not found");
  }
}
