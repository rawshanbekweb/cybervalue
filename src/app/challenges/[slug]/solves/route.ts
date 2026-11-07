import { getDb } from "@/lib/db";
import { eventBySlug } from "@/lib/challenges/events";
import { phaseOf, scoreboardCutoff } from "@/lib/challenges/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { "Cache-Control": "no-store" } });

/**
 * The newest solves of a running competition after `since` (milliseconds),
 * for the "X solved Y" pop-ups on the board and scoreboard. It shows what
 * the public scoreboard shows: published events, no blocked entrants,
 * nothing after a freeze.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const event = await eventBySlug((await params).slug);
  if (!event) return json({ solves: [] }, 404);
  if (phaseOf(event) !== "running") return json({ solves: [] });
  const asked = Number(new URL(request.url).searchParams.get("since"));
  // At most ten minutes back, so a stale tab does not replay the day.
  const floor = Date.now() - 10 * 60_000;
  const since = new Date(
    Number.isFinite(asked) ? Math.max(asked, floor) : floor,
  );
  const cutoff = scoreboardCutoff(event);
  const db = getDb();
  if (!db) return json({ solves: [] });
  const solves = await db.ctfSolve.findMany({
    where: {
      challenge: { eventId: event.id },
      entrant: { banned: false },
      createdAt: { gt: since, ...(cutoff ? { lte: cutoff } : {}) },
    },
    orderBy: { createdAt: "asc" },
    take: 8,
    select: {
      id: true,
      createdAt: true,
      challengeId: true,
      entrant: { select: { name: true } },
      challenge: { select: { title: true, category: true } },
    },
  });
  const firsts = await Promise.all(
    solves.map((s) =>
      db.ctfSolve.findFirst({
        where: { challengeId: s.challengeId, entrant: { banned: false } },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      }),
    ),
  );
  return json({
    solves: solves.map((s, i) => ({
      id: s.id,
      at: s.createdAt.getTime(),
      name: s.entrant.name,
      title: s.challenge.title,
      category: s.challenge.category,
      first: firsts[i]?.id === s.id,
    })),
  });
}
