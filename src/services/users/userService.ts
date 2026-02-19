import pool from "@/lib/db";

export class UserService {

  static async getUserBySub(auth0Sub: string) {
    const result = await pool.query(
      `
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        u.user_role,
        u.position,
        u.company,
        u.auth0sub,
        u.created_at,
        a.address_id,
        a.street,
        a.city,
        a.state,
        a.postal_code,
        a.country,
        a.region
      FROM users u
      LEFT JOIN address a ON a.address_id = u.address_id
      WHERE u.auth0sub = $1
      `,
      [auth0Sub]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      user_id: row.user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone_number: row.phone_number,
      user_role: row.user_role,
      position: row.position,
      company: row.company,
      auth0sub: row.auth0sub,
      created_at: row.created_at,
      address: row.address_id
        ? {
            address_id: row.address_id,
            street: row.street,
            city: row.city,
            state: row.state,
            postal_code: row.postal_code,
            country: row.country,
            region: row.region,
          }
        : null,
    };
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

  static async removeUser(userId: number) {
    const result = await pool.query(
      `DELETE FROM users WHERE user_id = $1 RETURNING *`,
      [userId]
    );

    return result.rows[0];
  }


  static async completeUserProfile(auth0Sub: string, data: {
    firstName: string;
    lastName: string;
    company: string;
    position: string;
    phoneNumber: string;
    address: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
  }) {
    const {
      firstName,
      lastName,
      company,
      position,
      phoneNumber,
      address,
      country,
      state,
      city,
      postalCode,
    } = data;
  
    // Insert address
    const addressResult = await pool.query(
      `
      INSERT INTO address (street, city, state, postal_code, country)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING address_id
      `,
      [address, city, state, postalCode, country]
    );
  
    const addressId = addressResult.rows[0].address_id;
  
    // Update user with profile info
    await pool.query(
      `
      UPDATE users
      SET
        first_name = $1,
        last_name = $2,
        company = $3,
        position = $4,
        phone_number = $5,
        address_id = $6
      WHERE auth0sub = $7
      `,
      [
        firstName,
        lastName,
        company,
        position,
        phoneNumber,
        addressId,
        auth0Sub,
      ]
    );
  
    return { success: true };
  }
  
  static async needsProfileCompletion(auth0Sub: string) {
    const result = await pool.query(
      'SELECT first_name FROM users WHERE auth0sub = $1',
      [auth0Sub]
    );
  
    return !result.rows[0]?.first_name;
  }
  

}
