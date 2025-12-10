// src/lib/dbSecond.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const secondPool = new Pool({
  connectionString: process.env.SECOND_DATABASE_URL,
  ...(process.env.SECOND_DATABASE_URL
    ? {}
    : {
        host: process.env.SECOND_DB_HOST,
        port: parseInt(process.env.SECOND_DB_PORT || "5432", 10),
        database: process.env.SECOND_DB_NAME,
        user: process.env.SECOND_DB_USERNAME,
        password: process.env.SECOND_DB_PASSWORD,
      }),

  ssl:
    process.env.NODE_ENV === "production" ||
    process.env.SECOND_DATABASE_URL?.includes("amazonaws.com") ||
    process.env.SECOND_DB_HOST?.includes(".aivencloud.com")
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

export default secondPool;
