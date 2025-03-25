// src/services/stats/statsService.ts
import pool from "@/lib/db";

class StatsService {
  async getStats(userSub: string) {
    try {
      const query = `
        SELECT 
          COALESCE(SUM(CASE WHEN c.status = 'Active' THEN 1 ELSE 0 END), 0) AS active,
          COALESCE(SUM(CASE WHEN c.status = 'Expired' THEN 1 ELSE 0 END), 0) AS expired,
          COALESCE(SUM(CASE WHEN c.status = 'Pending' THEN 1 ELSE 0 END), 0) AS pending,
          COALESCE(SUM(CASE WHEN c.status = 'Rejected' THEN 1 ELSE 0 END), 0) AS rejected

        FROM users u
        JOIN plants p ON u.user_id = p.operator_id
        JOIN certifications c ON c.plant_id = p.plant_id
        WHERE u.auth0sub = $1;
      `;

      const { rows } = await pool.query(query, [userSub]);
      const stats = rows[0];

      return {
        active: stats.active || 0,
        pending: stats.pending || 0,
        expired: stats.expired || 0,
        rejected: stats.rejected || 0,
      };
    } catch (error) {
      console.error("Error fetching certification stats:", error);
      throw new Error("Failed to fetch certification stats");
    }
  }

  async getStatsByPlant(userSub: string, plantId: number) {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN c.status = 'Active' THEN 1 ELSE 0 END), 0) AS active,
        COALESCE(SUM(CASE WHEN c.status = 'Expired' THEN 1 ELSE 0 END), 0) AS expired,
        COALESCE(SUM(CASE WHEN c.status = 'Pending' THEN 1 ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN c.status = 'Rejected' THEN 1 ELSE 0 END), 0) AS rejected
      FROM users u
      JOIN plants p ON u.user_id = p.operator_id
      JOIN certifications c ON c.plant_id = p.plant_id
      WHERE u."auth0Sub" = $1 AND p.plant_id = $2;
    `;
    const { rows } = await pool.query(query, [userSub, plantId]);
    const stats = rows[0];
    return stats ?? { active: 0, expired: 0, pending: 0, rejected: 0 };
  }
}

export const statsService = new StatsService();
