import pool from "@/lib/db";

export class UserService {

  static async getUserBySub(auth0Sub: string) {

    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email FROM users WHERE auth0sub = $1`,
      [auth0Sub]
    );
    
    return result.rows[0] || null;
  }

  static async createUser(email: string, auth0Sub: string) {
      const query = `
        INSERT INTO users (email, auth0sub, created_at)
        VALUES ($1, $2, NOW())
        RETURNING *;
      `;
      
      try {
        const result = await pool.query(query, [email, auth0Sub]);
        return result.rows[0];
      } catch (error) {
        console.error("User creation error:", error);
        throw error;
      }
    }

  /*
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
*/
  static async removeUser(userId: number) {
    const result = await pool.query(
      `DELETE FROM users WHERE user_id = $1 RETURNING *`,
      [userId]
    );

    return result.rows[0];
  }
}
