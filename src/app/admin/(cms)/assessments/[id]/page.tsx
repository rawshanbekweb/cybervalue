import { getAdminTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { candidateDraft, finalizeExpired } from "@/lib/html-assessment/service";
import { challengeFor } from "@/lib/html-assessment/challenge";
import { fillTemplate } from "@/lib/html-assessment/contract";
import type { Grade } from "@/lib/html-assessment/grading";
import { ReviewForm } from "@/components/admin/assessment-forms";
import { closeExamAction } from "../actions";
import "@/components/playground/html-assessment/assessment.css";

export default async function ExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ student?: string }>;
}) {
  const t = await getAdminTranslator();
  await requireAdmin("/admin/assessments");
  const db = getDb();
  if (!db) notFound();
  const { id } = await params;
  await finalizeExpired(db, id);
  const exam = await db.htmlExam.findUnique({
    where: { id },
    include: { candidates: { orderBy: { studentId: "asc" } } },
  });
  if (!exam) notFound();
  const { student } = await searchParams;
  const selected = exam.candidates.find(
    (candidate) => candidate.id === student,
  );
  const draft = selected ? candidateDraft(selected) : null;
  const challenge = selected ? challengeFor(selected.variant) : null;
  const grade = selected?.grading as Grade | null;
  return (
    <div className="exam-admin">
      <Link href="/admin/assessments">{t("← Barcha sinovlar")}</Link>
      <h1>{exam.title}</h1>
      <p>
        {t("{minutes} min · {done} finished", {
          minutes: exam.minutes,
          done: `${exam.candidates.filter((c) => c.submittedAt).length}/${exam.candidates.length}`,
        })}
      </p>
      <div className="exam-actions">
        <Link
          href={`/admin/assessments/${id}`}
          className="button button-secondary"
        >
          {t("Natijalarni yangilash")}
        </Link>
        <a
          href={`/admin/assessments/${id}/export`}
          className="button button-secondary"
        >
          {t("CSV yuklab olish")}
        </a>
        {!exam.closed && (
          <form action={closeExamAction.bind(null, id)}>
            <button className="button button-secondary">
              {t("Yangi kirishlarni yopish")}
            </button>
          </form>
        )}
      </div>
      <p className="muted">
        {exam.closed
          ? t("Yangi urinish boshlash yopilgan.")
          : t("Kod olgan o‘quvchilar sinovni boshlashi mumkin.")}{" "}
        {t("Boshlangan urinishlar o‘z muddati bilan tugaydi.")}
      </p>
      <div className="exam-table-wrap">
        <table className="exam-table">
          <caption>{t("O‘quvchilar va natijalar")}</caption>
          <thead>
            <tr>
              <th>{t("ID / Ism")}</th>
              <th>Holat</th>
              <th>{t("Avtomatik /90")}</th>
              <th>{t("Izoh /10")}</th>
              <th>{t("Jami /100")}</th>
              <th>Tab / Paste</th>
            </tr>
          </thead>
          <tbody>
            {exam.candidates.map((c) => {
              const signals = candidateDraft(c).signals;
              return (
                <tr key={c.id}>
                  <td>
                    <Link href={`?student=${c.id}`}>
                      {c.studentId} · {c.name}
                    </Link>
                  </td>
                  <td>
                    {c.submittedAt
                      ? c.finishReason === "timeout"
                        ? t("Vaqt tugagan")
                        : t("Topshirilgan")
                      : c.startedAt
                        ? t("Ishlamoqda")
                        : t("Boshlamagan")}
                  </td>
                  <td>{c.autoScore ?? "—"}</td>
                  <td>{c.reviewScore ?? t("Kutilmoqda")}</td>
                  <td>
                    {c.autoScore !== null && c.reviewScore !== null
                      ? c.autoScore + c.reviewScore
                      : t("Yakunlanmagan")}
                  </td>
                  <td>
                    {signals.hidden} / {signals.paste}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected && draft && challenge && (
        <section className="exam-card">
          <h2>
            {selected.name} · {t("variant")} {selected.variant + 1}
          </h2>
          <p>
            {t("Boshlangan:")} {selected.startedAt?.toISOString() ?? "—"}
            <br />
            {t("Muddat:")} {selected.deadline?.toISOString() ?? "—"}
            <br />
            {t("Topshirilgan:")} {selected.submittedAt?.toISOString() ?? "—"}{" "}
            (UTC)
          </p>
          <p>
            {t(
              "Records: left the tab {hidden}, paste/drop {paste}, left full screen {fullscreen}. These records don’t lower the score automatically.",
              draft.signals,
            )}
          </p>
          {grade && (
            <>
              <h3>
                {t("Avtomatik baho:")} {grade.total}/90
              </h3>
              <ul>
                {grade.practical.map((check) => (
                  <li key={check.label}>
                    {check.points}/5 · {check.label}
                  </li>
                ))}
              </ul>
              {grade.restrictions.map((message) => (
                <p key={message}>{t(message)}</p>
              ))}
            </>
          )}
          <h3>{t("Test javoblari")}</h3>
          <ol>
            {challenge.questions.map((q) => (
              <li key={q.id}>
                <p>{q.prompt}</p>
                <p>
                  {t("Javob:")}{" "}
                  {q.options[draft.answers[q.id]] ?? t("Javob berilmagan")}
                  {grade &&
                    ` · ${grade.quiz.find((item) => item.id === q.id)?.points ?? 0}/5`}
                </p>
              </li>
            ))}
          </ol>
          <h3>{t("O‘quvchi izohlari")}</h3>
          {challenge.reasoning.map((question, index) => (
            <div key={question}>
              <p>
                <strong>{question}</strong>
              </p>
              <p className="exam-answer">
                {draft.explanations[index] || t("Izoh yozilmagan.")}
              </p>
            </div>
          ))}
          <details>
            <summary>{t("Topshiriq talablari")}</summary>
            <ul>
              {challenge.requirements.map((r) => (
                <li key={r}>{fillTemplate(r, challenge.values)}</li>
              ))}
            </ul>
          </details>
          <h3>{t("Saqlangan HTML kodi")}</h3>
          <pre className="exam-code-review">
            {draft.code || t("Kod yozilmagan.")}
          </pre>
          {selected.submittedAt && (
            <ReviewForm
              key={selected.id}
              candidateId={selected.id}
              score={selected.reviewScore}
              note={selected.reviewNote}
            />
          )}
        </section>
      )}
    </div>
  );
}
