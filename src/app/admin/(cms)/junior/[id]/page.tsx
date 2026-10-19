import Link from "next/link";
import { PromoteJuniorForm } from "@/components/admin/promote-junior";
import { ParentAccess } from "@/components/admin/parent-access";
import { notFound } from "next/navigation";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireMember } from "@/lib/staff-guard";
import { getDb } from "@/lib/db";
import { memberDays } from "@/lib/admin/analytics";
import { DayHeat } from "@/components/admin/charts";
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
import { MISSION_STAGE } from "@/lib/junior/verify";
import {
  JuniorLevelCell,
  JuniorMissionCell,
} from "@/components/admin/junior-stage";

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
  await requireMember("junior", id, `/admin/junior/${id}`);
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
  const [parentChats, promoted, activity] = await Promise.all([
    db.telegramChat.count({
      where: { subject: `parent:junior:${member.id}` },
    }),
    db.student.findUnique({
      where: { juniorId: member.id },
      select: { id: true, name: true },
    }),
    memberDays(db, "junior", member.id),
  ]);
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
                ? `${t("Last sign-in")}: ${formatDate(member.lastLoginAt, locale)}`
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

      <DayHeat
        title={t("Active days")}
        days={activity.days}
        from={activity.from}
        locale={locale}
        t={t}
      />
      <section className="admin-panel" aria-labelledby="junior-skills">
        <h2 id="junior-skills">{t("What the member has learned")}</h2>
        {row.stages.skills.length ? (
          <ul className="admin-kid-skills">
            {row.stages.skills.map((skill) => (
              <li key={skill.key}>{skill.text[locale]}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            {t(
              "Nothing finished yet. Skills appear here after each mission stage and cipher level.",
            )}
          </p>
        )}
      </section>

      <h2>
        {t("Missions")} · <JuniorMissionCell stages={row.stages} t={t} />
      </h2>
      {row.stages.missionStages.map((stage) => (
        <div key={stage.stage}>
          <h3 className="admin-stage-head">
            {t("Stage {n}", { n: stage.stage })} · {stage.done}/{stage.total}
            {!stage.open && ` · ${t("Locked")}`}
          </h3>
          <ul className="admin-checklist">
            {MISSIONS.filter((m) => MISSION_STAGE[m.id] === stage.stage).map(
              (mission) => (
                <li
                  key={mission.id}
                  className={done.has(mission.id) ? "done" : ""}
                >
                  <span aria-hidden="true">
                    {done.has(mission.id) ? "✓" : "·"}
                  </span>
                  {mission.title[locale]}
                  <span className="visually-hidden">
                    {done.has(mission.id) ? t("Done") : t("Not done")}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      ))}

      <h2>
        {t("Cipher homework")} · <JuniorLevelCell stages={row.stages} t={t} />
      </h2>
      {row.stages.levels.map((level) => (
        <div key={level.level}>
          <h3 className="admin-stage-head">
            {t("Level {n}", { n: level.level })} · {level.solved}/{level.total}
            {!level.open && ` · ${t("Locked")}`}
          </h3>
          <ul className="admin-bars">
            {row.ciphers
              .filter((cipher) => cipher.level === level.level)
              .map((cipher) => (
                <li key={cipher.id}>
                  <span>{cipher.title[locale]}</span>
                  <span
                    className="admin-meter"
                    role="img"
                    aria-label={`${cipher.solved}/${cipher.total}`}
                  >
                    <span
                      style={{
                        width: `${(cipher.solved / cipher.total) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="muted">
                    {cipher.solved}/{cipher.total}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ))}

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

      <PromoteJuniorForm
        id={member.id}
        group={member.group}
        xp={row.xp}
        promoted={promoted}
      />
      <ParentAccess
        kind="junior"
        id={member.id}
        token={member.reportToken}
        chats={parentChats}
        t={t}
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
            className="button button-danger"
            message={t(
              "Move this member with all progress to the trash? You can restore them for 30 days.",
            )}
          >
            {t("Delete member")}
          </ConfirmButton>
        </form>
      </div>
    </div>
  );
}
