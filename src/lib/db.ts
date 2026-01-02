import { createServerOnlyFn } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const getDatabase = createServerOnlyFn(() =>
  drizzle({ client: sql })
);

export const db = getDatabase();
