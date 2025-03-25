import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export class RecommendationService {
  static async getRecommendationsByPlant(req: NextRequest): Promise<string[]> {
    const { searchParams } = new URL(req.url);
    const plantId = searchParams.get("plantId");

    if (!plantId) {
      throw new Error("Missing plant ID");
    }

    const userSub = await getSessionUser(req);

    const client = await pool.connect();

    try {
      // Ensure plant belongs to current user
      const ownershipCheck = await client.query(
        `SELECT 1
         FROM plants p
         JOIN users u ON p.operator_id = u.user_id
         WHERE p.plant_id = $1 AND u.auth0sub = $2`,
        [plantId, userSub]
      );

      if (!ownershipCheck.rowCount) {
        throw new Error("Unauthorized access");
      }

      // Fetch recommendations
      const result = await client.query(
        `SELECT cs.certification_scheme_name 
         FROM recommendations r
         JOIN certification_schemes cs ON r.certification_scheme_id = cs.certification_scheme_id
         WHERE r.plant_id = $1;`,
        [plantId]
      );

      return result.rows.map((rec) => rec.certification_scheme_name);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw new Error("Failed to fetch recommendations");
    } finally {
      client.release();
    }
  }
}
