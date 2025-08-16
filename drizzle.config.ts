// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql", // Supabase is PostgreSQL
  schema: "./src/drizzle/schema.ts", // path to your Drizzle schema
  out: "./src/drizzle/migrations", // folder where migration files will go
  dbCredentials: {
    url: process.env.DATABASE_URL as string, // use your Supabase DATABASE_URL
  },
  migrations: {
    table: "__drizzle_migrations__", // optional, default is fine
    schema: "public", // Supabase default schema
  },
  strict: true, // enable strict mode for safety
  verbose: true, // log detailed info when generating/pushing
});
