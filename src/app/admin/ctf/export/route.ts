import { getSession, scopeOf } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { TRANSFER_VERSION, type Transfer } from "@/lib/challenges/transfer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A competition as JSON, flags as salted digests, without files. */
export async function GET(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  const session = await getSession();
  if (!session || !scopeOf(session).owner)
    return new Response("Not found", { status: 404, headers });
  const id = new URL(request.url).searchParams.get("event") ?? "";
  const event = await getDb()?.ctfEvent.findUnique({
    where: { id },
    include: {
      challenges: {
        orderBy: [{ category: "asc" }, { position: "asc" }],
        include: {
          flags: { orderBy: { createdAt: "asc" } },
          hints: { orderBy: { position: "asc" } },
        },
      },
    },
  });
  if (!event) return new Response("Not found", { status: 404, headers });
  const keys = new Map(event.challenges.map((c, i) => [c.id, `c${i + 1}`]));
  const data = {
    version: TRANSFER_VERSION,
    event: {
      slug: event.slug,
      title: event.title,
      summary: event.summary,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      registrationEndsAt: event.registrationEndsAt,
      freezeAt: event.freezeAt,
      maxTeamSize: event.maxTeamSize,
      allowSolo: event.allowSolo,
    },
    challenges: event.challenges.map((c) => ({
      key: keys.get(c.id)!,
      title: c.title,
      category: c.category as Transfer["challenges"][number]["category"],
      description: c.description,
      releaseAt: c.releaseAt,
      requires: c.requiresId ? (keys.get(c.requiresId) ?? null) : null,
      maxAttempts: c.maxAttempts,
      initialPoints: c.initialPoints,
      minimumPoints: c.minimumPoints,
      decay: c.decay,
      visible: c.visible,
      position: c.position,
      flags: c.flags.map((f) => ({
        salt: f.salt,
        hash: f.hash,
        caseSensitive: f.caseSensitive,
      })),
      hints: c.hints.map((h) => ({ text: h.text, cost: h.cost })),
    })),
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="ctf-${event.slug}.json"`,
    },
  });
}
