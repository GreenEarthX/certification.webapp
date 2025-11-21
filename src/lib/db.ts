import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

/**
 * If running locally:
 *   NODE_ENV !== "production" → SSL is OFF
 * If running on cloud DB (Aiven, Neon, Supabase, Render):
 *   NODE_ENV === "production" → SSL ON
 */

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,

  // auto SSL switching
  ssl: isProduction
    ? { rejectUnauthorized: false } // cloud providers require SSL
    : false,                         // local postgres does NOT use SSL
});

export default pool;
