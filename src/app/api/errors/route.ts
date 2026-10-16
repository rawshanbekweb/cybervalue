import { z } from "zod";
import { recordError } from "@/lib/errors/record";
import { allowRequest, clientKey } from "@/lib/rate-limit";
import { limit } from "@/lib/rate-limit-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const report = z.object({
  message: z.string().max(2000),
  digest: z.string().max(200).optional(),
  path: z.string().max(500).optional(),
  stack: z.string().max(8000).optional(),
});

// Errors caught by the browser's error boundaries. Same-origin only and
// rate-limited, since anyone can call it.
export async function POST(request: Request) {
  const done = new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new Response(null, { status: 403 });
  const client = clientKey(request.headers.get("x-forwarded-for"));
  if (
    !allowRequest(`client-error:${client}`, Date.now(), 10, 60_000) ||
    !(await limit("client-error:global", 300, 60_000))
  )
    return done;
  const text = await request.text().catch(() => "");
  if (text.length > 12000) return done;
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return done;
  }
  const parsed = report.safeParse(body);
  if (parsed.success) await recordError({ source: "client", ...parsed.data });
  return done;
}
