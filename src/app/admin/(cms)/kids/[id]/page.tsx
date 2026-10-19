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
import { GAME_IDS, GAMES, missionKey } from "@/lib/kids/games";
import { kidsLevel, restoreKidsProgress } from "@/lib/kids/progress";
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
        {GAME_IDS.map((gameId) => (
          <section
            key={gameId}
            className="admin-panel"
            aria-labelledby={`kid-${gameId}`}
          >
            <h2 id={`kid-${gameId}`}>{GAMES[gameId].title[locale]}</h2>
            <p className="muted">
              {t("Best score: {score}", { score: progress.best[gameId] })}
            </p>
            <ul className="admin-list">
              {GAMES[gameId].missions.map((m) => {
                const done = progress.done.includes(missionKey(gameId, m.id));
                return (
                  <li key={m.id}>
                    <span>
                      <span className={`admin-chip ${done ? "ok" : ""}`}>
                        {done ? t("Done") : "—"}
                      </span>{" "}
                      {m.title[locale]}
                    </span>
                  </li>
                );
              })}
            </ul>
            {progress.code[gameId] && (
              <details className="admin-more">
                <summary>{t("Last code")}</summary>
                <pre className="admin-code-block">{progress.code[gameId]}</pre>
              </details>
            )}
          </section>
        ))}
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
