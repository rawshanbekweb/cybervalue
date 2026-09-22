import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { env } from "../src/lib/env";
import { randomBytes } from "node:crypto";
import { z } from "zod";

async function main() {
  const args = process.argv.slice(2);
  const emailFlagIndex = args.indexOf("--email");
  const suppliedEmail =
    emailFlagIndex >= 0
      ? args[emailFlagIndex + 1]?.trim().toLowerCase()
      : undefined;
  const generate = args.includes("--generate-password");
  if (
    (!suppliedEmail && !generate) ||
    (suppliedEmail && !z.email().safeParse(suppliedEmail).success)
  )
    throw new Error(
      "Usage: npm run admin:create-user -- --email you@example.com [--generate-password]",
    );
  if (!env.DATABASE_URL)
    throw new Error("Set DATABASE_URL before creating an admin account");

  let password: string;
  if (generate) password = randomBytes(18).toString("base64url");
  else {
    const rl = createInterface({ input: stdin, output: stdout });
    password = await rl.question("Password (12–200 characters): ");
    rl.close();
  }
  if (password.length < 12 || password.length > 200)
    throw new Error("Password must have 12–200 characters");

  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    }),
    log: [],
  });
  try {
    const passwordHash = hashPassword(password);
    const existing = await db.user.findUnique({
      where: { id: "rawshanbek" },
      select: { email: true },
    });
    const email = suppliedEmail ?? existing?.email ?? "admin@cybervalue.local";
    const user = await db.$transaction(async (tx) => {
      const account = await tx.user.upsert({
        where: { id: "rawshanbek" },
        create: {
          id: "rawshanbek",
          name: "Rawshanbek Gayipbaev",
          email,
          passwordHash,
        },
        update: { email, passwordHash },
      });
      await tx.session.deleteMany({ where: { userId: account.id } });
      return account;
    });
    console.log(
      `Admin account ready for ${user.email}. Log in at /admin/login.`,
    );
    if (generate) console.log(`Generated password: ${password}`);
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
