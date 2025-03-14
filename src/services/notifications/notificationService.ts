import pool from "@/lib/db";

export async function getNotifications() {
  try {
    const query = `SELECT * FROM notifications ORDER BY timestamp DESC`;
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

export async function updateNotificationReadStatus(id: string) {
  try {
    const result = await pool.query(
      "UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *;",
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error("Notification not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error updating notification:", error);
    throw new Error("Failed to update notification");
  }
}
