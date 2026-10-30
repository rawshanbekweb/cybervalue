"use client";

import { useTranslator } from "@/components/locale-provider";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CHOICES,
  LINUX_IP_EXAM_MINUTES,
  LINUX_IP_EXAM_PATH,
  MAX_OPEN,
  MAX_TEST,
  MAX_TOTAL,
  OPENS,
  TOPIC_LABELS,
  type LipAnswers,
  type LipResult,
  type LipTopic,
} from "@/lib/linux-ip-exam/content";
import "./resource-exam.css";
import "./linux-ip-exam.css";

const STORAGE_KEY = "cybervalue-linux-ip-exam-v1";
const TOPICS: LipTopic[] = ["linux", "ip"];
const TOTAL = CHOICES.length + OPENS.length;
const LIMIT = LINUX_IP_EXAM_MINUTES * 60000;

type Saved = { answers: LipAnswers; startedAt: number; leaves: number };
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
    return {
      answers: parsed.answers,
      startedAt: parsed.startedAt,
      leaves: typeof parsed.leaves === "number" ? parsed.leaves : 0,
    };
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
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const fmt = (n: number) => String(n).replace(".", ",");

/** Show `backticked` parts of a question as code. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`)/)
        .map((part, i) =>
          part.startsWith("`") && part.endsWith("`") ? (
            <code key={i}>{part.slice(1, -1)}</code>
          ) : (
            part
          ),
        )}
    </>
  );
}

/** Keys that copy, paste, save, print or open developer tools. */
const BLOCKED_WITH_MOD = new Set(["c", "x", "v", "a", "p", "s", "u"]);
const BLOCKED_WITH_SHIFT = new Set(["i", "j", "c", "s"]);
const editable = (target: EventTarget | null) =>
  target instanceof HTMLElement && target.matches("input, textarea, select");

/**
 * While the exam runs: no copying, pasting, selecting, right-click, printing
 * or saving, and the questions are hidden whenever the window loses focus
 * (as screenshot tools and other apps make it do). A browser cannot stop a
 * photo of the screen; it can make one harder and count every time a student
 * leaves the exam.
 */
function useExamGuard(active: boolean, onLeave: () => void) {
  const [hidden, setHidden] = useState(false);
  const hiddenRef = useRef(false);
  /** Entering full screen blurs the window for a moment; that isn't leaving. */
  const graceUntil = useRef(0);
  const leave = useRef(onLeave);
  useEffect(() => {
    leave.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    if (!active) return;
    const flag = () => {
      if (hiddenRef.current || Date.now() < graceUntil.current) return;
      hiddenRef.current = true;
      setHidden(true);
      leave.current();
    };
    const block = (e: Event) => e.preventDefault();
    const blockSelect = (e: Event) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const scrubClipboard = () => {
      navigator.clipboard?.writeText("").catch(() => {});
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (
        key === "printscreen" ||
        key === "f12" ||
        (mod && BLOCKED_WITH_MOD.has(key)) ||
        (mod && e.shiftKey && BLOCKED_WITH_SHIFT.has(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (key === "printscreen") {
        scrubClipboard();
        flag();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      // Windows reports PrintScreen only on key-up.
      if (e.key.toLowerCase() === "printscreen") {
        scrubClipboard();
        flag();
      }
    };
    // A blur only counts if focus doesn't come straight back: browsers blur
    // the window for a moment on some clicks and on entering full screen.
    let blurTimer = 0;
    const onBlur = () => {
      window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(() => {
        if (!document.hasFocus()) flag();
      }, 300);
    };
    const onVisibility = () => {
      if (document.hidden) flag();
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) flag();
    };
    const listeners: [EventTarget, string, EventListener][] = [
      [document, "copy", block],
      [document, "cut", block],
      [document, "paste", block],
      [document, "contextmenu", block],
      [document, "dragstart", block],
      [document, "drop", block],
      [document, "selectstart", blockSelect],
      [document, "keydown", onKeyDown as EventListener],
      [document, "keyup", onKeyUp as EventListener],
      [document, "visibilitychange", onVisibility],
      [document, "fullscreenchange", onFullscreen],
      [window, "blur", onBlur],
      [window, "beforeprint", flag],
    ];
    for (const [target, type, fn] of listeners)
      target.addEventListener(type, fn, { capture: true });
    return () => {
      window.clearTimeout(blurTimer);
      for (const [target, type, fn] of listeners)
        target.removeEventListener(type, fn, { capture: true });
    };
  }, [active]);

  /** Go full screen; the moment of switching doesn't count as leaving. */
  const fullscreen = useCallback(() => {
    graceUntil.current = Date.now() + 1500;
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);
  const back = useCallback(() => {
    hiddenRef.current = false;
    setHidden(false);
    fullscreen();
  }, [fullscreen]);
  return { hidden, back, fullscreen };
}

export function LinuxIpExam() {
  const t = useTranslator();
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<LipAnswers>({});
  const [startedAt, setStartedAt] = useState(0);
  const [leaves, setLeaves] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<LipResult | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resumable, setResumable] = useState(false);
  const submitted = useRef(false);
  const answersRef = useRef<LipAnswers>({});
  const leavesRef = useRef(0);
  const startedRef = useRef(0);

  useEffect(() => {
    // Storage is only readable in the browser; load it after hydration.
    const id = window.setTimeout(() => {
      const saved = readSaved();
      if (saved && Date.now() - saved.startedAt < LIMIT) {
        setAnswers(saved.answers);
        answersRef.current = saved.answers;
        setStartedAt(saved.startedAt);
        startedRef.current = saved.startedAt;
        setLeaves(saved.leaves);
        leavesRef.current = saved.leaves;
        setResumable(true);
      } else if (saved) {
        writeSaved(null);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const onLeave = useCallback(() => {
    if (submitted.current) return;
    leavesRef.current += 1;
    setLeaves(leavesRef.current);
    writeSaved({
      answers: answersRef.current,
      startedAt: startedRef.current,
      leaves: leavesRef.current,
    });
  }, []);
  const guard = useExamGuard(phase === "working", onLeave);

  const answered = useMemo(
    () => Object.values(answers).filter((value) => value.trim()).length,
    [answers],
  );

  const submit = useCallback(
    async (current: LipAnswers) => {
      if (submitted.current) return;
      submitted.current = true;
      setSubmitting(true);
      setError("");
      try {
        const response = await fetch(`${LINUX_IP_EXAM_PATH}/api`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: current }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? t("Xatolik yuz berdi."));
        setResult(data as LipResult);
        setPhase("result");
        writeSaved(null);
        if (document.fullscreenElement)
          document.exitFullscreen().catch(() => {});
        window.scrollTo({ top: 0 });
      } catch (caught) {
        submitted.current = false;
        setError(
          caught instanceof Error
            ? caught.message
            : t(
                "Yuborib bo‘lmadi. Javoblaringiz saqlangan, qayta urinib ko‘ring.",
              ),
        );
      } finally {
        setSubmitting(false);
        setConfirming(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (phase !== "working") return;
    const deadline = startedAt + LIMIT;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) void submit(answersRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, startedAt, submit]);

  const remaining =
    phase === "working" && now
      ? Math.ceil((startedAt + LIMIT - now) / 1000)
      : LINUX_IP_EXAM_MINUTES * 60;

  function begin(resume: boolean) {
    const start = resume ? startedAt : Date.now();
    const initial = resume ? answers : {};
    const left = resume ? leaves : 0;
    setAnswers(initial);
    answersRef.current = initial;
    setLeaves(left);
    leavesRef.current = left;
    setNow(Date.now());
    setStartedAt(start);
    startedRef.current = start;
    setResult(null);
    setError("");
    submitted.current = false;
    writeSaved({ answers: initial, startedAt: start, leaves: left });
    guard.fullscreen();
    setPhase("working");
  }

  function setAnswer(id: string, value: string) {
    const next = { ...answersRef.current, [id]: value };
    answersRef.current = next;
    setAnswers(next);
    writeSaved({ answers: next, startedAt, leaves: leavesRef.current });
    setConfirming(false);
  }

  if (phase === "intro")
    return (
      <div className="rx-shell">
        <section className="rx-intro">
          <span className="rx-eyebrow">{t("RESURSLAR / IMTIHON 2")}</span>
          <h1>
            {t("Linux va IP manzil imtihoni")}
            <span>.</span>
          </h1>
          <p>
            {t(
              "Linux terminal buyruqlari va IP manzillar bo‘yicha umumlashtiruvchi imtihon: 40 ta test va 10 ta ochiq savol. Savollar qiyinligiga qarab 0,9 dan 4 ballgacha baholanadi.",
            )}
          </p>
          <div className="rx-stats">
            <div>
              <strong>{fmt(MAX_TOTAL)}</strong>
              <span>{t("umumiy ball")}</span>
            </div>
            <div>
              <strong>{fmt(MAX_TEST)}</strong>
              <span>
                {t("test ({count} savol)", { count: CHOICES.length })}
              </span>
            </div>
            <div>
              <strong>{fmt(MAX_OPEN)}</strong>
              <span>
                {t("ochiq savol ({count} ta)", { count: OPENS.length })}
              </span>
            </div>
            <div>
              <strong>2</strong>
              <span>{t("soat")}</span>
            </div>
          </div>
        </section>
        <section className="rx-card">
          <h2>{t("Qoidalar")}</h2>
          <ul>
            <li>
              {t(
                "Vaqt — 2 soat. U «Imtihonni boshlash» bosilganda ketadi va tugagach javoblar avtomatik yuboriladi.",
              )}
            </li>
            <li>
              {t(
                "Imtihon vaqtida nusxa olish, joylash, matnni belgilash, o‘ng tugma, chop etish va skrinshot tugmalari o‘chiriladi.",
              )}
            </li>
            <li>
              {t(
                "Imtihon to‘liq ekranda ochiladi. Boshqa oyna yoki ilovaga o‘tsangiz, savollar yashiriladi va bu qayd etiladi.",
              )}
            </li>
            <li>
              {t(
                "Ochiq savollarda buyruq yoki javobni o‘zingiz yozasiz; to‘g‘riligi serverda tekshiriladi.",
              )}
            </li>
            <li>
              {t(
                "Natija darhol ko‘rsatiladi: har bir savol bo‘yicha ball va to‘g‘ri javob bilan.",
              )}
            </li>
          </ul>
          <div className="rx-actions">
            {resumable && (
              <button
                className="button button-primary"
                onClick={() => begin(true)}
              >
                {t("Davom ettirish")}
              </button>
            )}
            <button
              className={`button ${resumable ? "button-secondary" : "button-primary"}`}
              onClick={() => begin(false)}
            >
              {resumable ? t("Yangidan boshlash") : t("Imtihonni boshlash")}
            </button>
            <Link className="button button-secondary" href="/resources">
              {t("Resurslarga qaytish")}
            </Link>
          </div>
        </section>
      </div>
    );

  if (phase === "result" && result)
    return (
      <ResultView
        result={result}
        leaves={leaves}
        onRetry={() => setPhase("intro")}
      />
    );

  const empty = TOTAL - answered;
  return (
    <div className="rx-shell lip-guard">
      <header className="rx-toolbar">
        <div>
          <span className="rx-eyebrow">{t("LINUX VA IP IMTIHONI")}</span>
          <div className="rx-progress">
            {answered} / {TOTAL} {t("javob berildi")}
            {leaves > 0 && (
              <span className="lip-leaves">
                {" "}
                · {t("oynadan chiqish: {count}", { count: leaves })}
              </span>
            )}
          </div>
        </div>
        <div
          className={`rx-timer ${remaining <= 600 ? "rx-timer-low" : ""}`}
          role="timer"
          aria-label={t("Qolgan vaqt")}
        >
          {clock(remaining)}
        </div>
        <div className="rx-submit">
          {confirming ? (
            <>
              <span>
                {empty > 0
                  ? `${t("{count} ta javob bo‘sh.", { count: empty })} `
                  : ""}
                {t("Topshiraymi?")}
              </span>
              <button
                className="button button-primary"
                disabled={submitting}
                onClick={() => void submit(answers)}
              >
                {submitting ? t("Tekshirilmoqda…") : t("Ha, topshirish")}
              </button>
              <button
                className="button button-secondary"
                onClick={() => setConfirming(false)}
              >
                {t("Bekor")}
              </button>
            </>
          ) : (
            <button
              className="button button-primary"
              onClick={() => setConfirming(true)}
            >
              {t("Topshirish")}
            </button>
          )}
        </div>
      </header>
      {error && (
        <p role="alert" className="rx-error">
          {t(error)}
        </p>
      )}

      {guard.hidden && (
        <div className="lip-cover" role="alertdialog" aria-modal="true">
          <div className="rx-card">
            <h2>{t("Siz imtihon oynasidan chiqdingiz")}</h2>
            <p>
              {t(
                "Boshqa oyna, ilova yoki skrinshot vositasiga o‘tilganda savollar yashiriladi. Bu holat qayd etildi: {count} marta.",
                { count: leaves },
              )}
            </p>
            <button className="button button-primary" onClick={guard.back}>
              {t("Imtihonga qaytish")}
            </button>
          </div>
        </div>
      )}

      <div className="lip-body" aria-hidden={guard.hidden || undefined}>
        <h2 className="rx-part">
          {t("A qism · Test ({points} ball)", { points: fmt(MAX_TEST) })}
        </h2>
        {TOPICS.map((topic) => (
          <section
            key={topic}
            className="rx-card"
            aria-labelledby={`lip-test-${topic}`}
          >
            <h3 id={`lip-test-${topic}`}>{t(TOPIC_LABELS[topic])}</h3>
            {CHOICES.filter((c) => c.topic === topic).map((choice) => (
              <fieldset key={choice.id} className="rx-question">
                <legend>
                  <span className="rx-num">{CHOICES.indexOf(choice) + 1}</span>
                  <Inline text={t(choice.prompt)} />
                  <small>
                    {fmt(choice.points)} {t("ball")}
                  </small>
                </legend>
                {choice.scene && <pre className="rx-scene">{choice.scene}</pre>}
                {choice.options.map((option, optionIndex) => (
                  <label key={option} className="rx-option">
                    <input
                      type="radio"
                      name={choice.id}
                      checked={answers[choice.id] === String(optionIndex)}
                      onChange={() => setAnswer(choice.id, String(optionIndex))}
                    />
                    <span>
                      <Inline text={t(option)} />
                    </span>
                  </label>
                ))}
              </fieldset>
            ))}
          </section>
        ))}

        <h2 className="rx-part">
          {t("B qism · Ochiq savollar ({points} ball)", {
            points: fmt(MAX_OPEN),
          })}
        </h2>
        <section className="rx-card">
          {OPENS.map((open, index) => {
            const id = `lip-in-${open.id}`;
            const terminal = open.kind === "command";
            return (
              <div key={open.id} className="rx-question lip-open">
                <label htmlFor={id} className="rx-field rx-field-wide">
                  <span>
                    <span className="rx-num">{CHOICES.length + index + 1}</span>
                    <Inline text={t(open.prompt)} />
                    <small>
                      {fmt(open.points)} {t("ball")}
                    </small>
                  </span>
                  {open.scene && <pre className="rx-scene">{open.scene}</pre>}
                  <span className={terminal ? "rx-terminal" : undefined}>
                    {terminal && <b aria-hidden="true">$</b>}
                    <input
                      id={id}
                      value={answers[open.id] ?? ""}
                      maxLength={300}
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      placeholder={t(open.placeholder)}
                      onChange={(e) => setAnswer(open.id, e.target.value)}
                    />
                  </span>
                </label>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function ResultView({
  result,
  leaves,
  onRetry,
}: {
  result: LipResult;
  leaves: number;
  onRetry: () => void;
}) {
  const t = useTranslator();
  const byId = new Map(result.items.map((item) => [item.id, item]));
  const percent = Math.round((result.total / result.max) * 100);
  const grade =
    percent >= 86
      ? t("A’lo")
      : percent >= 71
        ? t("Yaxshi")
        : percent >= 56
          ? t("Qoniqarli")
          : t("Qayta tayyorlaning");
  return (
    <div className="rx-shell">
      <section className="rx-card rx-result">
        <span className="rx-eyebrow">{t("NATIJA")}</span>
        <p className="rx-score">
          <strong>{fmt(result.total)}</strong> / {fmt(result.max)}
          <span>
            {percent}% · {grade}
          </span>
        </p>
        <div className="rx-stats">
          <div>
            <strong>
              {fmt(result.test.score)}/{fmt(result.test.max)}
            </strong>
            <span>{t("A qism · test")}</span>
          </div>
          <div>
            <strong>
              {fmt(result.open.score)}/{fmt(result.open.max)}
            </strong>
            <span>{t("B qism · ochiq savollar")}</span>
          </div>
          <div>
            <strong>{leaves}</strong>
            <span>{t("oynadan chiqishlar")}</span>
          </div>
        </div>
        <div className="rx-actions">
          <button className="button button-primary" onClick={onRetry}>
            {t("Qayta topshirish")}
          </button>
          <Link className="button button-secondary" href="/resources">
            {t("Resurslarga qaytish")}
          </Link>
        </div>
      </section>

      <h2 className="rx-part">{t("A qism · Test")}</h2>
      <section className="rx-card">
        {CHOICES.map((choice, index) => {
          const item = byId.get(choice.id);
          if (!item) return null;
          return (
            <article
              key={choice.id}
              className={`rx-review ${item.score ? "rx-ok" : "rx-bad"}`}
            >
              <h4>
                <span aria-hidden="true">{item.score ? "✓" : "✗"}</span>
                {index + 1}. <Inline text={t(choice.prompt)} />
                <small>
                  {fmt(item.score)}/{fmt(item.max)}
                </small>
              </h4>
              {!item.score && item.expected && (
                <p>
                  <b>{t("To‘g‘ri javob:")}</b> {t(item.expected)}
                </p>
              )}
              {item.explain && <p className="rx-explain">{t(item.explain)}</p>}
            </article>
          );
        })}
      </section>

      <h2 className="rx-part">{t("B qism · Ochiq savollar")}</h2>
      <section className="rx-card">
        {OPENS.map((open, index) => {
          const item = byId.get(open.id);
          if (!item) return null;
          return (
            <article
              key={open.id}
              className={`rx-review ${item.score ? "rx-ok" : "rx-bad"}`}
            >
              <h4>
                <span aria-hidden="true">{item.score ? "✓" : "✗"}</span>
                {CHOICES.length + index + 1}. <Inline text={t(open.prompt)} />
                <small>
                  {fmt(item.score)}/{fmt(item.max)}
                </small>
              </h4>
              {!item.score && item.expected && (
                <>
                  <p>
                    <b>{t("Namuna javob:")}</b>
                  </p>
                  <pre className="rx-scene">{item.expected}</pre>
                </>
              )}
              {item.explain && <p className="rx-explain">{t(item.explain)}</p>}
            </article>
          );
        })}
      </section>
    </div>
  );
}
