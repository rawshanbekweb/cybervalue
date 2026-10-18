import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
import { telegramConfig } from "@/lib/telegram/api";
import { daily } from "@/lib/telegram/events";
import { markCronRun } from "@/lib/system";
import { purgeExpiredTrash } from "@/lib/trash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron calls this every morning with "Authorization: Bearer
// <CRON_SECRET>". Without the secret the job does not run.
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const secret = process.env.CRON_SECRET ?? "";
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (
    secret.length < 16 ||
    given.length !== expected.length ||
    !timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  )
    return Response.json({ error: "unauthorized" }, { status: 401, headers });
  const db = getDb();
  if (!db)
    return Response.json({ error: "no database" }, { status: 503, headers });
  // Old log entries only keep the tables small.
  await db.notificationLog.deleteMany({
    where: { sentAt: { lt: new Date(Date.now() - 30 * 86_400_000) } },
  });
  await db.errorEvent.deleteMany({
    where: { resolvedAt: { lt: new Date(Date.now() - 90 * 86_400_000) } },
  });
  await purgeExpiredTrash(db);
  await markCronRun(db);
  if (!telegramConfig())
    return Response.json({ skipped: "telegram not configured" }, { headers });
  return Response.json(await daily(db), { headers });
}
