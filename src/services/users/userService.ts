import pool from "@/lib/db";

export class UserService {
  static async getUserBySub(auth0Sub: string) {
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email FROM users WHERE "auth0Sub" = $1`,
      [auth0Sub]
    );

    return result.rows[0] || null;
  }

  static async addUser({ firstName, lastName, email, auth0Sub }: {
    firstName: string;
    lastName: string;
    email: string;
    auth0Sub: string;
  }) {
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, "auth0Sub")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [firstName, lastName, email, auth0Sub]
    );

    return result.rows[0];
  }

  static async removeUser(userId: number) {
    const result = await pool.query(
      `DELETE FROM users WHERE user_id = $1 RETURNING *`,
      [userId]
    );

    return result.rows[0];
  }
}
