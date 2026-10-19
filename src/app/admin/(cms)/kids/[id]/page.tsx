import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireMember } from "@/lib/staff-guard";
import { getDb } from "@/lib/db";
import { memberDays } from "@/lib/admin/analytics";
import { DayHeat } from "@/components/admin/charts";
import { formatDate } from "@/components/ui";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { KidEditForm, ResetKidCodeForm } from "@/components/admin/kids-forms";
import { ParentAccess } from "@/components/admin/parent-access";
import { PromoteKidForm } from "@/components/admin/promote-kid";
import { GAMES, missionKey, stageOf } from "@/lib/kids/games";
import { kidsToday } from "@/lib/kids/extras";
import { kidsLevel, restoreKidsProgress } from "@/lib/kids/progress";
import { kidSummary } from "@/lib/kids/summary";
import { KidStageCell } from "@/components/admin/kid-stage";
import { deleteKidAction, resetKidProgressAction } from "../actions";

export default async function AdminKidPage({
  params,
}: PageProps<"/admin/kids/[id]">) {
  const { id } = await params;
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  await requireMember("kids", id, `/admin/kids/${id}`);
  const member = await getDb()?.kidsMember.findUnique({ where: { id } });
  if (!member) notFound();
  const db = getDb()!;
  const [parentChats, promoted, activity] = await Promise.all([
    db.telegramChat.count({ where: { subject: `parent:kids:${member.id}` } }),
    member.juniorId
      ? db.juniorMember.findUnique({
          where: { id: member.juniorId },
          select: { id: true, name: true },
        })
      : null,
    memberDays(db, "kids", member.id),
  ]);
  const progress = restoreKidsProgress(member.progress);
  const level = kidsLevel(member.xp);
  const summary = kidSummary(progress, kidsToday());
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link href="/admin/kids" className="muted">
            ← Academy Kids
          </Link>
          <h1>{member.name}</h1>
          <p className="muted">
            {member.group || t("No group")} · {level.level.title[locale]} ·{" "}
            {member.xp} XP
            {member.lastLoginAt &&
              ` · ${t("Last sign-in")}: ${formatDate(member.lastLoginAt, locale)}`}
          </p>
        </div>
      </div>
      <DayHeat
        title={t("Active days")}
        days={activity.days}
        from={activity.from}
        locale={locale}
        t={t}
      />
      <div className="admin-split">
        <section className="admin-panel" aria-labelledby="kid-skills">
          <h2 id="kid-skills">{t("What the child has learned")}</h2>
          {summary.skills.length ? (
            <ul className="admin-kid-skills">
              {summary.skills.map((s) => (
                <li key={`${s.game}-${s.stage}`}>
                  <strong>{GAMES[s.game].title[locale]}:</strong>{" "}
                  {s.text[locale]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              {t("No stage finished yet. Skills appear here stage by stage.")}
            </p>
          )}
        </section>
        <section className="admin-panel" aria-labelledby="kid-badges">
          <h2 id="kid-badges">
            {t("Badges")} · {summary.badges.length}/{summary.badgeTotal}
          </h2>
          <p className="muted">
            {t("Daily tasks: {count} done · streak {streak} · best {record}", {
              count: summary.dailyCount,
              streak: summary.streak,
              record: summary.record,
            })}
          </p>
          {summary.badges.length > 0 && (
            <p>
              {summary.badges.map((b) => (
                <span key={b.id} className="admin-chip ok">
                  {b.title[locale]}
                </span>
              ))}
            </p>
          )}
        </section>
      </div>
      <div className="admin-split">
        {summary.games.map((g) => {
          const game = GAMES[g.id];
          return (
            <section
              key={g.id}
              className="admin-panel"
              aria-labelledby={`kid-${g.id}`}
            >
              <h2 id={`kid-${g.id}`}>{game.title[locale]}</h2>
              <p className="muted">
                <KidStageCell game={g} t={t} /> · {g.done}/{g.total} ·{" "}
                {t("Best score: {score}", { score: g.best })}
              </p>
              {g.stages.map((stage) => (
                <div key={stage.stage}>
                  <h3 className="admin-stage-head">
                    {t("Stage {n}", { n: stage.stage })} · {stage.done}/
                    {stage.total}
                  </h3>
                  <ul className="admin-list">
                    {game.missions
                      .filter((m) => stageOf(m) === stage.stage)
                      .map((m) => {
                        const done = progress.done.includes(
                          missionKey(g.id, m.id),
                        );
                        return (
                          <li key={m.id}>
                            <span>
                              <span
                                className={`admin-chip ${done ? "ok" : ""}`}
                              >
                                {done ? t("Done") : "—"}
                              </span>{" "}
                              {m.title[locale]}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
              {progress.code[g.id] && (
                <details className="admin-more">
                  <summary>{t("Last code")}</summary>
                  <pre className="admin-code-block">{progress.code[g.id]}</pre>
                </details>
              )}
            </section>
          );
        })}
      </div>
      <ParentAccess
        kind="kids"
        id={member.id}
        token={member.reportToken}
        chats={parentChats}
        t={t}
      />
      <PromoteKidForm
        id={member.id}
        group={member.group}
        xp={member.xp}
        promoted={promoted}
      />
      <KidEditForm
        id={member.id}
        name={member.name}
        group={member.group}
        note={member.note}
        active={member.active}
      />
      <section className="admin-form" aria-labelledby="kid-access">
        <h2 id="kid-access">{t("Access")}</h2>
        <ResetKidCodeForm id={member.id} name={member.name} />
        <div className="admin-row-actions admin-danger-zone">
          <form action={resetKidProgressAction.bind(null, member.id)}>
            <ConfirmButton
              type="submit"
              className="button button-secondary"
              message={t("Clear all missions and XP of this child?")}
            >
              {t("Reset progress")}
            </ConfirmButton>
          </form>
          <form action={deleteKidAction.bind(null, member.id)}>
            <ConfirmButton
              type="submit"
              className="button button-danger"
              message={t(
                "Move this child with all progress to the trash? You can restore them for 30 days.",
              )}
            >
              {t("Delete child")}
            </ConfirmButton>
          </form>
        </div>
      </section>
    </div>
  );
}
