import { getSession, groupWhere, scopeOf } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createTranslator, localeCookie, resolveLocale } from "@/lib/i18n";
import { juniorCsv, juniorRow } from "@/lib/junior/admin";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401, headers });
  const db = getDb();
  if (!db) return new Response("Unavailable", { status: 503, headers });
  const group = request.nextUrl.searchParams.get("group") ?? "";
  const members = await db.juniorMember.findMany({
    where: { ...groupWhere(scopeOf(session)), ...(group ? { group } : {}) },
    orderBy: [{ group: "asc" }, { xp: "desc" }, { name: "asc" }],
    take: 5000,
  });
  const locale = resolveLocale(request.cookies.get(localeCookie)?.value);
  const now = Date.now();
  const csv = juniorCsv(
    members.map((member) => juniorRow(member, now)),
    createTranslator(locale),
    locale,
  );
  // ASCII-only file name; the group name may contain any letters.
  const date = new Date().toISOString().slice(0, 10);
  const slug = group.replace(/[^A-Za-z0-9._-]+/g, "_") || "all";
  return new Response(csv, {
    headers: {
      ...headers,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="junior-${slug}-${date}.csv"`,
    },
  });
}
