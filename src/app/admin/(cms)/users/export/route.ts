import type { NextRequest } from "next/server";
import { getSession, scopeOf } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { createTranslator, localeCookie, resolveLocale } from "@/lib/i18n";
import { listUsers, readFilters } from "@/lib/admin/users-list";
import { LEVEL_LABEL, isLevel } from "@/lib/student/levels";
import { toCsv } from "@/lib/student/results";

export const dynamic = "force-dynamic";

// The Users page as a spreadsheet: the same filters and order, every page.
export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401, headers });
  if (!scopeOf(session).owner)
    return new Response("Forbidden", { status: 403, headers });
  const db = getDb();
  if (!db) return new Response("Unavailable", { status: 503, headers });
  const filters = readFilters(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );
  const users = await listUsers(db, filters);
  const t = createTranslator(
    resolveLocale(request.cookies.get(localeCookie)?.value),
  );
  // Dates as YYYY-MM-DD in Tashkent time, which every spreadsheet sorts.
  const day = (date: Date | null) =>
    date
      ? new Date(date.getTime() + 5 * 3_600_000).toISOString().slice(0, 10)
      : "";
  const kindName = { student: t("Student"), junior: "Junior", kids: "Kids" };
  const statusName = {
    active: t("Active"),
    blocked: t("Blocked"),
    expired: t("Expired"),
  };
  const csv = toCsv([
    [
      t("Name"),
      t("Type"),
      t("Group"),
      t("Status"),
      t("Level"),
      "XP",
      t("Completed"),
      t("Submissions"),
      t("Last activity"),
      t("Created"),
    ],
    ...users.map((u) => [
      u.name,
      kindName[u.kind],
      u.group,
      statusName[u.status],
      isLevel(u.level) ? t(LEVEL_LABEL[u.level]) : "",
      u.xp ?? "",
      u.done ?? "",
      u.submissions ?? "",
      day(u.last),
      day(u.createdAt),
    ]),
  ]);
  await audit("data.export", session.user.id, `users: ${users.length}`);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      ...headers,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users-${date}.csv"`,
    },
  });
}
