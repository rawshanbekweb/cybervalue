import "server-only";
import { createHash } from "node:crypto";
import { getDb } from "./db";
import { allowShared, forgetRequests, type HitStore } from "./rate-limit";

// Keys can contain client addresses; only their hash is stored.
const digest = (key: string) => createHash("sha256").update(key).digest("hex");

const dbHits: HitStore = async (key, windowMs) => {
  const db = getDb();
  if (!db) throw new Error("No database");
  // One atomic statement: start a new window when the old one expired,
  // otherwise count the hit in the current one. Times come from the database
  // clock and a timestamptz column, so instance clocks and zones cannot skew it.
  const [row] = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "expiresAt")
    VALUES (${digest(key)}, 1, NOW() + make_interval(secs => ${windowMs / 1000}::float8))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."expiresAt" <= NOW()
        THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimitBucket"."expiresAt" <= NOW()
        THEN EXCLUDED."expiresAt" ELSE "RateLimitBucket"."expiresAt" END
    RETURNING "count"`;
  if (Math.random() < 0.01)
    await db.rateLimitBucket.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  return Number(row.count);
};

// Shared across serverless instances when a database is configured;
// process-local otherwise.
export function limit(key: string, max = 30, windowMs = 60_000) {
  return allowShared(key, max, windowMs, getDb() ? dbHits : null);
}

// Clears a client's budget, e.g. after a successful sign-in, so legitimate
// use does not count toward a lockout meant for guessing.
export async function resetLimit(key: string) {
  forgetRequests(key);
  await getDb()
    ?.rateLimitBucket.deleteMany({ where: { key: digest(key) } })
    .catch(() => undefined);
}
