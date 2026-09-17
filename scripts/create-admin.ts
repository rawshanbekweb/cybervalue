import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { env } from "../src/lib/env";

async function main() {
  const args = process.argv.slice(2);
  const emailFlagIndex = args.indexOf("--email");
  const email = emailFlagIndex >= 0 ? args[emailFlagIndex + 1] : undefined;
  if (!email)
    throw new Error(
      "Usage: npm run admin:create-user -- --email you@example.com",
    );
  if (!env.DATABASE_URL)
    throw new Error("Set DATABASE_URL before creating an admin account");

  const rl = createInterface({ input: stdin, output: stdout });
  const password = await rl.question("Password (min 12 characters): ");
  rl.close();
  if (password.length < 12)
    throw new Error("Password must be at least 12 characters");

  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    }),
    log: [],
  });
  try {
    const passwordHash = hashPassword(password);
    const user = await db.user.upsert({
      where: { id: "rawshanbek" },
      create: {
        id: "rawshanbek",
        name: "Rawshanbek Gayipbaev",
        email,
        passwordHash,
      },
      update: { email, passwordHash },
    });
    console.log(
      `Admin account ready for ${user.email}. Log in at /admin/login.`,
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((error: unknown) => {
  const message =
    error instanceof Error && !error.name.startsWith("Prisma")
      ? error.message
      : "Database operation failed. Check connectivity and migrations.";
  console.error(message);
  process.exitCode = 1;
});
