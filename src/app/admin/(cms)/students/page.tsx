import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { groupWhere, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { CreateStudentsForm } from "@/components/admin/student-forms";

export default async function AdminStudentsPage({
  searchParams,
}: PageProps<"/admin/students">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/admin/students");
  const { group: groupParam } = await searchParams;
  const group = typeof groupParam === "string" ? groupParam : "";
  const db = getDb();
  const [students, materials] = db
    ? await Promise.all([
        db.student.findMany({
          where: { ...groupWhere(scope), ...(group ? { group } : {}) },
          orderBy: [{ group: "asc" }, { name: "asc" }],
          take: 1000,
          omit: { portrait: true },
          include: {
            _count: { select: { progress: true, submissions: true } },
          },
        }),
        db.studentMaterial.count({ where: { published: true } }),
      ])
    : [[], 0];
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
        <Link href="/admin/materials" className="button button-secondary">
          {t("Student materials")}
        </Link>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}
      <CreateStudentsForm />
      {group ? (
        <h2>
          {t("Group {group}", { group })}{" "}
          <Link href="/admin/students" className="admin-help">
            {t("Show all")}
          </Link>
        </h2>
      ) : (
        <h2>{t("All students")}</h2>
      )}
      {students.length === 0 ? (
        <p className="muted">{t("No students yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Name")}</th>
                <th scope="col">{t("Group")}</th>
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
                      <Link href={`/admin/students/${student.id}`}>
                        {student.name}
                      </Link>
                    </td>
                    <td>{student.group || "—"}</td>
                    <td>
                      {!student.active ? (
                        <span className="admin-warn">{t("Blocked")}</span>
                      ) : expired ? (
                        <span className="admin-warn">{t("Expired")}</span>
                      ) : (
                        t("Active")
                      )}
                    </td>
                    <td>{student._count.progress}</td>
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
