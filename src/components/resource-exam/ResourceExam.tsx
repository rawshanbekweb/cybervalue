"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CHOICES,
  CHOICE_POINTS,
  EXAM_MINUTES,
  GROUP_LABELS,
  MAX_PRACTICE,
  MAX_TEST,
  MAX_TOTAL,
  TASKS,
  type ExamAnswers,
  type ExamGroup,
  type ExamInput,
  type ExamResult,
} from "@/lib/resource-exam/content";
import "./resource-exam.css";

const STORAGE_KEY = "cybervalue-resource-exam-v1";
const GROUPS: ExamGroup[] = ["web", "linux"];
const TOTAL_INPUTS =
  CHOICES.length + TASKS.reduce((sum, task) => sum + task.inputs.length, 0);

type Saved = { answers: ExamAnswers; startedAt: number };
type Phase = "intro" | "working" | "result";

function readSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    if (
      typeof parsed.startedAt !== "number" ||
      typeof parsed.answers !== "object" ||
      parsed.answers === null
    )
      return null;
    return { answers: parsed.answers, startedAt: parsed.startedAt };
  } catch {
    return null;
  }
}
function writeSaved(value: Saved | null) {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the exam still works, it just cannot resume.
  }
}
const clock = (seconds: number) => {
  const s = Math.max(0, seconds);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export function ResourceExam() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<ExamAnswers>({});
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resumable, setResumable] = useState(false);
  const submitted = useRef(false);
  const answersRef = useRef<ExamAnswers>({});

  useEffect(() => {
    // Storage is only readable in the browser; load it after hydration.
    const id = window.setTimeout(() => {
      const saved = readSaved();
      if (saved && Date.now() - saved.startedAt < EXAM_MINUTES * 60000) {
        setAnswers(saved.answers);
        answersRef.current = saved.answers;
        setStartedAt(saved.startedAt);
        setResumable(true);
      } else if (saved) {
        writeSaved(null);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const answered = useMemo(
    () => Object.values(answers).filter((value) => value.trim()).length,
    [answers],
  );

  const submit = useCallback(async (current: ExamAnswers) => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/resources/exam/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: current }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Xatolik yuz berdi.");
      setResult(data as ExamResult);
      setPhase("result");
      writeSaved(null);
      window.scrollTo({ top: 0 });
    } catch (caught) {
      submitted.current = false;
      setError(
        caught instanceof Error
          ? caught.message
          : "Yuborib bo‘lmadi. Javoblaringiz saqlangan, qayta urinib ko‘ring.",
      );
    } finally {
      setSubmitting(false);
      setConfirming(false);
    }
  }, []);

  useEffect(() => {
    if (phase !== "working") return;
    const deadline = startedAt + EXAM_MINUTES * 60000;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) void submit(answersRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, startedAt, submit]);

  const remaining =
    phase === "working" && now
      ? Math.ceil((startedAt + EXAM_MINUTES * 60000 - now) / 1000)
      : EXAM_MINUTES * 60;

  function begin(resume: boolean) {
    const start = resume ? startedAt : Date.now();
    const initial = resume ? answers : {};
    setAnswers(initial);
    answersRef.current = initial;
    setNow(Date.now());
    setStartedAt(start);
    setResult(null);
    setError("");
    submitted.current = false;
    writeSaved({ answers: initial, startedAt: start });
    setPhase("working");
  }

  function setAnswer(id: string, value: string) {
    const next = { ...answersRef.current, [id]: value };
    answersRef.current = next;
    setAnswers(next);
    writeSaved({ answers: next, startedAt });
    setConfirming(false);
  }

  if (phase === "intro")
    return (
      <div className="rx-shell" lang="uz">
        <section className="rx-intro">
          <span className="rx-eyebrow">RESURSLAR / IMTIHON 1</span>
          <h1>
            Web va Linux asoslari imtihoni<span>.</span>
          </h1>
          <p>
            Imtihon ikki resurs slaydiga asoslangan: «Web qanday ishlaydi?»
            (barcha 75 slayd) va «Linux va Tarmoq Asoslari» (faqat 1–20
            slaydlar). Faqat test emas: URL, subnet, routing, DNS, HTTP va
            terminal buyruqlari bilan amaliy ishlar ham bor.
          </p>
          <div className="rx-stats">
            <div>
              <strong>{MAX_TOTAL}</strong>
              <span>umumiy ball</span>
            </div>
            <div>
              <strong>{MAX_TEST}</strong>
              <span>test ({CHOICES.length} savol)</span>
            </div>
            <div>
              <strong>{MAX_PRACTICE}</strong>
              <span>amaliy ish ({TASKS.length} topshiriq)</span>
            </div>
            <div>
              <strong>{EXAM_MINUTES}</strong>
              <span>daqiqa</span>
            </div>
          </div>
        </section>
        <section className="rx-card">
          <h2>Qoidalar</h2>
          <ul>
            <li>
              Vaqt «Imtihonni boshlash» bosilganda ketadi va tugagach javoblar
              avtomatik yuboriladi.
            </li>
            <li>
              Javoblar shu brauzerda saqlanadi: sahifani yangilasangiz, vaqt
              tugamaguncha davom ettirish mumkin.
            </li>
            <li>
              Terminal topshiriqlarida buyruqni o‘zingiz yozasiz. Buyruqning
              to‘g‘riligi serverda tekshiriladi.
            </li>
            <li>
              Natija darhol ko‘rsatiladi: qayerda xato qilganingiz va tegishli
              slayd raqami bilan.
            </li>
            <li>
              Qayta topshirish mumkin; har safar javoblar noldan boshlanadi.
            </li>
          </ul>
          <div className="rx-actions">
            {resumable && (
              <button
                className="button button-primary"
                onClick={() => begin(true)}
              >
                Davom ettirish
              </button>
            )}
            <button
              className={`button ${resumable ? "button-secondary" : "button-primary"}`}
              onClick={() => begin(false)}
            >
              {resumable ? "Yangidan boshlash" : "Imtihonni boshlash"}
            </button>
            <Link className="button button-secondary" href="/resources">
              Resurslarga qaytish
            </Link>
          </div>
        </section>
      </div>
    );

  if (phase === "result" && result)
    return <ResultView result={result} onRetry={() => setPhase("intro")} />;

  const empty = TOTAL_INPUTS - answered;
  return (
    <div className="rx-shell" lang="uz">
      <header className="rx-toolbar">
        <div>
          <span className="rx-eyebrow">RESURSLAR IMTIHONI</span>
          <div className="rx-progress">
            {answered} / {TOTAL_INPUTS} javob berildi
          </div>
        </div>
        <div
          className={`rx-timer ${remaining <= 300 ? "rx-timer-low" : ""}`}
          role="timer"
          aria-label="Qolgan vaqt"
        >
          {clock(remaining)}
        </div>
        <div className="rx-submit">
          {confirming ? (
            <>
              <span>
                {empty > 0 ? `${empty} ta javob bo‘sh. ` : ""}Topshiraymi?
              </span>
              <button
                className="button button-primary"
                disabled={submitting}
                onClick={() => void submit(answers)}
              >
                {submitting ? "Tekshirilmoqda…" : "Ha, topshirish"}
              </button>
              <button
                className="button button-secondary"
                onClick={() => setConfirming(false)}
              >
                Bekor
              </button>
            </>
          ) : (
            <button
              className="button button-primary"
              onClick={() => setConfirming(true)}
            >
              Topshirish
            </button>
          )}
        </div>
      </header>
      {error && (
        <p role="alert" className="rx-error">
          {error}
        </p>
      )}

      <h2 className="rx-part">A qism · Test ({MAX_TEST} ball)</h2>
      {GROUPS.map((group) => (
        <section
          key={group}
          className="rx-card"
          aria-labelledby={`rx-test-${group}`}
        >
          <h3 id={`rx-test-${group}`}>{GROUP_LABELS[group]}</h3>
          {CHOICES.filter((c) => c.group === group).map((choice, index) => (
            <fieldset key={choice.id} className="rx-question">
              <legend>
                <span className="rx-num">{index + 1}</span>
                {choice.prompt}
                <small>
                  {choice.slide} slayd · {CHOICE_POINTS} ball
                </small>
              </legend>
              {choice.options.map((option, optionIndex) => (
                <label key={option} className="rx-option">
                  <input
                    type="radio"
                    name={choice.id}
                    checked={answers[choice.id] === String(optionIndex)}
                    onChange={() => setAnswer(choice.id, String(optionIndex))}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </section>
      ))}

      <h2 className="rx-part">B qism · Amaliy ishlar ({MAX_PRACTICE} ball)</h2>
      {GROUPS.map((group) => (
        <div key={group}>
          <h3 className="rx-group">{GROUP_LABELS[group]}</h3>
          {TASKS.filter((t) => t.group === group).map((task) => (
            <section
              key={task.id}
              className="rx-card"
              aria-labelledby={`rx-task-${task.id}`}
            >
              <h4 id={`rx-task-${task.id}`}>
                {task.title}
                <small>
                  {task.slide} slayd ·{" "}
                  {task.inputs.reduce((sum, input) => sum + input.points, 0)}{" "}
                  ball
                </small>
              </h4>
              <p>{task.brief}</p>
              {task.scene && (
                <pre className="rx-scene" aria-label="Berilgan ma’lumot">
                  {task.scene}
                </pre>
              )}
              <div className="rx-inputs">
                {task.inputs.map((input) => (
                  <TaskInput
                    key={input.id}
                    input={input}
                    value={answers[input.id] ?? ""}
                    onChange={(value) => setAnswer(input.id, value)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ))}
    </div>
  );
}

function TaskInput({
  input,
  value,
  onChange,
}: {
  input: ExamInput;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `rx-in-${input.id}`;
  const label = (
    <span>
      {input.label}
      <small>{input.points} ball</small>
    </span>
  );
  if (input.kind === "select")
    return (
      <label htmlFor={id} className="rx-field">
        {label}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— tanlang —</option>
          {input.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  if (input.kind === "text")
    return (
      <label htmlFor={id} className="rx-field">
        {label}
        <input
          id={id}
          value={value}
          maxLength={200}
          autoComplete="off"
          spellCheck={false}
          placeholder={input.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  const terminal = input.kind === "command";
  return (
    <label htmlFor={id} className="rx-field rx-field-wide">
      {label}
      <span className={terminal ? "rx-terminal" : undefined}>
        {terminal && <b aria-hidden="true">$</b>}
        <textarea
          id={id}
          value={value}
          rows={input.kind === "request" ? 6 : 2}
          maxLength={1000}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={input.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </span>
    </label>
  );
}

function ResultView({
  result,
  onRetry,
}: {
  result: ExamResult;
  onRetry: () => void;
}) {
  const byId = new Map(result.items.map((item) => [item.id, item]));
  const percent = Math.round((result.total / result.max) * 100);
  const grade =
    percent >= 85
      ? "A’lo"
      : percent >= 70
        ? "Yaxshi"
        : percent >= 55
          ? "Qoniqarli"
          : "Qayta tayyorlaning";
  return (
    <div className="rx-shell" lang="uz">
      <section className="rx-card rx-result">
        <span className="rx-eyebrow">NATIJA</span>
        <p className="rx-score">
          <strong>{result.total}</strong> / {result.max}
          <span>
            {percent}% · {grade}
          </span>
        </p>
        <div className="rx-stats">
          <div>
            <strong>
              {result.test.score}/{result.test.max}
            </strong>
            <span>A qism · test</span>
          </div>
          <div>
            <strong>
              {result.practice.score}/{result.practice.max}
            </strong>
            <span>B qism · amaliy</span>
          </div>
        </div>
        <div className="rx-actions">
          <button className="button button-primary" onClick={onRetry}>
            Qayta topshirish
          </button>
          <Link className="button button-secondary" href="/resources">
            Resurslarga qaytish
          </Link>
        </div>
      </section>

      <h2 className="rx-part">A qism · Test</h2>
      <section className="rx-card">
        {CHOICES.map((choice) => {
          const item = byId.get(choice.id);
          if (!item) return null;
          return (
            <article
              key={choice.id}
              className={`rx-review ${item.score ? "rx-ok" : "rx-bad"}`}
            >
              <h4>
                <span aria-hidden="true">{item.score ? "✓" : "✗"}</span>
                {choice.prompt}
                <small>
                  {item.score}/{item.max} · {choice.slide} slayd
                </small>
              </h4>
              {!item.score && item.expected && (
                <p>
                  <b>To‘g‘ri javob:</b> {item.expected}
                </p>
              )}
              {item.explain && <p className="rx-explain">{item.explain}</p>}
            </article>
          );
        })}
      </section>

      <h2 className="rx-part">B qism · Amaliy ishlar</h2>
      {TASKS.map((task) => (
        <section key={task.id} className="rx-card">
          <h4>
            {task.title}
            <small>{task.slide} slayd</small>
          </h4>
          {task.inputs.map((input) => {
            const item = byId.get(input.id);
            if (!item) return null;
            const full = item.score === item.max;
            return (
              <article
                key={input.id}
                className={`rx-review ${full ? "rx-ok" : item.score ? "rx-part-ok" : "rx-bad"}`}
              >
                <h4>
                  <span aria-hidden="true">
                    {full ? "✓" : item.score ? "◐" : "✗"}
                  </span>
                  {input.label}
                  <small>
                    {item.score}/{item.max}
                  </small>
                </h4>
                {item.expected && (
                  <>
                    <p>
                      <b>Namuna javob:</b>
                    </p>
                    <pre className="rx-scene">{item.expected}</pre>
                  </>
                )}
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
