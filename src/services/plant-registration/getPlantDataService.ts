import pool from "@/lib/db";

export const fetchPlantData = async () => {
  try {
    const [fuelResult, stageResult] = await Promise.all([
      pool.query("SELECT fuel_id, fuel_name FROM fuel_types;"),
      pool.query("SELECT stage_id, stage_name FROM plant_stages;"),
    ]);

    return {
      fuel: fuelResult.rows,
      stage: stageResult.rows,
    };
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Database query failed");
  }
};
