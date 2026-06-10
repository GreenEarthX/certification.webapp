import pool from "@/lib/db";

/**
 * Fetch the operator ID associated with a given plant ID.
 * @param plantId number | string
 * @returns operator_id if found
 * @throws Error if not found or DB fails
 */
export async function getOperatorByPlantId(plantId: number | string): Promise<number> {
  const result = await pool.query(
    `SELECT operator_id FROM plants WHERE plant_id = $1`,
    [plantId]
  );

  if (result.rowCount === 0) {
    throw new Error("Plant not found");
  }

  return result.rows[0].operator_id;
}
