import { Pool } from "pg";
import "dotenv/config";

// Single shared connection pool. DATABASE_URL comes from .env, e.g.:
// DATABASE_URL=postgresql://user:password@localhost:5432/oweru_agent
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  // Catches idle client errors so one bad connection doesn't crash the server
  console.error("Unexpected Postgres pool error:", err);
});
