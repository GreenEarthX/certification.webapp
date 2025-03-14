import pool from "@/lib/db"; 
import { Alert } from "@/models/alert";

export async function getAlerts(): Promise<Alert[]> {
  try {
    const query = `
      SELECT 
        alert_description AS title, 
        alert_severity AS severity, 
        timestamp
      FROM alerts;
    `;

    const { rows } = await pool.query(query);
    return rows; 

  } catch (error) {
    console.error("Error fetching alerts from DB:", error);
    throw new Error("Failed to fetch alerts from the database");
  }
}
