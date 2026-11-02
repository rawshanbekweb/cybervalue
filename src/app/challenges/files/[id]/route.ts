import { getDb } from "@/lib/db";
import { getPlayerSession } from "@/lib/challenges/session";
import { entrantFor } from "@/lib/challenges/events";
import { challengeAccess, phaseOf } from "@/lib/challenges/scoring";
import { isCtfOrganiser } from "@/lib/challenges/view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A challenge file goes to the same people who may see the challenge: its
// entrants while the competition runs, any signed-in player after the end,
// and organisers always. Files are always downloads, never rendered.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/challenges/files/[id]">,
) {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex",
  };
  const notFound = () => new Response("Not found", { status: 404, headers });
  const { id } = await params;
  const db = getDb();
  if (!db || id.length > 40) return notFound();
  const file = await db.ctfFile.findUnique({
    where: { id },
    select: {
      name: true,
      size: true,
      data: true,
      challenge: {
        select: {
          id: true,
          visible: true,
          releaseAt: true,
          requiresId: true,
          event: {
            select: {
              id: true,
              published: true,
              startsAt: true,
              endsAt: true,
              registrationEndsAt: true,
              freezeAt: true,
            },
          },
        },
      },
    },
  });
  if (!file) return notFound();
  const { event, visible } = file.challenge;
  let allowed = await isCtfOrganiser();
  if (!allowed && event.published && visible) {
    const player = (await getPlayerSession())?.player;
    const phase = phaseOf(event);
    if (player && phase === "ended") allowed = true;
    else if (player && phase === "running") {
      const entrant = await entrantFor(event.id, player.id);
      // The same gates as the board: released, its prerequisite solved.
      const solved =
        entrant && file.challenge.requiresId
          ? await db.ctfSolve.findUnique({
              where: {
                entrantId_challengeId: {
                  entrantId: entrant.id,
                  challengeId: file.challenge.requiresId,
                },
              },
              select: { challengeId: true },
            })
          : null;
      allowed = Boolean(
        entrant &&
        !entrant.banned &&
        challengeAccess(
          file.challenge,
          new Set(solved ? [solved.challengeId] : []),
        ) === "open",
      );
    }
  }
  if (!allowed) return notFound();
  const ascii = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new Response(new Uint8Array(file.data), {
    headers: {
      ...headers,
      "Content-Type": "application/octet-stream",
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    },
  });
}
