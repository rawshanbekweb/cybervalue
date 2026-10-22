import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { requireStaff } from "@/lib/auth";
import { groupCondition, groupLabel, pickGroup } from "@/lib/staff";
import { getDb } from "@/lib/db";
import { ConfirmButton } from "@/components/admin/confirm-button";
import {
  AssignmentForm,
  type TargetGroup,
} from "@/components/admin/assignment-form";
import { CHECKPOINT_META } from "@/lib/checkpoints/meta";
import { LAB_META } from "@/lib/lab-progress";
import { classGroups } from "@/lib/student/class-data";
import {
  assignmentResults,
  loadAssignments,
} from "@/lib/student/assignment-data";
import {
  formatDue,
  localInput,
  STATUS_TEXT,
  targetName,
  type AssignmentStatus,
} from "@/lib/student/assignments";
import { deleteAssignmentAction } from "./actions";

const DAY = 86_400_000;
const KIND_LABEL: Record<string, string> = {
  LESSON: "Lesson",
  LAB: "Lab",
  PRACTICE: "Practice",
  QUIZ: "Test",
  CHALLENGE: "Personal lab",
};

export default async function AdminAssignmentsPage({
  searchParams,
}: PageProps<"/teacher/assignments">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/teacher/assignments");
  const db = getDb();
  if (!db)
    return (
      <div className="admin-page">
        <h1>{t("Assignments")}</h1>
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      </div>
    );
  const query = await searchParams;
  const now = new Date().getTime();
  const picked = pickGroup(scope, await classGroups(db), query.group);
  const groups = picked.groups;
  const group = groupLabel(picked.group);
  const showPast = query.past === "1";
  const [assignments, materials, students] = await Promise.all([
    loadAssignments(db, {
      ...(Array.isArray(picked.group)
        ? { groups: picked.group }
        : group
          ? { groups: ["", group] }
          : {}),
      ...(showPast ? {} : { since: new Date(now - 30 * DAY) }),
    }),
    db.studentMaterial.findMany({
      where: { published: true },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: { id: true, title: true, kind: true },
    }),
    db.student.findMany({
      where: { active: true, ...groupCondition(picked.group) },
      orderBy: { name: "asc" },
      select: { id: true, name: true, group: true },
      take: 1000,
    }),
  ]);
  const results = await assignmentResults(db, assignments, students, now);
  const targets: TargetGroup[] = [
    {
      label: t("Student materials"),
      options: materials.map((m) => ({
        value: `material:${m.id}`,
        label: `${m.title} · ${t(KIND_LABEL[m.kind] ?? m.kind)}`,
      })),
    },
    {
      label: t("Lab checkpoints"),
      options: CHECKPOINT_META.map((c) => ({
        value: `checkpoint:${c.id}`,
        label: `${c.title[locale]} · ${c.lab[locale]}`,
      })),
    },
    {
      label: t("Whole labs"),
      options: LAB_META.map((l) => ({
        value: `lab:${l.id}`,
        label: l.title[locale],
      })),
    },
  ].filter((g) => g.options.length > 0);
  // Next Friday 18:00 Tashkent time as the suggested deadline.
  const tashkent = new Date(now + 5 * 3_600_000);
  const toFriday = (5 - tashkent.getUTCDay() + 7) % 7 || 7;
  const friday = new Date(
    Date.UTC(
      tashkent.getUTCFullYear(),
      tashkent.getUTCMonth(),
      tashkent.getUTCDate() + toFriday,
      18 - 5,
    ),
  );
  const count = (rows: { status: AssignmentStatus }[], ...s: string[]) =>
    rows.filter((r) => s.includes(r.status)).length;
  const upcoming = results.filter((a) => a.dueAt.getTime() >= now);
  const past = results.filter((a) => a.dueAt.getTime() < now).reverse();

  const renderAssignment = (a: (typeof results)[number]) => {
    const done = count(a.students, "done", "late");
    const missed = a.students.filter((s) => s.status === "missed");
    const open = a.students.filter((s) => s.status === "open");
    const total = a.students.length;
    return (
      <li key={a.id} className="admin-assignment">
        <div className="admin-assignment-head">
          <div>
            <strong>{a.title}</strong>
            <span className="muted">
              {a.group || t("Every student")} · {targetName(a, locale, t)} ·{" "}
              {t("due {date}", {
                date: formatDue(a.dueAt, locale),
              })}
            </span>
          </div>
          <form action={deleteAssignmentAction.bind(null, a.id)}>
            <ConfirmButton
              type="submit"
              className="button button-danger"
              message={t("Delete this assignment?")}
            >
              {t("Delete")}
            </ConfirmButton>
          </form>
        </div>
        {a.note && <p className="admin-assignment-note">{a.note}</p>}
        <p>
          <span
            className="admin-meter"
            role="img"
            aria-label={`${done}/${total}`}
          >
            <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </span>{" "}
          {t("{done} of {total} done", { done, total })}
          {count(a.students, "late") > 0 &&
            ` · ${t("{count} late", { count: count(a.students, "late") })}`}
          {missed.length > 0 &&
            ` · ${t("{count} missed", { count: missed.length })}`}
        </p>
        {(missed.length > 0 || open.length > 0) && (
          <details>
            <summary>
              {missed.length > 0 ? t("Who missed it") : t("Not done yet")}
            </summary>
            <ul className="admin-assignment-who">
              {[...missed, ...open].map((s) => (
                <li key={s.id}>
                  <Link href={`/teacher/students/${s.id}`}>{s.name}</Link>
                  <span
                    className={`admin-chip ${s.status === "missed" ? "warn" : ""}`}
                  >
                    {t(STATUS_TEXT[s.status])}
                  </span>
                  {!group && s.group && (
                    <span className="muted"> {s.group}</span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </li>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Assignments")}</h1>
          <p className="muted">
            {t(
              "Set work with a deadline for a group. Students see it at the top of their page; the class panel shows who missed it.",
            )}
          </p>
        </div>
      </div>

      <AssignmentForm
        groups={groups}
        everyone={scope.owner}
        targets={targets}
        defaultDue={localInput(friday)}
      />

      <form method="get" className="admin-filters">
        <div className="admin-field">
          <label htmlFor="assignments-group">{t("Group")}</label>
          <select
            id="assignments-group"
            name="group"
            className="admin-input"
            defaultValue={group}
          >
            <option value="">{t("All groups")}</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <label className="admin-field-checkbox">
          <input
            type="checkbox"
            name="past"
            value="1"
            defaultChecked={showPast}
          />
          {t("Include older than 30 days")}
        </label>
        <button type="submit" className="button button-secondary">
          {t("Apply")}
        </button>
      </form>

      <h2>{t("Upcoming")}</h2>
      {upcoming.length === 0 ? (
        <p className="muted">{t("No upcoming assignments.")}</p>
      ) : (
        <ul className="admin-assignments">{upcoming.map(renderAssignment)}</ul>
      )}
      <h2>{t("Past deadlines")}</h2>
      {past.length === 0 ? (
        <p className="muted">{t("No past assignments.")}</p>
      ) : (
        <ul className="admin-assignments">{past.map(renderAssignment)}</ul>
      )}
    </div>
  );
}
