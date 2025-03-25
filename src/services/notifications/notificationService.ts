import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export class NotificationService {
  static async getUserNotifications(req: NextRequest) {
    const userSub = await getSessionUser(req);

    const query = `
      SELECT n.*
      FROM notifications n
      JOIN users u ON n.recipient_id = u.user_id
      WHERE u.auth0sub = $1
      ORDER BY n.timestamp DESC;
    `;

    const { rows } = await pool.query(query, [userSub]);
    return rows;
  }

  static async markAsRead(req: NextRequest, id: string) {
    const userSub = await getSessionUser(req);

    const checkQuery = `
      SELECT n.id
      FROM notifications n
      JOIN users u ON n.recipient_id = u.user_id
      WHERE n.id = $1 AND u.auth0sub = $2;
    `;
    const checkResult = await pool.query(checkQuery, [id, userSub]);

    if (checkResult.rowCount === 0) {
      throw new Error("Notification not found or unauthorized");
    }

    const updateResult = await pool.query(
      `UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *;`,
      [id]
    );

    return updateResult.rows[0];
  }
}
