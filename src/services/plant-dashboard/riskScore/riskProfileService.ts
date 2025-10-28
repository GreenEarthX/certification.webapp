import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export class RiskProfileService {
  static async getRiskScoreByPlant(req: NextRequest): Promise<{ risk_score: number }> {
    const { searchParams } = new URL(req.url);
    const plantId = searchParams.get("plantId");

    if (!plantId) {
      throw new Error("Missing plant ID");
    }

    const userSub = await getSessionUser(req);
    const client = await pool.connect();

    try {
      // Ensure user owns the plant
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

      const result = await client.query(
        `SELECT risk_score FROM risk_profiles WHERE plant_id = $1`,
        [plantId]
      );

      return result.rows[0] || { risk_score: 0 };
    } catch (error) {
      console.error("Error fetching risk score:", error);
      throw new Error("Failed to fetch risk score");
    } finally {
      client.release();
    }
  }
}
