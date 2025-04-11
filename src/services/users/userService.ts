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
