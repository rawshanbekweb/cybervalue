import { getSession, scopeOf } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { toCsv } from "@/lib/student/results";
import { scoreboard } from "@/lib/challenges/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The full standings as CSV for organisers, live even during a freeze. */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !scopeOf(session).owner)
    return new Response("Not found", { status: 404 });
  const id = new URL(request.url).searchParams.get("event") ?? "";
  const db = getDb();
  const event = await db?.ctfEvent.findUnique({ where: { id } });
  if (!db || !event) return new Response("Not found", { status: 404 });
  const board = await scoreboard(event, true);
  const entrants = await db.ctfEntrant.findMany({
    where: { eventId: id },
    select: {
      id: true,
      team: {
        select: { members: { select: { username: true, email: true } } },
      },
      player: { select: { username: true, email: true } },
    },
  });
  const people = new Map(
    entrants.map((e) => [
      e.id,
      e.team?.members ?? (e.player ? [e.player] : []),
    ]),
  );
  const csv = toCsv([
    [
      "Rank",
      "Name",
      "Type",
      "Points",
      "Solved",
      "First bloods",
      "Last solve",
      "Members",
      "Emails",
    ],
    ...board.rows.map((r) => [
      r.rank,
      r.name,
      r.team ? "team" : "solo",
      r.score,
      r.solved,
      r.firstBloods,
      r.lastSolveAt?.toISOString() ?? "",
      (people.get(r.entrantId) ?? []).map((p) => p.username).join(" "),
      (people.get(r.entrantId) ?? []).map((p) => p.email).join(" "),
    ]),
  ]);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ctf-${event.slug}-results.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
