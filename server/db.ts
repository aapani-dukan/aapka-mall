import dotenv from "dotenv";
dotenv.config();
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  } else {
    console.warn("⚠️ DATABASE_URL not set, skipping DB init for local dev.");
  }
}

export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : undefined;
export const db = databaseUrl ? drizzle({ client: pool!, schema }) : undefined;
