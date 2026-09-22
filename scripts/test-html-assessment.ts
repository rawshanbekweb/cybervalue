import "dotenv/config";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const connectionString = process.env.DATABASE_URL;
if (!connectionString || new URL(connectionString).hostname !== "127.0.0.1")
  throw new Error("This test harness requires a local database at 127.0.0.1.");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const email = `html-test-${randomUUID()}@example.test`;
const password = randomUUID();
const prefix = `html-e2e-${randomUUID()}`;
const user = await db.user.create({
  data: {
    name: "Disposable HTML assessment test",
    email,
    passwordHash: hashPassword(password),
  },
});
try {
  const result = spawnSync(
    process.execPath,
    [
      "node_modules/@playwright/test/cli.js",
      "test",
      "tests/e2e/html-assessment.spec.ts",
      "--workers=1",
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        E2E_HTML_ASSESSMENT: "true",
        E2E_HTML_PREFIX: prefix,
        E2E_ADMIN_EMAIL: email,
        E2E_ADMIN_PASSWORD: password,
      },
    },
  );
  process.exitCode = result.status ?? 1;
} finally {
  await db.htmlExam.deleteMany({ where: { title: { startsWith: prefix } } });
  await db.user.delete({ where: { id: user.id } });
  await db.$disconnect();
}
