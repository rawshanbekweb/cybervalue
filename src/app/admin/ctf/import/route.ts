import { getSession, scopeOf } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { audit } from "@/lib/audit";
import { RESERVED_SLUGS, slugPattern } from "@/lib/challenges/scoring";
import {
  importFlag,
  transferProblem,
  transferSchema,
} from "@/lib/challenges/transfer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;

/** Creates an unpublished competition from an exported or hand-written file. */
export async function POST(request: Request) {
  const json = (value: unknown, status = 200) =>
    Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json({ error: "Request origin is not allowed." }, 403);
  const session = await getSession();
  if (!session || !scopeOf(session).owner)
    return json({ error: "Only an owner can import competitions." }, 403);
  if (!(await limit(`admin-write:${session.user.id}`, 60, 60_000)))
    return json({ error: "Too many changes. Try again shortly." }, 429);
  const db = getDb();
  if (!db) return json({ error: "Storage is unavailable." }, 503);
  if (Number(request.headers.get("content-length")) > MAX_BYTES)
    return json({ error: "The file is too large (2 MiB at most)." }, 400);
  const text = await request.text();
  if (text.length > MAX_BYTES)
    return json({ error: "The file is too large (2 MiB at most)." }, 400);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return json({ error: "This is not a JSON file." }, 400);
  }
  const parsed = transferSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return json(
      {
        error: `The file does not match the format: ${issue.path.join(".") || "root"} — ${issue.message}`,
      },
      400,
    );
  }
  const problem = transferProblem(parsed.data);
  if (problem) return json({ error: problem }, 400);
  const { event, challenges } = parsed.data;

  // Keep the file's address when it is valid and free, else a variant.
  const base =
    slugPattern.test(event.slug) && !RESERVED_SLUGS.has(event.slug)
      ? event.slug
      : "imported";
  let slug = base;
  for (let n = 2; await db.ctfEvent.findUnique({ where: { slug } }); n++)
    slug = `${base.slice(0, 50)}-${n}`;

  const created = await db.$transaction(async (tx) => {
    const row = await tx.ctfEvent.create({
      data: { ...event, slug, published: false },
    });
    const ids = new Map<string, string>();
    for (const c of challenges) {
      const { key, requires: _requires, flags, hints, ...fields } = c;
      void _requires;
      const made = await tx.ctfChallenge.create({
        data: {
          ...fields,
          eventId: row.id,
          flags: { create: flags.map(importFlag) },
          hints: {
            create: hints.map((h, position) => ({ ...h, position })),
          },
        },
        select: { id: true },
      });
      ids.set(key, made.id);
    }
    for (const c of challenges)
      if (c.requires)
        await tx.ctfChallenge.update({
          where: { id: ids.get(c.key)! },
          data: { requiresId: ids.get(c.requires)! },
        });
    return row;
  });
  await audit("ctf.event_update", session.user.id, created.id);
  return json({ id: created.id, slug }, 201);
}
