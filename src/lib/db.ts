import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export function getDb() {
  if (!env.DATABASE_URL) return null;
  if (!globalDb.prisma)
    globalDb.prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: env.DATABASE_URL,
        max: 5,
        connectionTimeoutMillis: 5000,
        statement_timeout: 10000,
      }),
      log: [],
    });
  return globalDb.prisma;
}
