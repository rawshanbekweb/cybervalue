import { eventBySlug, scoreboard } from "@/lib/challenges/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The scoreboard in CTFtime's feed format, for listing a competition on
 * ctftime.org. It shows what the public scoreboard shows, freeze included.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/challenges/[slug]/ctftime">,
) {
  const event = await eventBySlug((await params).slug);
  if (!event) return new Response("Not found", { status: 404 });
  const board = await scoreboard(event);
  return Response.json(
    {
      standings: board.rows.map((r) => ({
        pos: r.rank,
        team: r.name,
        score: r.score,
      })),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
