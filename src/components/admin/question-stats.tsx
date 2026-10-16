import { hardest, type QuestionStat } from "@/lib/student/quiz-stats";

type T = (source: string, values?: Record<string, string | number>) => string;

const clip = (text: string, length = 120) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

// Which questions the class gets wrong, and the wrong answer they pick most.
export function QuestionStats({
  stats,
  counted,
  skipped,
  t,
}: {
  stats: QuestionStat[];
  counted: number;
  skipped: number;
  t: T;
}) {
  if (!counted)
    return <p className="muted">{t("No attempts to analyse yet.")}</p>;
  const top = hardest(stats);
  return (
    <>
      <p className="muted">
        {t("Based on {count} attempts.", { count: counted })}
        {skipped > 0 &&
          ` ${t("{count} attempts made before the questions were edited are left out.", { count: skipped })}`}
      </p>
      {top.length > 0 && (
        <ul className="admin-attention">
          {top.map((s) => (
            <li key={s.index}>
              <strong>
                {t("Question {number}", { number: s.index + 1 })} ·{" "}
                {t("{percent}% wrong", { percent: s.wrongPercent })}
              </strong>
              <span className="muted">
                {clip(s.prompt, 90)}
                {s.trap &&
                  ` — ${t("most chose “{answer}”", { answer: clip(s.trap.label, 60) })}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table admin-question-stats">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">{t("Question")}</th>
              <th scope="col">{t("Wrong")}</th>
              <th scope="col">{t("Most common wrong answer")}</th>
              <th scope="col">{t("Blank")}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.index}>
                <td>{s.index + 1}</td>
                <td>
                  {clip(s.prompt)}
                  <span className="admin-cell-detail">
                    {t("Correct: {answer}", { answer: clip(s.answer, 80) })}
                  </span>
                </td>
                <td>
                  <span
                    className={`admin-chip ${s.wrongPercent >= 50 ? "warn" : s.wrongPercent <= 20 ? "ok" : ""}`}
                  >
                    {s.wrongPercent}%
                  </span>
                  <span className="admin-cell-detail">
                    {s.attempts - s.correct}/{s.attempts}
                  </span>
                </td>
                <td>
                  {s.trap ? `${clip(s.trap.label, 80)} (${s.trap.count})` : "—"}
                </td>
                <td>{s.blank || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
