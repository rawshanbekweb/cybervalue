import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { groupWhere, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/components/ui";
import { SubmissionList } from "@/components/admin/submission-list";

const DAY = 86_400_000;
const daysSince = (date: Date) =>
  Math.floor((Date.now() - date.getTime()) / DAY);

// One queue for every practice answer a teacher still has to review, across
// materials and groups, oldest first; reviewed answers stay one filter away.
export default async function GradingPage({
  searchParams,
}: PageProps<"/admin/grading">) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/admin/grading");
  const params = await searchParams;
  const pick = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const group = pick("group");
  const material = pick("material");
  const reviewed = pick("show") === "reviewed";
  const db = getDb();
  const people = {
    ...groupWhere(scope),
    ...(group ? { group } : {}),
  };
  const where = {
    material: { kind: "PRACTICE" as const },
    reviewedAt: reviewed ? { not: null } : null,
    student: people,
    ...(material ? { materialId: material } : {}),
  };
  const [submissions, pending, materials, groups, exams] = db
    ? await Promise.all([
        db.studentSubmission.findMany({
          where,
          orderBy: { createdAt: reviewed ? "desc" : "asc" },
          take: 100,
          include: {
            student: { select: { id: true, name: true, group: true } },
            material: { select: { id: true, title: true, kind: true } },
          },
        }),
        db.studentSubmission.count({
          where: { ...where, reviewedAt: null },
        }),
        db.studentMaterial.findMany({
          where: { kind: "PRACTICE" },
          orderBy: { title: "asc" },
          select: { id: true, title: true },
        }),
        db.student.findMany({
          where: { group: { not: "" }, ...groupWhere(scope) },
          distinct: ["group"],
          orderBy: { group: "asc" },
          select: { group: true },
        }),
        // HTML exams are reviewed on their own pages; owners see what waits.
        scope.owner
          ? db.htmlExam.findMany({
              where: {
                candidates: {
                  some: { submittedAt: { not: null }, reviewScore: null },
                },
              },
              select: {
                id: true,
                title: true,
                _count: {
                  select: {
                    candidates: {
                      where: { submittedAt: { not: null }, reviewScore: null },
                    },
                  },
                },
              },
            })
          : [],
      ])
    : [[], 0, [], [], []];
  const oldest = !reviewed && submissions[0];
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{t("Grading")}</h1>
          <p className="muted">
            {t(
              "Practice answers from your groups waiting for a score and feedback, oldest first. Students see your feedback on the material’s page.",
            )}
          </p>
        </div>
      </div>
      {!db && (
        <p role="alert" className="admin-error">
          {t("Database is not configured.")}
        </p>
      )}
      <div className="admin-cards">
        <div className="admin-card">
          <span className="eyebrow">{t("Waiting for review")}</span>
          <strong>{pending}</strong>
          <span className="muted">
            {oldest
              ? t("oldest sent {date}", {
                  date: formatDate(oldest.createdAt, locale),
                })
              : t("Nothing waits.")}
          </span>
        </div>
        {exams.map((exam) => (
          <div className="admin-card" key={exam.id}>
            <span className="eyebrow">{t("HTML exam")}</span>
            <strong>{exam._count.candidates}</strong>
            <Link href={`/admin/assessments/${exam.id}`}>{exam.title}</Link>
          </div>
        ))}
      </div>
      <form method="get" className="admin-filters">
        <div className="admin-field">
          <label htmlFor="grading-group">{t("Group")}</label>
          <select
            id="grading-group"
            name="group"
            className="admin-input"
            defaultValue={group}
          >
            <option value="">{t("All groups")}</option>
            {groups.map((g) => (
              <option key={g.group} value={g.group}>
                {g.group}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="grading-material">{t("Material")}</label>
          <select
            id="grading-material"
            name="material"
            className="admin-input"
            defaultValue={material}
          >
            <option value="">{t("All materials")}</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="grading-show">{t("Show")}</label>
          <select
            id="grading-show"
            name="show"
            className="admin-input"
            defaultValue={reviewed ? "reviewed" : ""}
          >
            <option value="">{t("Waiting for review")}</option>
            <option value="reviewed">{t("Reviewed")}</option>
          </select>
        </div>
        <button type="submit" className="button button-secondary">
          {t("Apply")}
        </button>
      </form>
      {submissions.length === 0 && !reviewed ? (
        <p className="muted">{t("No answers to review.")}</p>
      ) : (
        <SubmissionList
          submissions={submissions.map((s) => {
            const days = daysSince(s.createdAt);
            return {
              ...s,
              heading: [
                s.student.name,
                s.student.group,
                s.material.title,
                !reviewed && days > 0 ? t("waiting {days} days", { days }) : "",
              ]
                .filter(Boolean)
                .join(" · "),
              href: `/admin/students/${s.student.id}`,
              kind: s.material.kind,
            };
          })}
        />
      )}
    </div>
  );
}
