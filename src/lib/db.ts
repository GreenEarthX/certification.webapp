// src/lib/db.ts

import { Pool } from "pg";

import dotenv from "dotenv";
 
dotenv.config();
 
// Check if host is a cloud provider that requires SSL

const connectionHost = process.env.DATABASE_URL || process.env.DB_HOST || "";

const requiresSsl = true ;


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
 
  ssl: requiresSsl ? { rejectUnauthorized: false } : false,

});
 
export default pool;
 