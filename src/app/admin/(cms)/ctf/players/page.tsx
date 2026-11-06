import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireOwner } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  confirmAllPlayerEmailsAction,
  confirmPlayerEmailAction,
  deletePlayerAction,
  setPlayerActiveAction,
} from "./actions";

const PAGE_SIZE = 50;

export async function generateMetadata() {
  const t = await getAdminTranslator();
  return { title: t("CTF players") };
}

export default async function CtfPlayersPage({
  searchParams,
}: PageProps<"/admin/ctf/players">) {
  await requireOwner("/admin/ctf/players");
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { q: rawQ, page: rawPage } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ.trim().slice(0, 80) : "";
  const page = Math.max(1, Number(rawPage) || 1);
  const db = getDb();
  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { username: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const [players, total, verified, unconfirmed] = db
    ? await Promise.all([
        db.ctfPlayer.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true,
            email: true,
            username: true,
            emailVerifiedAt: true,
            active: true,
            createdAt: true,
            lastLoginAt: true,
          },
        }),
        db.ctfPlayer.count({ where }),
        db.ctfPlayer.count({ where: { emailVerifiedAt: { not: null } } }),
        // What "Confirm every unconfirmed email" would change: active players.
        db.ctfPlayer.count({ where: { emailVerifiedAt: null, active: true } }),
      ])
    : [[], 0, 0, 0];
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) =>
    `/admin/ctf/players?${new URLSearchParams({ ...(q && { q }), page: String(p) })}`;
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("CTF players")}</h1>
          <p className="muted">
            {t(
              "People who signed up at /challenges: {total} in all, {verified} with a confirmed email.",
              { total, verified },
            )}
          </p>
        </div>
        <div className="admin-row-actions">
          {unconfirmed > 0 && (
            <form action={confirmAllPlayerEmailsAction}>
              <button type="submit" className="button button-secondary">
                {t("Confirm every unconfirmed email ({count})", {
                  count: unconfirmed,
                })}
              </button>
            </form>
          )}
          <Link href="/challenges" className="button button-secondary">
            {t("Open CTF Challenges")}
          </Link>
        </div>
      </div>
      <form method="get" className="admin-filters">
        <div className="admin-field admin-search-field">
          <label htmlFor="ctf-q">{t("Search by email or username")}</label>
          <input
            id="ctf-q"
            name="q"
            className="admin-input"
            defaultValue={q}
            maxLength={80}
          />
        </div>
        <button type="submit" className="button button-secondary">
          {t("Search")}
        </button>
      </form>
      {players.length === 0 ? (
        <p className="muted">{t("No players yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table" tabIndex={0}>
            <thead>
              <tr>
                <th scope="col">{t("Username")}</th>
                <th scope="col">{t("Email")}</th>
                <th scope="col">{t("Status")}</th>
                <th scope="col">{t("Joined")}</th>
                <th scope="col">{t("Last sign-in")}</th>
                <th scope="col">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id}>
                  <td>{p.username}</td>
                  <td>{p.email}</td>
                  <td>
                    {!p.active
                      ? t("Blocked")
                      : p.emailVerifiedAt
                        ? t("Email confirmed")
                        : t("Email not confirmed")}
                  </td>
                  <td>{formatDate(p.createdAt, locale)}</td>
                  <td>
                    {p.lastLoginAt ? formatDate(p.lastLoginAt, locale) : "—"}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      {!p.emailVerifiedAt && (
                        <form
                          action={confirmPlayerEmailAction.bind(null, p.id)}
                        >
                          <button
                            type="submit"
                            className="button button-secondary"
                          >
                            {t("Confirm email")}
                          </button>
                        </form>
                      )}
                      <form
                        action={setPlayerActiveAction.bind(
                          null,
                          p.id,
                          !p.active,
                        )}
                      >
                        <button
                          type="submit"
                          className="button button-secondary"
                        >
                          {p.active ? t("Block") : t("Unblock")}
                        </button>
                      </form>
                      <form action={deletePlayerAction.bind(null, p.id)}>
                        <ConfirmButton
                          type="submit"
                          className="button button-danger"
                          message={t("Delete {name} and all their results?", {
                            name: p.username,
                          })}
                        >
                          {t("Delete")}
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <nav className="admin-pagination" aria-label={t("Pages")}>
          {page > 1 && <a href={link(page - 1)}>{t("Previous")}</a>}
          <span>{t("Page {page} of {pages}", { page, pages })}</span>
          {page < pages && <a href={link(page + 1)}>{t("Next")}</a>}
        </nav>
      )}
    </div>
  );
}
