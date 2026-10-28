import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { pickedGroupWhere, requireStaff } from "@/lib/auth";
import { loadStandings } from "@/lib/student/standing";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { CreateStudentsForm } from "@/components/admin/student-forms";
import { SelectAll } from "@/components/admin/select-all";
import { isLevel, LEVEL_LABEL, LEVELS } from "@/lib/student/levels";
import { setStudentsLevelAction } from "./actions";

export default async function AdminStudentsPage({
  searchParams,
}: PageProps<"/teacher/students">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/teacher/students");
  const {
    group: groupParam,
    show: showParam,
    moved: movedParam,
  } = await searchParams;
  const group = typeof groupParam === "string" ? groupParam : "";
  // "" every level, "none" students not placed yet, or one level.
  const show =
    showParam === "none" || isLevel(showParam) ? (showParam as string) : "";
  const moved =
    typeof movedParam === "string" && /^\d{1,4}$/.test(movedParam)
      ? Number(movedParam)
      : null;
  const db = getDb();
  const [students, materials] = db
    ? await Promise.all([
        db.student.findMany({
          where: {
            ...pickedGroupWhere(scope, group),
            ...(show ? { level: show === "none" ? "" : show } : {}),
          },
          orderBy: [{ group: "asc" }, { name: "asc" }],
          take: 1000,
          omit: { portrait: true },
          include: {
            _count: { select: { submissions: true } },
          },
        }),
        db.studentMaterial.count({ where: { published: true } }),
      ])
    : [[], 0];
  // "Completed" as the student page counts it: lessons and labs marked done,
  // practices and tests handed in, personal labs solved.
  const standings =
    db && students.length ? await loadStandings(db, students) : new Map();
  const now = new Date();
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Students")}</h1>
          <p className="muted">
            {t(
              "{count} students · {materials} published materials · sign-in page: /student/login",
              { count: students.length, materials },
            )}
          </p>
        </div>
        <Link href="/teacher/materials" className="button button-secondary">
          {t("Student materials")}
        </Link>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}
      <CreateStudentsForm />
      {moved !== null && (
        <p role="status">
          {t("Level changed for {count} students.", { count: moved })}
        </p>
      )}
      {group ? (
        <h2>
          {t("Group {group}", { group })}{" "}
          <Link href="/teacher/students" className="admin-help">
            {t("Show all")}
          </Link>
        </h2>
      ) : (
        <h2>{t("All students")}</h2>
      )}
      <div className="admin-row-actions">
        <form method="get" className="admin-filters">
          {group && <input type="hidden" name="group" value={group} />}
          <div className="admin-field">
            <label htmlFor="students-show">{t("Level")}</label>
            <select
              id="students-show"
              name="show"
              className="admin-input"
              defaultValue={show}
            >
              <option value="">{t("All levels")}</option>
              <option value="none">{t("Not placed yet")}</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {t(LEVEL_LABEL[level])}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="button button-secondary">
            {t("Show")}
          </button>
        </form>
        {students.length > 0 && (
          <form
            id="bulk-level"
            action={setStudentsLevelAction}
            className="admin-filters"
          >
            {group && <input type="hidden" name="group" value={group} />}
            {show && <input type="hidden" name="show" value={show} />}
            <div className="admin-field">
              <label htmlFor="bulk-level-to">
                {t("Move the ticked students to")}
              </label>
              <select
                id="bulk-level-to"
                name="level"
                className="admin-input"
                defaultValue="intermediate"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {t(LEVEL_LABEL[level])}
                  </option>
                ))}
                <option value="">{t("Not placed yet")}</option>
              </select>
            </div>
            <button type="submit" className="button">
              {t("Apply")}
            </button>
          </form>
        )}
      </div>
      {students.length === 0 ? (
        <p className="muted">
          {show ? t("No students at this level.") : t("No students yet.")}
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">
                  <SelectAll
                    form="bulk-level"
                    label={t("Tick every student")}
                  />
                </th>
                <th scope="col">{t("Name")}</th>
                <th scope="col">{t("Group")}</th>
                <th scope="col">{t("Level")}</th>
                <th scope="col">{t("Status")}</th>
                <th scope="col">{t("Completed")}</th>
                <th scope="col">{t("Submissions")}</th>
                <th scope="col">{t("Last sign-in")}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const expired = student.expiresAt && student.expiresAt <= now;
                return (
                  <tr key={student.id}>
                    <td>
                      <input
                        type="checkbox"
                        form="bulk-level"
                        name="ids"
                        value={student.id}
                        aria-label={t("Tick {name}", { name: student.name })}
                      />
                    </td>
                    <td>
                      <Link href={`/teacher/students/${student.id}`}>
                        {student.name}
                      </Link>
                    </td>
                    <td>{student.group || "—"}</td>
                    <td>
                      {isLevel(student.level)
                        ? t(LEVEL_LABEL[student.level])
                        : "—"}
                    </td>
                    <td>
                      {!student.active ? (
                        <span className="admin-warn">{t("Blocked")}</span>
                      ) : expired ? (
                        <span className="admin-warn">{t("Expired")}</span>
                      ) : (
                        t("Active")
                      )}
                    </td>
                    <td>{standings.get(student.id)?.done ?? 0}</td>
                    <td>{student._count.submissions}</td>
                    <td>
                      {student.lastLoginAt
                        ? formatDate(student.lastLoginAt, locale)
                        : t("Never")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
