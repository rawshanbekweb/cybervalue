import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireStaff } from "@/lib/auth";
import { groupCondition, groupLabel, pickGroup } from "@/lib/staff";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { CHECKPOINT_META } from "@/lib/checkpoints/meta";
import { classGroups } from "@/lib/student/class-data";
import { LAB_PROGRESS, lessonList } from "@/lib/lab-progress";
import { OPEN_MODULES } from "@/lib/intermediate/roadmap";
import { LEVEL_LABEL, isLevel } from "@/lib/student/levels";

const CHECKPOINTS = CHECKPOINT_META.filter((c) => c.level === "intermediate");

// Who works in Academy Intermediate and how far they are: students placed at
// the Intermediate or Advanced level, with each open lab and checkpoint.
export default async function TeacherIntermediatePage({
  searchParams,
}: PageProps<"/teacher/intermediate">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/teacher/intermediate");
  const db = getDb();
  if (!db)
    return (
      <div className="admin-page">
        <h1>Academy Intermediate</h1>
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      </div>
    );
  const picked = pickGroup(
    scope,
    await classGroups(db),
    (await searchParams).group,
  );
  const group = groupLabel(picked.group);
  const labs = OPEN_MODULES.flatMap((m) => (m.lab ? [m.lab] : []));
  const students = await db.student.findMany({
    where: {
      active: true,
      level: { in: ["intermediate", "advanced"] },
      ...groupCondition(picked.group),
    },
    orderBy: [{ group: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      group: true,
      level: true,
      lastLoginAt: true,
      labProgress: { where: { lab: { in: labs } } },
      checkpoints: {
        where: { checkpoint: { in: CHECKPOINTS.map((c) => c.id) } },
        select: { checkpoint: true, score: true, total: true },
      },
    },
  });
  const best = (
    rows: { checkpoint: string; score: number; total: number }[],
    id: string,
  ) => {
    const scores = rows
      .filter((r) => r.checkpoint === id && r.total > 0)
      .map((r) => Math.round((r.score / r.total) * 100));
    return scores.length ? Math.max(...scores) : null;
  };
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Academy Intermediate</h1>
          <p className="muted">
            {t(
              "Students placed at the Intermediate or Advanced level work in the Intermediate labs. Place a student from their page; the Results page suggests a level after the entrance test.",
            )}
          </p>
        </div>
        <Link href="/intermediate" className="button button-secondary">
          {t("Open the public page")}
        </Link>
      </div>

      <form method="get" className="admin-filters">
        <div className="admin-field">
          <label htmlFor="im-group">{t("Group")}</label>
          <select
            id="im-group"
            name="group"
            className="admin-input"
            defaultValue={group}
          >
            <option value="">{t("All groups")}</option>
            {picked.groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="button button-secondary">
          {t("Apply")}
        </button>
      </form>

      <div className="admin-table-wrap" tabIndex={0}>
        <table className="admin-table">
          <caption className="visually-hidden">
            {t("Intermediate students and their progress")}
          </caption>
          <thead>
            <tr>
              <th>{t("Name")}</th>
              <th>{t("Group")}</th>
              <th>{t("Level")}</th>
              {OPEN_MODULES.map((m) => (
                <th key={m.href}>{m.title[locale]}</th>
              ))}
              {CHECKPOINTS.map((c) => (
                <th key={c.id}>{c.title[locale]}</th>
              ))}
              <th>{t("Last sign-in")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link href={`/teacher/students/${s.id}`}>{s.name}</Link>
                </td>
                <td>{s.group || "—"}</td>
                <td>{isLevel(s.level) ? t(LEVEL_LABEL[s.level]) : "—"}</td>
                {OPEN_MODULES.map((m) => {
                  if (!m.lab) return <td key={m.href}>—</td>;
                  const { total } = LAB_PROGRESS[m.lab];
                  const done = lessonList(
                    s.labProgress.find((p) => p.lab === m.lab)?.lessons ?? [],
                    total,
                  ).length;
                  return (
                    <td key={m.href}>
                      {t("{done} of {total} lessons", { done, total })}
                    </td>
                  );
                })}
                {CHECKPOINTS.map((c) => {
                  const score = best(s.checkpoints, c.id);
                  return (
                    <td key={c.id}>
                      {score === null ? (
                        <span className="muted">{t("Not taken")}</span>
                      ) : (
                        <span
                          className={score >= c.pass ? undefined : "admin-warn"}
                        >
                          {score}%
                        </span>
                      )}
                    </td>
                  );
                })}
                <td>
                  {s.lastLoginAt ? formatDate(s.lastLoginAt, locale) : "—"}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td
                  colSpan={4 + OPEN_MODULES.length + CHECKPOINTS.length}
                  className="muted"
                >
                  {t(
                    "No students at the Intermediate level yet. Set a student's level to Intermediate on their page to open the labs.",
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
