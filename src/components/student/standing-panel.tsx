import {
  CheckCircle2,
  ClipboardCheck,
  Crown,
  DoorOpen,
  Flag,
  Flame,
  Footprints,
  Layers,
  PieChart,
  Shield,
  Swords,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Text } from "@/lib/network/ip";
import { CHECKPOINT_META } from "@/lib/checkpoints/meta";
import { LAB_META, LAB_PROGRESS } from "@/lib/lab-progress";
import {
  STUDENT_BADGES,
  WEEKLY_GOAL,
  type BadgeIcon,
  type Standing,
} from "@/lib/student/xp";

type T = (source: string, values?: Record<string, string | number>) => string;

const ICONS: Record<BadgeIcon, LucideIcon> = {
  footprints: Footprints,
  layers: Layers,
  target: Target,
  clipboard: ClipboardCheck,
  flag: Flag,
  swords: Swords,
  check: CheckCircle2,
  shield: Shield,
  door: DoorOpen,
  flame: Flame,
  half: PieChart,
  crown: Crown,
};

const LABS = LAB_META;

export type RankingEntry = {
  place: number;
  name: string;
  xp: number;
  rank: Text;
  me: boolean;
};

// Rank, XP and this week's goal, under the student's greeting.
export function StandingCard({
  standing,
  t,
  locale,
}: {
  standing: Standing;
  t: T;
  locale: "uz" | "en";
}) {
  const week = Math.min(standing.week, WEEKLY_GOAL);
  return (
    <div className="student-standing" aria-label={t("Your rank")}>
      <div className="student-standing-rank">
        <span className="student-ring" aria-hidden="true">
          <Trophy size={18} />
        </span>
        <div>
          <p className="student-field-label">{t("Rank")}</p>
          <strong>{standing.rank.title[locale]}</strong>
          <span>{standing.xp} XP</span>
        </div>
      </div>
      <div className="student-standing-next">
        <div
          className="student-meter"
          role="progressbar"
          aria-label={t("Progress to the next rank")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(standing.progress * 100)}
        >
          <span style={{ width: `${Math.round(standing.progress * 100)}%` }} />
        </div>
        <p className="student-quiet">
          {standing.next
            ? t("{xp} XP to {rank}", {
                xp: standing.next.xp - standing.xp,
                rank: standing.next.title[locale],
              })
            : t("Top rank reached")}
        </p>
      </div>
      <div className="student-standing-week">
        <p className="student-field-label">{t("This week")}</p>
        <div className="student-week-dots" aria-hidden="true">
          {Array.from({ length: WEEKLY_GOAL }, (_, i) => (
            <span key={i} className={i < week ? "on" : undefined} />
          ))}
        </div>
        <p className="student-quiet">
          {standing.week >= WEEKLY_GOAL
            ? t("Weekly goal reached")
            : t("{done} of {goal} actions this week", {
                done: standing.week,
                goal: WEEKLY_GOAL,
              })}
          {standing.streakWeeks > 1 &&
            ` · ${t("{weeks}-week streak", { weeks: standing.streakWeeks })}`}
        </p>
      </div>
    </div>
  );
}

export function AchievementsSection({
  standing,
  ranking,
  group,
  t,
  locale,
}: {
  standing: Standing;
  ranking: RankingEntry[];
  group: string;
  t: T;
  locale: "uz" | "en";
}) {
  const earned = new Set(standing.badges);
  return (
    <section
      id="achievements"
      className="student-section"
      aria-labelledby="achievements-title"
    >
      <div className="student-section-head">
        <h2 id="achievements-title" className="student-section-title">
          {t("Achievements")}
        </h2>
        <p className="student-quiet">
          {t(
            "XP comes from finished materials, test scores, solved labs and lab checkpoints.",
          )}
        </p>
      </div>
      <div className="student-ach-grid">
        <div className="student-panel">
          <h3>
            {t("Badges")}{" "}
            <span className="student-quiet">
              {earned.size}/{STUDENT_BADGES.length}
            </span>
          </h3>
          <ul className="student-badges">
            {STUDENT_BADGES.map((badge) => {
              const Icon = ICONS[badge.icon];
              const on = earned.has(badge.id);
              return (
                <li key={badge.id} className={on ? "on" : undefined}>
                  <span className="student-ring" aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  <span>
                    <strong>{badge.title[locale]}</strong>
                    <small>{on ? t("Earned") : badge.how[locale]}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="student-panel">
          <h3>
            <Users size={16} aria-hidden="true" />{" "}
            {group ? t("Group {group} ranking", { group }) : t("Group ranking")}
          </h3>
          {ranking.length > 1 ? (
            <ol className="student-ranking">
              {ranking.map((row) => (
                <li key={row.place} className={row.me ? "me" : undefined}>
                  <span className="student-ranking-place">{row.place}</span>
                  <span className="student-ranking-name">
                    {row.name}
                    {row.me && <small> · {t("you")}</small>}
                  </span>
                  <span className="student-ranking-rank">
                    {row.rank[locale]}
                  </span>
                  <span className="student-ranking-xp">{row.xp} XP</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="student-quiet">
              {group
                ? t("Your classmates have not started yet.")
                : t(
                    "The ranking appears once your teacher puts you in a group.",
                  )}
            </p>
          )}
          <h3 className="student-panel-sub">{t("Lab lessons")}</h3>
          <ul className="student-checkpoints">
            {LABS.map((lab) => {
              const done = standing.labs[lab.id] ?? 0;
              const total = LAB_PROGRESS[lab.id].total;
              return (
                <li key={lab.id}>
                  <a href={lab.href}>
                    <span>
                      <strong>{lab.title[locale]}</strong>
                      <span
                        className="student-meter student-meter-sm"
                        role="img"
                        aria-label={`${done}/${total}`}
                      >
                        <span style={{ width: `${(done / total) * 100}%` }} />
                      </span>
                    </span>
                    <span
                      className={`student-pill ${done === total ? "on" : ""}`}
                    >
                      {done}/{total}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          <h3 className="student-panel-sub">{t("Lab checkpoints")}</h3>
          <ul className="student-checkpoints">
            {CHECKPOINT_META.map((c) => {
              const best = standing.checkpoints[c.id];
              const passed = best !== undefined && best >= c.pass;
              return (
                <li key={c.id}>
                  <a href={c.href}>
                    <span>
                      <strong>{c.title[locale]}</strong>
                      <small>
                        {c.lab[locale]} · {c.covers[locale]}
                      </small>
                    </span>
                    <span className={`student-pill ${passed ? "on" : ""}`}>
                      {best === undefined
                        ? t("Not taken")
                        : passed
                          ? t("Passed · {percent}%", { percent: best })
                          : t("Best {percent}%", { percent: best })}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
