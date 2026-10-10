import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { loadResults, resolveGroup } from "@/lib/student/results-data";
import { cellText, type Cell } from "@/lib/student/results";

const KIND_LABEL = {
  LESSON: "Lesson",
  LAB: "Lab",
  PRACTICE: "Practice",
  QUIZ: "Test",
  CHALLENGE: "Personal lab",
} as const;

const tone = (cell: Cell) =>
  cell.state === "none" || cell.state === "hidden"
    ? "results-empty"
    : cell.state === "waiting" || cell.state === "trying"
      ? "results-pending"
      : "results-ok";

export default async function AdminResultsPage({
  searchParams,
}: PageProps<"/admin/results">) {
  const t = await getAdminTranslator();
  await requireAdmin("/admin/results");
  const raw = (await searchParams).group;
  const db = getDb();
  if (!db)
    return (
      <div className="admin-page">
        <h1>{t("Results")}</h1>
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      </div>
    );
  // Unknown groups fall back to everyone rather than an empty table.
  const { groups, group } = await resolveGroup(db, raw);
  const { rows, columns } = await loadResults(db, group);
  const exportHref = `/admin/results/export${group ? `?group=${encodeURIComponent(group)}` : ""}`;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Results")}</h1>
          <p className="muted">
            {t(
              "Each student’s progress on published materials. Tests show the best score and the number of attempts; practice shows the teacher’s score.",
            )}
          </p>
        </div>
        <a href={exportHref} className="button button-primary" download>
          {t("Download CSV")}
        </a>
      </div>
      <form method="get" className="admin-filters">
        <div className="admin-field">
          <label htmlFor="results-group">{t("Group")}</label>
          <select
            id="results-group"
            name="group"
            className="admin-input"
            defaultValue={group}
          >
            <option value="">{t("All students")}</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="button button-secondary">
          {t("Show")}
        </button>
      </form>

      {!rows.length || !columns.length ? (
        <p className="muted">
          {rows.length
            ? t("No published materials yet.")
            : t("No students yet.")}
        </p>
      ) : (
        <>
          {/* Outside the scrolling table, so it wraps on a phone. */}
          <div className="admin-table-wrap results-wrap">
            <table
              className="admin-table results-table"
              aria-describedby="results-legend"
            >
              <thead>
                <tr>
                  <th scope="col" className="results-sticky">
                    {t("Student")}
                  </th>
                  <th scope="col">{t("Completed")}</th>
                  <th scope="col">{t("Average score")}</th>
                  {columns.map(({ material }) => (
                    <th key={material.id} scope="col">
                      <Link href={`/admin/materials/${material.id}`}>
                        {material.title}
                      </Link>
                      <span className="results-kind">
                        {t(KIND_LABEL[material.kind])}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.student.id}>
                    <th scope="row" className="results-sticky">
                      <Link href={`/admin/students/${row.student.id}`}>
                        {row.student.name}
                      </Link>
                      {row.student.group && (
                        <span className="muted"> · {row.student.group}</span>
                      )}
                      {!row.student.active && (
                        <span className="admin-warn"> · {t("Blocked")}</span>
                      )}
                    </th>
                    <td>
                      {row.completed}/{row.available}
                    </td>
                    <td>{row.average === null ? "—" : `${row.average}%`}</td>
                    {row.cells.map((cell, i) => (
                      <td key={columns[i].material.id} className={tone(cell)}>
                        {cellText(cell, t)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="results-sticky">
                    {t("Completed")}
                  </th>
                  <td colSpan={2} />
                  {columns.map((c) => (
                    <td key={c.material.id}>
                      {c.completed}/{c.available}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <p id="results-legend" className="muted results-legend">
            {t("✓ done · — not started · ✗ (n) unsolved after n attempts")}
          </p>
        </>
      )}
    </div>
  );
}
