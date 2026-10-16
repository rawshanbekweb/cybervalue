import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hostView } from "@/lib/live/data";

export const dynamic = "force-dynamic";

// Polled by the host screen.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/admin/live/[id]/state">,
) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!(await getSession()))
    return new Response("Unauthorized", { status: 401, headers });
  const db = getDb();
  if (!db) return new Response("Unavailable", { status: 503, headers });
  const view = await hostView(db, (await params).id);
  return view
    ? Response.json(view, { headers })
    : new Response("Not found", { status: 404, headers });
}
