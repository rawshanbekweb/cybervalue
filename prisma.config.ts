import "dotenv/config";
import { defineConfig } from "prisma/config";
import { migrationUrl } from "./scripts/migration-url.mjs";

// The CLI (migrate, studio) needs a direct connection: pgbouncer-style
// poolers cannot hold the session advisory lock that `migrate deploy` takes.
// The app itself keeps using DATABASE_URL through the pg adapter.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: migrationUrl(process.env) || "postgresql://localhost:5432/cybervalue",
  },
});
