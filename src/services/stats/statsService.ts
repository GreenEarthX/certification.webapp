import pool from "@/lib/db";

export async function getStats() {
  try {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END), 0) AS active,
        COALESCE(SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END), 0) AS expired,
        COALESCE(SUM(CASE WHEN status = 'Expiring' THEN 1 ELSE 0 END), 0) AS expiring
      FROM certifications;
    `;

    const { rows } = await pool.query(query);
    const data = rows[0];

    return {
      active: data.active || 0,
      expired: data.expired || 0,
      expiring: data.expiring || 0,
      pending: 0,  // Always return 0
      rejected: 0  // Always return 0
    };
  } catch (error) {
    console.error("Error fetching certification stats:", error);
    throw new Error("Failed to fetch certification stats");
  }
}
