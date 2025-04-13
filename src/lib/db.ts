import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "mydb",
  user: process.env.DB_USERNAME || "avnadmin",
  password: process.env.DB_PASSWORD || "",
  ssl: {
    rejectUnauthorized: false, // Aiven requires SSL
  },
});
 
export default pool;
