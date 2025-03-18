import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: parseInt(process.env.PG_PORT || "5432", 10), // Default to 5432 if PG_PORT is missing
  database: process.env.PG_DATABASE || "db",
  user: process.env.PG_USER || "avnadmin",
  password: process.env.PG_PASSWORD || "",
  ssl: {
    rejectUnauthorized: false, // Aiven requires SSL
  },
});

export default pool;
