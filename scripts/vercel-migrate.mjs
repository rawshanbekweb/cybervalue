import { spawnSync } from "node:child_process";

// Only production deploys change the production schema. Preview builds share
// the same DATABASE_URL today, and two deploys migrating at once fight over
// Prisma's advisory lock (P1002). Set RUN_MIGRATIONS=1 to force a run.
const env = process.env.VERCEL_ENV;
if (env && env !== "production" && process.env.RUN_MIGRATIONS !== "1") {
  console.log(`Skipping prisma migrate deploy for VERCEL_ENV=${env}.`);
  process.exit(0);
}
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
