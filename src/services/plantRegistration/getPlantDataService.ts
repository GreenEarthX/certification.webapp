import pool from "@/lib/db";

export const fetchPlantData = async () => {
  const queries = {
    address: "SELECT country, region FROM address;",
    fuel: "SELECT fuel_id, fuel_name FROM fuel_types;",
    stage: "SELECT stage_id, stage_name FROM plant_stages;",
  };

  try {
    const [addressResult, fuelResult, stageResult] = await Promise.all([
      pool.query(queries.address),
      pool.query(queries.fuel),
      pool.query(queries.stage),
    ]);

    return {
      address: addressResult.rows,
      fuel: fuelResult.rows,
      stage: stageResult.rows,
    };
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Database query failed");
  }
};
