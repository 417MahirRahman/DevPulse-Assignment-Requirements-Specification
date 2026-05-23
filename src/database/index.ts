import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connection_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id          SERIAL PRIMARY KEY,
                name        TEXT NOT NULL,
                email       TEXT NOT NULL UNIQUE,
                password    TEXT NOT NULL,
                role        TEXT DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
                id          SERIAL PRIMARY KEY,
                title       VARCHAR(150) NOT NULL,
                description TEXT NOT NULL CHECK (char_length(description) >= 20),
                type        TEXT NOT NULL CHECK (type IN ('bug', 'feature_request')),
                status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN('open','in_progress', 'resolved')),
                reporter_id INTEGER NOT NULL,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);

    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
