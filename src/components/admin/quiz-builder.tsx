"use client";
import { useId, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2, X } from "lucide-react";
import { useTranslator } from "@/components/locale-provider";
import { parseQuiz, quizToText } from "@/lib/student/quiz";

type Question = {
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
};

const blank = (): Question => ({
  prompt: "",
  options: ["", "", "", ""],
  answer: 0,
  explain: "",
});

function fromText(
  text: string,
): Question[] | { error: string; values?: Record<string, number> } {
  if (!text.trim()) return [blank()];
  const parsed = parseQuiz(text);
  if ("error" in parsed) return parsed;
  return parsed.quiz.map((q) => ({ ...q, explain: q.explain ?? "" }));
}

function initial(text: string, json?: string): Question[] | null {
  if (json) {
    try {
      const raw = JSON.parse(json) as Question[];
      if (Array.isArray(raw) && raw.length) return raw;
    } catch {}
  }
  const parsed = fromText(text);
  return Array.isArray(parsed) ? parsed : null;
}

// Clean questions for text mode: blank options and the answer they held are
// dropped the same way the server drops them.
function toQuiz(questions: Question[]) {
  return questions.map((q) => {
    const kept = q.options
      .map((label, index) => ({ label: label.trim(), index }))
      .filter((o) => o.label);
    return {
      prompt: q.prompt.trim(),
      options: kept.map((o) => o.label),
      answer: Math.max(
        0,
        kept.findIndex((o) => o.index === q.answer),
      ),
      ...(q.explain.trim() ? { explain: q.explain.trim() } : {}),
    };
  });
}

// The visual editor for test questions. It submits the questions as JSON in
// `quizJson`; the text mode keeps the old ?, -, +, > format for pasting.
export function QuizBuilder({ text, json }: { text: string; json?: string }) {
  const t = useTranslator();
  const id = useId();
  const start = initial(text, json);
  const [mode, setMode] = useState<"editor" | "text">(
    start ? "editor" : "text",
  );
  const [questions, setQuestions] = useState<Question[]>(start ?? [blank()]);
  const [source, setSource] = useState(text);
  const [problem, setProblem] = useState("");

  const update = (index: number, change: Partial<Question>) =>
    setQuestions((all) =>
      all.map((q, i) => (i === index ? { ...q, ...change } : q)),
    );
  const move = (index: number, by: number) =>
    setQuestions((all) => {
      const next = [...all];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });

  const toText = () => {
    setSource(quizToText(toQuiz(questions)));
    setProblem("");
    setMode("text");
  };
  const toEditor = () => {
    const parsed = fromText(source);
    if (!Array.isArray(parsed)) {
      setProblem(t(parsed.error, parsed.values));
      return;
    }
    setQuestions(parsed);
    setProblem("");
    setMode("editor");
  };

  const answered = questions.filter(
    (q) => q.prompt.trim() && q.options[q.answer]?.trim(),
  ).length;

  return (
    <fieldset className="admin-field quiz-builder">
      <legend>{t("Questions")}</legend>
      <div className="quiz-builder-bar">
        <div
          role="group"
          aria-label={t("Editing mode")}
          className="quiz-builder-modes"
        >
          <button
            type="button"
            aria-pressed={mode === "editor"}
            onClick={mode === "text" ? toEditor : undefined}
          >
            {t("Editor")}
          </button>
          <button
            type="button"
            aria-pressed={mode === "text"}
            onClick={mode === "editor" ? toText : undefined}
          >
            {t("Text")}
          </button>
        </div>
        {mode === "editor" && (
          <span className="muted">
            {t("{count} questions · {ready} ready", {
              count: questions.length,
              ready: answered,
            })}
          </span>
        )}
      </div>
      {problem && (
        <p className="admin-error" role="alert">
          {problem}
        </p>
      )}

      {mode === "text" ? (
        <>
          <textarea
            id="quizText"
            name="quizText"
            aria-label={t("Questions as text")}
            className="admin-textarea student-quiz-source"
            rows={14}
            maxLength={60000}
            required
            aria-describedby={`${id}-help`}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder={
              "? HTTPS odatda qaysi portdan foydalanadi?\n- 80\n+ 443\n- 22\n> 443 — HTTPS uchun standart port."
            }
          />
          <p id={`${id}-help`} className="muted">
            {t(
              "Start a question with ?, each option with -, and the one correct option with +. Under the options, > lines explain the answer in simple words. Leave a blank line between questions. Answers are checked on the server and never sent to the browser.",
            )}
          </p>
        </>
      ) : (
        <>
          <input
            type="hidden"
            name="quizJson"
            value={JSON.stringify(questions)}
          />
          <ol className="quiz-builder-list">
            {questions.map((q, index) => {
              const base = `${id}-q${index}`;
              const number = index + 1;
              return (
                <li key={index} className="quiz-builder-question">
                  <div className="quiz-builder-head">
                    <label htmlFor={`${base}-prompt`}>
                      {t("Question {number}", { number })}
                    </label>
                    <span className="quiz-builder-tools">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label={t("Move question {number} up", { number })}
                      >
                        <ArrowUp size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === questions.length - 1}
                        aria-label={t("Move question {number} down", {
                          number,
                        })}
                      >
                        <ArrowDown size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setQuestions((all) => [
                            ...all.slice(0, index + 1),
                            { ...q, options: [...q.options] },
                            ...all.slice(index + 1),
                          ])
                        }
                        disabled={questions.length >= 60}
                        aria-label={t("Duplicate question {number}", {
                          number,
                        })}
                      >
                        <Copy size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setQuestions((all) =>
                            all.length > 1
                              ? all.filter((_, i) => i !== index)
                              : [blank()],
                          )
                        }
                        aria-label={t("Delete question {number}", { number })}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                  <textarea
                    id={`${base}-prompt`}
                    className="admin-textarea"
                    rows={2}
                    maxLength={1000}
                    value={q.prompt}
                    onChange={(event) =>
                      update(index, { prompt: event.target.value })
                    }
                  />
                  <fieldset className="quiz-builder-options">
                    <legend>{t("Options — mark the correct one")}</legend>
                    {q.options.map((option, o) => (
                      <div key={o} className="quiz-builder-option">
                        <input
                          type="radio"
                          name={`${base}-answer`}
                          checked={q.answer === o}
                          onChange={() => update(index, { answer: o })}
                          aria-label={t("Option {letter} is correct", {
                            letter: String.fromCharCode(65 + o),
                          })}
                        />
                        <input
                          className="admin-input"
                          maxLength={500}
                          value={option}
                          aria-label={t("Question {number}, option {letter}", {
                            number,
                            letter: String.fromCharCode(65 + o),
                          })}
                          onChange={(event) =>
                            update(index, {
                              options: q.options.map((x, i) =>
                                i === o ? event.target.value : x,
                              ),
                            })
                          }
                        />
                        <button
                          type="button"
                          disabled={q.options.length <= 2}
                          aria-label={t("Remove option {letter}", {
                            letter: String.fromCharCode(65 + o),
                          })}
                          onClick={() =>
                            update(index, {
                              options: q.options.filter((_, i) => i !== o),
                              answer:
                                q.answer === o
                                  ? 0
                                  : q.answer > o
                                    ? q.answer - 1
                                    : q.answer,
                            })
                          }
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                    {q.options.length < 8 && (
                      <button
                        type="button"
                        className="quiz-builder-add-option"
                        onClick={() =>
                          update(index, { options: [...q.options, ""] })
                        }
                      >
                        <Plus size={14} aria-hidden="true" /> {t("Add option")}
                      </button>
                    )}
                  </fieldset>
                  <label htmlFor={`${base}-explain`} className="muted">
                    {t("Explanation shown after the last attempt (optional)")}
                  </label>
                  <textarea
                    id={`${base}-explain`}
                    className="admin-textarea"
                    rows={2}
                    maxLength={2000}
                    value={q.explain}
                    onChange={(event) =>
                      update(index, { explain: event.target.value })
                    }
                  />
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            className="button button-secondary"
            disabled={questions.length >= 60}
            onClick={() => setQuestions((all) => [...all, blank()])}
          >
            <Plus size={15} aria-hidden="true" /> {t("Add question")}
          </button>
          <p className="muted">
            {t(
              "Empty options are ignored. Answers are checked on the server and never sent to the browser; questions and options are shuffled for every student.",
            )}
          </p>
        </>
      )}
    </fieldset>
  );
}
