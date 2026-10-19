import "./report.css";
import { CHECKPOINT_META } from "@/lib/checkpoints/meta";
import { LAB_META, LAB_PROGRESS } from "@/lib/lab-progress";
import { formatDue, STATUS_TEXT, targetName } from "@/lib/student/assignments";
import { isLevel, LEVEL_LABEL } from "@/lib/student/levels";
import { WEEKLY_GOAL } from "@/lib/student/xp";
import type { JuniorReport, KidsReport, StudentReport } from "@/lib/reports";
import { ReportPrint } from "./print";

type T = (source: string, values?: Record<string, string | number>) => string;
type Locale = "uz" | "en";

const DAY = 86_400_000;

function day(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-Latn" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Tashkent",
  }).format(date);
}

function Card({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="report-card">
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
      {note && <span className="report-note">{note}</span>}
    </div>
  );
}

// The page a parent opens from the teacher's link or the weekly Telegram
// message: plain facts, no ranking against classmates.
export function ReportView({
  report,
  t,
  locale,
}: {
  report: StudentReport | JuniorReport | KidsReport;
  t: T;
  locale: Locale;
}) {
  const today = new Date();
  return (
    <div className="container page-content report-page">
      <header className="page-header report-head">
        <span className="eyebrow">
          {report.kind === "junior"
            ? t("Academy Junior · progress report")
            : report.kind === "kids"
              ? t("Academy Kids · progress report")
              : t("Academy · progress report")}
        </span>
        <h1>
          {report.name}
          <br />
          <span>{t("As of {date}", { date: day(today, locale) })}</span>
        </h1>
        <p>
          {[
            report.group && t("Group {group}", { group: report.group }),
            report.kind === "student" &&
              isLevel(report.level) &&
              t("Level: {level}", { level: t(LEVEL_LABEL[report.level]) }),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="report-actions">
          <ReportPrint label={t("Print or save as PDF")} />
        </div>
      </header>
      {report.kind === "student" ? (
        <StudentPart report={report} t={t} locale={locale} />
      ) : report.kind === "kids" ? (
        <KidsPart report={report} t={t} locale={locale} />
      ) : (
        <JuniorPart report={report} t={t} locale={locale} />
      )}
      <p className="report-foot">
        {t(
          "This page updates by itself. Keep the link private: anyone with it can see this report.",
        )}
      </p>
    </div>
  );
}

function StudentPart({
  report,
  t,
  locale,
}: {
  report: StudentReport;
  t: T;
  locale: Locale;
}) {
  const s = report.standing;
  const peak = Math.max(1, ...s.days);
  const now = new Date().getTime();
  return (
    <>
      <section className="report-cards" aria-label={t("Summary")}>
        <Card
          label={t("Rank")}
          value={s.rank.title[locale]}
          note={`${s.xp} XP`}
        />
        <Card
          label={t("This week")}
          value={`${s.week}/${WEEKLY_GOAL}`}
          note={
            s.streakWeeks > 1
              ? t("{weeks}-week streak", { weeks: s.streakWeeks })
              : t("actions toward the weekly goal")
          }
        />
        <Card
          label={t("Completed")}
          value={`${s.done}/${s.available}`}
          note={t("materials from the teacher")}
        />
        <Card
          label={t("Test average")}
          value={s.average === null ? "—" : `${s.average}%`}
          note={
            s.lastActive
              ? t("last active {date}", { date: day(s.lastActive, locale) })
              : t("No activity yet")
          }
        />
      </section>

      <section className="report-section" aria-labelledby="report-activity">
        <h2 id="report-activity">{t("Activity, last 14 days")}</h2>
        <div className="report-bars" aria-hidden="true">
          {s.days.map((count, i) => (
            <span
              key={i}
              style={{ height: `${Math.max(3, (count / peak) * 100)}%` }}
              title={`${day(new Date(now - (13 - i) * DAY), locale)}: ${count}`}
            />
          ))}
        </div>
        <p className="report-note">
          {t("{count} actions in two weeks", {
            count: s.days.reduce((a, b) => a + b, 0),
          })}
        </p>
      </section>

      <section className="report-section" aria-labelledby="report-assignments">
        <h2 id="report-assignments">{t("Assignments")}</h2>
        {report.assignments.length === 0 ? (
          <p className="report-note">
            {t("No assignments in the last two weeks.")}
          </p>
        ) : (
          <ul className="report-list">
            {report.assignments.map((a) => (
              <li key={a.id}>
                <span>
                  <strong>{a.title}</strong>
                  <small>
                    {targetName(a, locale, t)} · {formatDue(a.dueAt, locale)}
                  </small>
                </span>
                <span className={`report-pill is-${a.status}`}>
                  {t(STATUS_TEXT[a.status])}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="report-section" aria-labelledby="report-tests">
        <h2 id="report-tests">{t("Recent test results")}</h2>
        {report.tests.length === 0 ? (
          <p className="report-note">{t("No tests in the last 30 days.")}</p>
        ) : (
          <ul className="report-list">
            {report.tests.map((test, i) => (
              <li key={i}>
                <span>
                  <strong>{test.title}</strong>
                  <small>{day(test.at, locale)}</small>
                </span>
                <span
                  className={`report-pill ${test.percent >= 70 ? "is-done" : test.percent < 50 ? "is-missed" : ""}`}
                >
                  {test.percent}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="report-section" aria-labelledby="report-labs">
        <h2 id="report-labs">{t("Labs and checkpoints")}</h2>
        <ul className="report-list">
          {LAB_META.map((lab) => {
            const done = s.labs[lab.id] ?? 0;
            const total = LAB_PROGRESS[lab.id].total;
            return (
              <li key={lab.id}>
                <span>
                  <strong>{lab.title[locale]}</strong>
                  <small>{t("lessons finished")}</small>
                </span>
                <span
                  className={`report-pill ${done === total ? "is-done" : ""}`}
                >
                  {done}/{total}
                </span>
              </li>
            );
          })}
          {CHECKPOINT_META.map((c) => {
            const best = s.checkpoints[c.id];
            return (
              <li key={c.id}>
                <span>
                  <strong>{c.title[locale]}</strong>
                  <small>{c.lab[locale]}</small>
                </span>
                <span
                  className={`report-pill ${best !== undefined && best >= c.pass ? "is-done" : ""}`}
                >
                  {best === undefined ? t("Not taken") : `${best}%`}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {report.certificates.length > 0 && (
        <section
          className="report-section"
          aria-labelledby="report-certificates"
        >
          <h2 id="report-certificates">{t("Certificates")}</h2>
          <ul className="report-list">
            {report.certificates.map((c, i) => (
              <li key={i}>
                <strong>{c.title}</strong>
                <span className="report-pill is-done">
                  {day(c.issuedAt, locale)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function JuniorPart({
  report,
  t,
  locale,
}: {
  report: JuniorReport;
  t: T;
  locale: Locale;
}) {
  return (
    <section className="report-cards" aria-label={t("Summary")}>
      <Card
        label={t("Rank")}
        value={report.rank.title[locale]}
        note={`${report.xp} XP`}
      />
      <Card
        label={t("Missions")}
        value={`${report.missions}/${report.missionTotal}`}
        note={report.story ? t("Cyber HQ case solved") : undefined}
      />
      <Card
        label={t("Exercises")}
        value={`${report.exercises}/${report.exerciseTotal}`}
        note={t("{count} badges", { count: report.badges })}
      />
      <Card
        label={t("Daily puzzles")}
        value={report.daily}
        note={
          report.lastActiveAt
            ? t("last active {date}", {
                date: day(report.lastActiveAt, locale),
              })
            : t("No activity yet")
        }
      />
    </section>
  );
}

function KidsPart({
  report,
  t,
  locale,
}: {
  report: KidsReport;
  t: T;
  locale: Locale;
}) {
  return (
    <>
      <section className="report-cards" aria-label={t("Summary")}>
        <Card
          label={t("Hacker level")}
          value={report.level[locale]}
          note={`${report.xp} XP`}
        />
        <Card
          label={t("Missions")}
          value={`${report.missions}/${report.missionTotal}`}
          note={
            report.lastActiveAt
              ? t("last active {date}", {
                  date: day(report.lastActiveAt, locale),
                })
              : t("No activity yet")
          }
        />
        <Card
          label={t("Badges")}
          value={`${report.badges}/${report.badgeTotal}`}
          note={
            report.streak > 0
              ? t("daily tasks {days} days in a row", { days: report.streak })
              : undefined
          }
        />
      </section>
      <section className="report-section" aria-labelledby="kids-skills">
        <h2 id="kids-skills">{t("What your child has learned")}</h2>
        {report.skills.length ? (
          <ul className="report-list">
            {report.skills.map((skill) => (
              <li key={skill.en}>{skill[locale]}</li>
            ))}
          </ul>
        ) : (
          <p className="report-note">
            {t(
              "Every game has three stages; what each finished stage teaches will appear here.",
            )}
          </p>
        )}
      </section>
      <section className="report-cards" aria-label={t("Games")}>
        {report.games.map((game) => (
          <Card
            key={game.title.en}
            label={game.title[locale]}
            value={`${game.done}/${game.total}`}
            note={
              !game.open
                ? t("not opened yet")
                : game.stage === null
                  ? t("all stages finished")
                  : t("stage {n} of 3", { n: game.stage })
            }
          />
        ))}
      </section>
    </>
  );
}
