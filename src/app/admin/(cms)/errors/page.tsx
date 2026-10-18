import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDue } from "@/lib/student/assignments";
import { resolveAllErrorsAction, resolveErrorAction } from "./actions";

export default async function AdminErrorsPage({
  searchParams,
}: PageProps<"/admin/errors">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireOwner("/admin/errors");
  const { show } = await searchParams;
  const all = show === "all";
  const db = getDb();
  const errors = db
    ? await db.errorEvent.findMany({
        where: all ? {} : { resolvedAt: null },
        orderBy: { lastAt: "desc" },
        take: 200,
      })
    : [];
  const open = errors.filter((e) => !e.resolvedAt).length;
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Errors")}</h1>
          <p className="muted">
            {t(
              "Errors from the server and from visitors' browsers, grouped so repeats only raise the count. Linked teachers get new ones in Telegram.",
            )}
          </p>
        </div>
        {open > 0 && (
          <form action={resolveAllErrorsAction}>
            <button type="submit" className="button button-secondary">
              {t("Mark all as resolved")}
            </button>
          </form>
        )}
      </div>
      <p>
        <Link
          href={all ? "/admin/errors" : "/admin/errors?show=all"}
          className="button button-secondary"
        >
          {all ? t("Show open errors only") : t("Show resolved errors too")}
        </Link>
      </p>
      {errors.length === 0 ? (
        <p className="muted">
          {t("No errors. Everything is running smoothly.")}
        </p>
      ) : (
        <ul className="admin-errors">
          {errors.map((e) => (
            <li key={e.id} className={e.resolvedAt ? "is-resolved" : undefined}>
              <div className="admin-errors-head">
                <span className={`admin-chip ${e.resolvedAt ? "ok" : "warn"}`}>
                  {e.source === "server" ? t("Server") : t("Browser")}
                </span>
                <strong>{e.message}</strong>
              </div>
              <p className="muted">
                {[
                  e.route || e.path,
                  t("{count} times", { count: e.count }),
                  t("last {date}", { date: formatDue(e.lastAt, locale) }),
                  e.digest && `digest ${e.digest}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {e.stack && (
                <details>
                  <summary>{t("Stack trace")}</summary>
                  <pre>{e.stack}</pre>
                </details>
              )}
              {!e.resolvedAt && (
                <form action={resolveErrorAction.bind(null, e.id)}>
                  <button type="submit" className="button button-secondary">
                    {t("Resolved")}
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
