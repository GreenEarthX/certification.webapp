import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Ensure this file is only used on the server
if (typeof window !== "undefined") {
  throw new Error("db.ts should never be imported on the client side!");
}

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432, 
});

export default pool;
