// src/lib/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ...(process.env.DATABASE_URL
    ? {}
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
      }),

  ssl:
    process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("amazonaws.com") || process.env.DB_HOST?.includes(".aivencloud.com")
      ? {
          rejectUnauthorized: false, // obligatoire pour Aiven, Supabase, Neon, Railway
        }
      : false,
});

export default pool;
