import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";

const KIND_LABEL = {
  LESSON: "Lesson",
  LAB: "Lab",
  PRACTICE: "Practice",
  QUIZ: "Test",
  CHALLENGE: "Personal lab",
} as const;

export default async function AdminMaterialsPage() {
  const t = await getAdminTranslator();
  await requireAdmin("/admin/materials");
  const db = getDb();
  const [materials, pending] = db
    ? await Promise.all([
        db.studentMaterial.findMany({
          orderBy: [{ position: "asc" }, { createdAt: "asc" }],
          include: { _count: { select: { submissions: true } } },
        }),
        db.studentSubmission.groupBy({
          by: ["materialId"],
          where: { reviewedAt: null, material: { kind: "PRACTICE" } },
          _count: true,
        }),
      ])
    : [[], []];
  const waiting = new Map(pending.map((row) => [row.materialId, row._count]));
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Student materials")}</h1>
          <p className="muted">
            {t(
              "Private lessons, labs, practice and tests. Only signed-in students see published ones; nothing here appears on the public site.",
            )}
          </p>
        </div>
        <Link href="/admin/materials/new" className="button button-primary">
          {t("New material")}
        </Link>
      </div>
      {materials.length === 0 ? (
        <p className="muted">{t("No materials yet.")}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t("Order")}</th>
                <th scope="col">{t("Title")}</th>
                <th scope="col">{t("Kind")}</th>
                <th scope="col">{t("Groups")}</th>
                <th scope="col">Status</th>
                <th scope="col">{t("Submissions")}</th>
                <th scope="col">{t("Updated")}</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const toReview = waiting.get(m.id) ?? 0;
                return (
                  <tr key={m.id}>
                    <td>{m.position}</td>
                    <td>
                      <Link href={`/admin/materials/${m.id}`}>{m.title}</Link>
                    </td>
                    <td>{t(KIND_LABEL[m.kind])}</td>
                    <td>{m.groups.length ? m.groups.join(", ") : t("All")}</td>
                    <td>
                      <span
                        className={`admin-status ${m.published ? "admin-status-published" : "admin-status-draft"}`}
                      >
                        {m.published ? t("Visible") : t("Hidden")}
                      </span>
                    </td>
                    <td>
                      {m._count.submissions}
                      {toReview > 0 && (
                        <span className="admin-warn">
                          {" · "}
                          {t("{count} to review", { count: toReview })}
                        </span>
                      )}
                    </td>
                    <td>{formatDate(m.updatedAt)}</td>
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
