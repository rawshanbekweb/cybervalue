import Link from "next/link";
import { getAdminTranslator } from "@/lib/i18n/server";
import { ReviewForm } from "./student-forms";

type Row = {
  id: string;
  heading: string;
  href: string;
  kind: string;
  body: string;
  score: number | null;
  maxScore: number | null;
  feedback: string;
  reviewedAt: Date | null;
  createdAt: Date;
};

const stamp = (date: Date) =>
  date.toISOString().slice(0, 16).replace("T", " ") + " UTC";

// Shared by a student's page (heading = material) and a material's page
// (heading = student). Quiz attempts show the server score; practice answers
// carry a review form.
export async function SubmissionList({ submissions }: { submissions: Row[] }) {
  const t = await getAdminTranslator();
  if (!submissions.length) return <p className="muted">{t("Nothing yet.")}</p>;
  return (
    <ol className="student-submissions">
      {submissions.map((s) => (
        <li key={s.id}>
          <p>
            <Link href={s.href}>
              <strong>{s.heading}</strong>
            </Link>{" "}
            <span className="muted">{stamp(s.createdAt)}</span>
          </p>
          {s.kind === "QUIZ" ? (
            <p>
              {t("Test result: {score} of {total}", {
                score: s.score ?? 0,
                total: s.maxScore ?? 0,
              })}
            </p>
          ) : (
            <>
              <pre className="student-submission-body">{s.body}</pre>
              {!s.reviewedAt && (
                <p className="admin-warn">{t("Waiting for review")}</p>
              )}
              <ReviewForm id={s.id} score={s.score} feedback={s.feedback} />
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
