import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createTranslator, localeCookie, resolveLocale } from "@/lib/i18n";
import { classCsv } from "@/lib/student/class";
import { classGroups, loadClass } from "@/lib/student/class-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!(await getSession()))
    return new Response("Unauthorized", { status: 401, headers });
  const db = getDb();
  if (!db) return new Response("Unavailable", { status: 503, headers });
  const requested = request.nextUrl.searchParams.get("group") ?? "";
  const group = (await classGroups(db)).includes(requested) ? requested : "";
  const { rows } = await loadClass(db, group);
  const locale = resolveLocale(request.cookies.get(localeCookie)?.value);
  const date = new Date().toISOString().slice(0, 10);
  const slug = group.replace(/[^A-Za-z0-9._-]+/g, "_") || "all";
  return new Response(classCsv(rows, createTranslator(locale), locale), {
    headers: {
      ...headers,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="class-${slug}-${date}.csv"`,
    },
  });
}
