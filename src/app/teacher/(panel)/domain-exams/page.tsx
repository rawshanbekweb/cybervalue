import Link from "next/link";
import { getAdminLocale, getAdminTranslator } from "@/lib/i18n/server";
import { groupWhere, requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { EXAM_SUBJECTS, gradeExam } from "@/lib/domain-exam/build";
import {
  answersOf,
  finalizeIfOver,
  finalizeStale,
} from "@/lib/domain-exam/attempts";
import { DOMAIN_EXAM_PASS } from "@/lib/domain-exam/content";
import {
  approveDomainExamAction,
  approveWaitingDomainExamsAction,
  retakeDomainExamAction,
  reviewDomainExamAction,
} from "./actions";
import "@/components/playground/html-assessment/assessment.css";

const when = (d: Date | null) =>
  d ? d.toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—";

// Results of the Academy Intermediate final exams (/intermediate/exam/…).
// Students see their result only after it is approved here.
export default async function DomainExamResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; attempt?: string }>;
}) {
  const t = await getAdminTranslator();
  const locale = await getAdminLocale();
  const { scope } = await requireStaff("/teacher/domain-exams");
  const db = getDb();
  if (!db) return <p>{t("The database is not connected.")}</p>;
  const params = await searchParams;

  // Close every attempt whose time ran out first, so it counts as waiting.
  await finalizeStale(db, groupWhere(scope), EXAM_SUBJECTS);

  const counts = await db.domainExamAttempt.groupBy({
    by: ["domain"],
    where: {
      student: groupWhere(scope),
      submittedAt: { not: null },
      approvedAt: null,
    },
    _count: true,
  });
  const waiting = new Map(counts.map((c) => [c.domain, c._count]));
  // Without a pick, open the first exam with results to review, so a
  // finished exam is never hidden behind another tab.
  const domain =
    EXAM_SUBJECTS.find((d) => d.id === params.domain) ??
    EXAM_SUBJECTS.find((d) => waiting.get(d.id)) ??
    EXAM_SUBJECTS[0];
  const waitingHere = waiting.get(domain.id) ?? 0;

  const raw = await db.domainExamAttempt.findMany({
    where: { domain: domain.id, student: groupWhere(scope) },
    include: { student: { select: { name: true, group: true } } },
    orderBy: { startedAt: "desc" },
    take: 500,
  });
  // Attempts whose time ran out are graded with what was saved.
  const attempts = await Promise.all(
    raw.map(async (a) =>
      a.submittedAt
        ? a
        : { ...(await finalizeIfOver(db, domain, a)), student: a.student },
    ),
  );
  const selected = attempts.find((a) => a.id === params.attempt);
  const result =
    selected?.submittedAt &&
    gradeExam(domain, selected.seed, answersOf(selected));
  const status = (a: (typeof attempts)[number]) =>
    a.approvedAt
      ? t("Approved")
      : a.submittedAt
        ? a.finishReason === "timeout"
          ? t("Time ran out · waiting for review")
          : t("Waiting for review")
        : t("In progress");
  const percent = (a: (typeof attempts)[number]) =>
    a.score === null || !a.total
      ? "—"
      : `${Math.round((a.score / a.total) * 100)}%`;

  return (
    <div className="exam-admin">
      <h1>{t("Intermediate final exams")}</h1>
      <p className="muted">
        {t(
          "Each domain has one final exam built from its modules’ checkpoint questions. Students see their result only after you approve it. You can add a note or allow a retake.",
        )}
      </p>
      <nav aria-label={t("Domains")}>
        <ul className="exam-domains">
          {EXAM_SUBJECTS.map((d) => (
            <li key={d.id}>
              <Link
                href={`?domain=${d.id}`}
                aria-current={d.id === domain.id ? "page" : undefined}
              >
                {d.title[locale]}
              </Link>
              {waiting.get(d.id) ? (
                <> ({t("{count} waiting", { count: waiting.get(d.id)! })})</>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
      <h2>{domain.title[locale]}</h2>
      {waitingHere > 0 && (
        <form
          className="exam-waiting"
          action={approveWaitingDomainExamsAction.bind(null, domain.id)}
        >
          <p>
            {t(
              "{count} results are waiting for review. Approve one with its button in the table, open a name to see every answer first, or approve them all at once.",
              { count: waitingHere },
            )}
          </p>
          <button className="button button-primary">
            {t("Approve all {count} and show the students", {
              count: waitingHere,
            })}
          </button>
        </form>
      )}
      <div className="exam-table-wrap">
        <table className="exam-table">
          <caption>{t("Attempts")}</caption>
          <thead>
            <tr>
              <th>{t("Student")}</th>
              <th>{t("Group")}</th>
              <th>{t("Status")}</th>
              <th>{t("Score")}</th>
              <th>{t("Left the window")}</th>
              <th>{t("Submitted")}</th>
              <th>{t("Result review")}</th>
            </tr>
          </thead>
          <tbody>
            {attempts.length === 0 && (
              <tr>
                <td colSpan={7}>{t("Nobody has started this exam yet.")}</td>
              </tr>
            )}
            {attempts.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`?domain=${domain.id}&attempt=${a.id}`}>
                    {a.student.name}
                  </Link>
                </td>
                <td>{a.student.group || "—"}</td>
                <td>{status(a)}</td>
                <td>
                  {a.score ?? "—"}/{a.total ?? "—"} · {percent(a)}
                </td>
                <td>{a.leaves}</td>
                <td>{when(a.submittedAt)}</td>
                <td className="exam-row-actions">
                  {a.submittedAt && (
                    <Link
                      className="button button-secondary"
                      href={`?domain=${domain.id}&attempt=${a.id}#dx-review-title`}
                    >
                      {t("Answers")}
                    </Link>
                  )}
                  {a.submittedAt && !a.approvedAt && (
                    <form action={approveDomainExamAction.bind(null, a.id)}>
                      <button className="button button-primary">
                        {t("Approve")}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <section className="exam-card" aria-labelledby="dx-review-title">
          <h2 id="dx-review-title">
            {selected.student.name} · {status(selected)}
          </h2>
          <p>
            {t("Started:")} {when(selected.startedAt)}
            <br />
            {t("Deadline:")} {when(selected.deadline)}
            <br />
            {t("Submitted:")} {when(selected.submittedAt)}
            <br />
            {t("Left the exam window: {count} times", {
              count: selected.leaves,
            })}
          </p>
          {!result && (
            <p>
              {t(
                "The student is still working. The result appears once it is submitted.",
              )}
            </p>
          )}
          {result && (
            <form action={reviewDomainExamAction.bind(null, selected.id)}>
              <h3>
                {t("Total:")} {result.score}/{result.total} · {result.percent}%
                {" · "}
                {result.passed
                  ? t("Passed ({pass}% needed)", { pass: DOMAIN_EXAM_PASS })
                  : t("Not passed ({pass}% needed)", {
                      pass: DOMAIN_EXAM_PASS,
                    })}
              </h3>
              <ol>
                {result.items.map((item) => (
                  <li key={item.id}>
                    {item.correct ? "✓" : "✗"} {item.ask[locale]} —{" "}
                    {item.picked === null
                      ? t("No answer")
                      : item.options[item.picked][locale]}
                    {!item.correct && (
                      <>
                        {" "}
                        ({t("right:")} {item.options[item.answer][locale]})
                      </>
                    )}{" "}
                    · <span className="muted">{item.module[locale]}</span>
                  </li>
                ))}
              </ol>
              <label>
                {t("Note for the student")}
                <textarea
                  name="note"
                  rows={3}
                  maxLength={3000}
                  defaultValue={selected.note}
                />
              </label>
              <div className="exam-actions">
                <button
                  className="button button-primary"
                  name="decision"
                  value="approve"
                >
                  {selected.approvedAt
                    ? t("Save")
                    : t("Approve and show the student")}
                </button>
                {selected.approvedAt ? (
                  <button
                    className="button button-secondary"
                    name="decision"
                    value="hide"
                  >
                    {t("Hide from the student")}
                  </button>
                ) : (
                  <button
                    className="button button-secondary"
                    name="decision"
                    value="save"
                  >
                    {t("Save without approving")}
                  </button>
                )}
              </div>
            </form>
          )}
          <form action={retakeDomainExamAction.bind(null, selected.id)}>
            <button className="button button-secondary">
              {t("Delete the attempt and allow a retake")}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
