import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { candidateDraft, finalizeExpired } from "@/lib/html-assessment/service";
import { challengeFor } from "@/lib/html-assessment/challenge";
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
    <div className="exam-admin" lang="uz">
      <Link href="/admin/assessments">← Barcha sinovlar</Link>
      <h1>{exam.title}</h1>
      <p>
        {exam.minutes} daqiqa ·{" "}
        {exam.candidates.filter((c) => c.submittedAt).length}/
        {exam.candidates.length} ish yakunlangan
      </p>
      <div className="exam-actions">
        <Link
          href={`/admin/assessments/${id}`}
          className="button button-secondary"
        >
          Natijalarni yangilash
        </Link>
        <a
          href={`/admin/assessments/${id}/export`}
          className="button button-secondary"
        >
          CSV yuklab olish
        </a>
        {!exam.closed && (
          <form action={closeExamAction.bind(null, id)}>
            <button className="button button-secondary">
              Yangi kirishlarni yopish
            </button>
          </form>
        )}
      </div>
      <p className="muted">
        {exam.closed
          ? "Yangi urinish boshlash yopilgan."
          : "Kod olgan o‘quvchilar sinovni boshlashi mumkin."}{" "}
        Boshlangan urinishlar o‘z muddati bilan tugaydi.
      </p>
      <div className="exam-table-wrap">
        <table className="exam-table">
          <caption>O‘quvchilar va natijalar</caption>
          <thead>
            <tr>
              <th>ID / Ism</th>
              <th>Holat</th>
              <th>Avtomatik /90</th>
              <th>Izoh /10</th>
              <th>Jami /100</th>
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
                        ? "Vaqt tugagan"
                        : "Topshirilgan"
                      : c.startedAt
                        ? "Ishlamoqda"
                        : "Boshlamagan"}
                  </td>
                  <td>{c.autoScore ?? "—"}</td>
                  <td>{c.reviewScore ?? "Kutilmoqda"}</td>
                  <td>
                    {c.autoScore !== null && c.reviewScore !== null
                      ? c.autoScore + c.reviewScore
                      : "Yakunlanmagan"}
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
            {selected.name} · variant {selected.variant + 1}
          </h2>
          <p>
            Boshlangan: {selected.startedAt?.toISOString() ?? "—"}
            <br />
            Muddat: {selected.deadline?.toISOString() ?? "—"}
            <br />
            Topshirilgan: {selected.submittedAt?.toISOString() ?? "—"} (UTC)
          </p>
          <p>
            Qaydlar: tabdan chiqish {draft.signals.hidden}, paste/drop{" "}
            {draft.signals.paste}, to‘liq ekrandan chiqish{" "}
            {draft.signals.fullscreen}. Bu qaydlar ballni avtomatik
            kamaytirmaydi.
          </p>
          {grade && (
            <>
              <h3>Avtomatik baho: {grade.total}/90</h3>
              <ul>
                {grade.practical.map((check) => (
                  <li key={check.label}>
                    {check.points}/5 · {check.label}
                  </li>
                ))}
              </ul>
              {grade.restrictions.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </>
          )}
          <h3>Test javoblari</h3>
          <ol>
            {challenge.questions.map((q) => (
              <li key={q.id}>
                <p>{q.prompt}</p>
                <p>
                  Javob: {q.options[draft.answers[q.id]] ?? "Javob berilmagan"}
                  {grade &&
                    ` · ${grade.quiz.find((item) => item.id === q.id)?.points ?? 0}/5`}
                </p>
              </li>
            ))}
          </ol>
          <h3>O‘quvchi izohlari</h3>
          {challenge.reasoning.map((question, index) => (
            <div key={question}>
              <p>
                <strong>{question}</strong>
              </p>
              <p className="exam-answer">
                {draft.explanations[index] || "Izoh yozilmagan."}
              </p>
            </div>
          ))}
          <details>
            <summary>Topshiriq talablari</summary>
            <ul>
              {challenge.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </details>
          <h3>Saqlangan HTML kodi</h3>
          <pre className="exam-code-review">
            {draft.code || "Kod yozilmagan."}
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
