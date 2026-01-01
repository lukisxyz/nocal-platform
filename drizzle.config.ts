import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL not found")

export default defineConfig({
  schema: "./src/lib/db-schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});

