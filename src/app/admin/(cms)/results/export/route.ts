import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createTranslator, localeCookie, resolveLocale } from "@/lib/i18n";
import { loadResults, resolveGroup } from "@/lib/student/results-data";
import { resultsCsv } from "@/lib/student/results";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!(await getSession()))
    return new Response("Unauthorized", { status: 401, headers });
  const db = getDb();
  if (!db) return new Response("Unavailable", { status: 503, headers });
  const { group } = await resolveGroup(
    db,
    request.nextUrl.searchParams.get("group"),
  );
  const results = await loadResults(db, group);
  const t = createTranslator(
    resolveLocale(request.cookies.get(localeCookie)?.value),
  );
  // ASCII-only file name; the group name may contain any letters.
  const date = new Date().toISOString().slice(0, 10);
  const slug = group.replace(/[^A-Za-z0-9._-]+/g, "_") || "all";
  return new Response(resultsCsv(results, t), {
    headers: {
      ...headers,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="results-${slug}-${date}.csv"`,
    },
  });
}
