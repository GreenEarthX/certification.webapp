import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: parseInt(process.env.PG_PORT || "5432", 10),
  database: process.env.PG_DATABASE || "db",
  user: process.env.PG_USER || "avnadmin",
  password: process.env.PG_PASSWORD || "",
  ssl: {
    rejectUnauthorized: false, // Aiven requires SSL
  },
});
 
export default pool;
