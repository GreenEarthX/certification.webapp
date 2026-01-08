import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export class PlantService {
  static async getUserPlants(req: NextRequest) {
    try {
      const userSub = await getSessionUser(req);

      const query = `
        SELECT 
          p.plant_id, 
          p.plant_name
        FROM users u
        JOIN plants p ON u.user_id = p.operator_id
        WHERE u.auth0sub = $1;
      `;

      const { rows } = await pool.query(query, [userSub]);
      return rows;
    } catch (error) {
      console.error("Error fetching user plants:", error);
      if (error instanceof Error && error.message === "Unauthorized") {
        throw error;
      }
      throw new Error("Failed to fetch user plants");
    }
  }
}
