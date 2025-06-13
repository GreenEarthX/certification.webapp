import pool from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export class CertificationsService {
  static async getList(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const plantId = searchParams.get("plantId");
    if (!plantId) throw new Error("Missing plant ID");

    const userSub = await getSessionUser(req);

    const client = await pool.connect();
    try {
      const ownership = await client.query(
        `SELECT 1 FROM plants p JOIN users u ON p.operator_id = u.user_id WHERE p.plant_id = $1 AND u.auth0sub = $2`,
        [plantId, userSub]
      );
      if (!ownership.rowCount) throw new Error("Unauthorized");

      const res = await client.query(
        `SELECT 
          c.certification_id, 
          cs.certification_scheme_name, 
          ib.ib_name AS entity, 
          c.created_at, 
          c.status,
          cs.certification_details->>'framework' AS framework
         FROM certifications c
         JOIN certification_schemes cs ON c.certification_scheme_id = cs.certification_scheme_id
         LEFT JOIN issuing_bodies ib ON c.ib_id = ib.ib_id
         WHERE c.plant_id = $1;`,
        [plantId]
      );

      return res.rows.map(cert => ({
        id: cert.certification_id,
        name: cert.certification_scheme_name,
        entity: cert.entity || "Unknown Entity",
        date: new Date(cert.created_at).toLocaleDateString(),
        type: cert.framework || "Unknown",
        status: cert.status,
      }));
    } finally {
      client.release();
    }
  }

  static async getSummary(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const plantId = searchParams.get("plantId");
    if (!plantId) throw new Error("Missing plant ID");

    const userSub = await getSessionUser(req);
    const client = await pool.connect();

    try {
      const ownership = await client.query(
        `SELECT 1 FROM plants p JOIN users u ON p.operator_id = u.user_id WHERE p.plant_id = $1 AND u.auth0sub = $2`,
        [plantId, userSub]
      );
      if (!ownership.rowCount) throw new Error("Unauthorized");

      const result = await client.query(
        `SELECT status, COUNT(*) AS count FROM certifications WHERE plant_id = $1 GROUP BY status`,
        [plantId]
      );

      const stats = {
        active: 0,
        pending: 0,
        expired: 0,
        rejected: 0,
      };

      result.rows.forEach(row => {
        if (row.status === "Active") stats.active = Number(row.count);
        if (row.status === "Expiring") stats.pending = Number(row.count);
        if (row.status === "Expired") stats.expired = Number(row.count);
        if (row.status === "Rejected") stats.rejected = Number(row.count);
      });

      return stats;
    } finally {
      client.release();
    }
  }

}
