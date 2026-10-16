import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  JuniorEditForm,
  ResetJuniorCodeForm,
} from "@/components/admin/junior-forms";
import {
  deleteJuniorAction,
  resetJuniorProgressAction,
  signOutJuniorAction,
} from "../actions";
import { juniorRow } from "@/lib/junior/admin";
import { BADGES } from "@/lib/junior/badges";
import { MISSIONS } from "@/lib/junior/content";
import { TOTAL_EXERCISES } from "@/lib/junior/cipher-content";
import { RANKS } from "@/lib/junior/rank";

// The date input shows the Tashkent calendar day the access ends on.
const toDateInput = (date: Date | null) =>
  date
    ? new Date(date.getTime() + 5 * 3_600_000).toISOString().slice(0, 10)
    : "";

export default async function AdminJuniorMemberPage({
  params,
}: PageProps<"/admin/junior/[id]">) {
  const { id } = await params;
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireAdmin(`/admin/junior/${id}`);
  const db = getDb();
  if (!db) notFound();
  const member = await db.juniorMember.findUnique({
    where: { id },
    include: {
      _count: {
        select: { sessions: { where: { expiresAt: { gt: new Date() } } } },
      },
    },
  });
  if (!member) notFound();
  const row = juniorRow(member);
  const next = RANKS[row.rankIndex + 1];
  const done = new Set(Object.keys(row.progress.missions));
  const earned = new Set(row.badges);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/junior" className="muted">
            ← Academy Junior
          </Link>
          <h1>{member.name}</h1>
          <p className="muted">
            {[
              member.group || t("No group"),
              member.codename && `${t("Codename")}: ${member.codename}`,
              t("{sessions} open sessions", {
                sessions: member._count.sessions,
              }),
              member.lastLoginAt
                ? `${t("Last sign-in")}: ${formatDate(member.lastLoginAt)}`
                : t("Never signed in"),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      <div className="admin-cards">
        <div className="admin-card">
          <span className="eyebrow">{t("Rank")}</span>
          <strong>{row.xp} XP</strong>
          <span className="muted">
            {row.rank.title[locale]}
            {next &&
              ` · ${t("{xp} XP to {rank}", { xp: next.xp - row.xp, rank: next.title[locale] })}`}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Missions")}</span>
          <strong>
            {row.missions}/{MISSIONS.length}
          </strong>
          <span className="muted">
            {row.story ? t("Cyber HQ case solved") : t("Case not solved yet")}
          </span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Exercises")}</span>
          <strong>
            {row.exercises}/{TOTAL_EXERCISES}
          </strong>
          <span className="muted">{t("cipher homework")}</span>
        </div>
        <div className="admin-card">
          <span className="eyebrow">{t("Daily puzzles")}</span>
          <strong>{row.daily}</strong>
          <span className="muted">
            {t("current streak: {days} days", { days: row.streak })}
          </span>
        </div>
      </div>

      <h2>{t("Missions")}</h2>
      <ul className="admin-checklist">
        {MISSIONS.map((mission) => (
          <li key={mission.id} className={done.has(mission.id) ? "done" : ""}>
            <span aria-hidden="true">{done.has(mission.id) ? "✓" : "·"}</span>
            {mission.title[locale]}
            <span className="visually-hidden">
              {done.has(mission.id) ? t("Done") : t("Not done")}
            </span>
          </li>
        ))}
      </ul>

      <h2>{t("Cipher homework")}</h2>
      <ul className="admin-bars">
        {row.ciphers.map((cipher) => (
          <li key={cipher.id}>
            <span>{cipher.title[locale]}</span>
            <span
              className="admin-meter"
              role="img"
              aria-label={`${cipher.solved}/${cipher.total}`}
            >
              <span
                style={{ width: `${(cipher.solved / cipher.total) * 100}%` }}
              />
            </span>
            <span className="muted">
              {cipher.solved}/{cipher.total}
            </span>
          </li>
        ))}
      </ul>

      <h2>
        {t("Badges")} ({row.badges.length}/{BADGES.length})
      </h2>
      <ul className="admin-checklist admin-checklist-inline">
        {BADGES.map((badge) => (
          <li key={badge.id} className={earned.has(badge.id) ? "done" : ""}>
            <span aria-hidden="true">{earned.has(badge.id) ? "✓" : "·"}</span>
            {badge.title[locale]}
            <span className="visually-hidden">
              {earned.has(badge.id) ? t("Earned") : t("Not earned")}
            </span>
          </li>
        ))}
      </ul>

      <h2>{t("Details")}</h2>
      <JuniorEditForm
        member={{
          id: member.id,
          name: member.name,
          group: member.group,
          note: member.note,
          active: member.active,
          expiresAt: toDateInput(member.expiresAt),
        }}
      />

      <h2>{t("Access")}</h2>
      <div className="admin-row-actions">
        <ResetJuniorCodeForm id={member.id} name={member.name} />
        <form action={signOutJuniorAction.bind(null, member.id)}>
          <button type="submit" className="button button-secondary">
            {t("Sign out everywhere")}
          </button>
        </form>
        <form action={resetJuniorProgressAction.bind(null, member.id)}>
          <ConfirmButton
            type="submit"
            className="button button-secondary"
            message={t(
              "Erase this member’s progress, XP and badges? This cannot be undone.",
            )}
          >
            {t("Reset progress")}
          </ConfirmButton>
        </form>
        <form action={deleteJuniorAction.bind(null, member.id)}>
          <ConfirmButton
            type="submit"
            className="button button-secondary"
            message={t(
              "Delete this member with all progress? This cannot be undone.",
            )}
          >
            {t("Delete member")}
          </ConfirmButton>
        </form>
      </div>
    </div>
  );
}
