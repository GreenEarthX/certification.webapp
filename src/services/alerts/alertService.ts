import pool from "@/lib/db";
import { Alert } from "@/models/alert";

class AlertService {
  async getAlerts(userSub: string): Promise<Alert[]> {
    try {
      const query = `
        SELECT 
          a.alert_description AS title,
          a.alert_severity AS severity,
          a.timestamp
        FROM users u
        JOIN alert_recipients ar ON ar.user_id = u.user_id
        JOIN alerts a ON a.alert_id = ar.alert_id
        WHERE u.auth0sub = $1
        ORDER BY a.timestamp DESC;
      `;

      const { rows } = await pool.query(query, [userSub]);
      return rows;
    } catch (error) {
      console.error("Error fetching alerts from DB:", error);
      throw new Error("Failed to fetch alerts from the database");
    }
  }
}

export const alertService = new AlertService();
