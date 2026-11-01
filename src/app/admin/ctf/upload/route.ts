import { getSession, scopeOf } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { limit } from "@/lib/rate-limit-db";
import { readUploadBody, UploadError } from "@/lib/upload-validation";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// All CTF attachments together may take this much of the database.
const MAX_CTF_BYTES = 200 * 1024 * 1024;

/** Adds a file to a challenge. Any type is allowed: it is only ever downloaded. */
export async function POST(request: Request) {
  const json = (value: unknown, status = 200) =>
    Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return json({ error: "Request origin is not allowed." }, 403);
  const session = await getSession();
  if (!session || !scopeOf(session).owner)
    return json({ error: "Only an owner can upload challenge files." }, 403);
  if (!(await limit(`upload:${session.user.id}`, 15, 60_000)))
    return json({ error: "Too many uploads. Try again shortly." }, 429);
  const db = getDb();
  if (!db) return json({ error: "Storage is unavailable." }, 503);
  const challengeId = new URL(request.url).searchParams.get("challenge") ?? "";
  const challenge = await db.ctfChallenge.findUnique({
    where: { id: challengeId },
    select: { id: true },
  });
  if (!challenge) return json({ error: "Challenge not found." }, 404);
  try {
    const name = decodeURIComponent(request.headers.get("x-file-name") ?? "")
      .replace(/[/\\\0]/g, "_")
      .trim();
    if (!name || name.length > 200)
      throw new UploadError("Choose a file with a name under 200 characters.");
    const bytes = await readUploadBody(request);
    if (!bytes.length) throw new UploadError("The file is empty.");
    const file = await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(4280117)`;
      const usage = await tx.ctfFile.aggregate({ _sum: { size: true } });
      if ((usage._sum.size ?? 0) + bytes.length > MAX_CTF_BYTES)
        throw new UploadError(
          "CTF file storage is full (200 MiB). Delete unused files first.",
        );
      return tx.ctfFile.create({
        data: {
          challengeId,
          name,
          size: bytes.length,
          data: new Uint8Array(bytes),
        },
        select: { id: true, name: true, size: true },
      });
    });
    await audit("ctf.challenge_update", session.user.id, challengeId);
    return json({ file }, 201);
  } catch (error) {
    if (error instanceof UploadError)
      return json({ error: error.message }, 400);
    throw error;
  }
}
