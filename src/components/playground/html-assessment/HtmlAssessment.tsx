"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ASSESSMENT_PATH,
  MAX_CODE_LENGTH,
  type AttemptView,
  type Draft,
} from "@/lib/html-assessment/contract";
import "./assessment.css";

type Entry = { name: string; title: string; minutes: number };
class RequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
async function request(
  method = "GET",
  data?: unknown,
): Promise<{ attempt?: AttemptView | null; entry?: Entry }> {
  const response = await fetch(`${ASSESSMENT_PATH}/api`, {
    method,
    cache: "no-store",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(12000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new RequestError(
      result.error ?? "So‘rov bajarilmadi.",
      response.status,
    );
  return result;
}
const emptyDraft: Draft = {
  revision: 0,
  code: "",
  answers: {},
  explanations: ["", ""],
  signals: { hidden: 0, paste: 0, fullscreen: 0 },
};

export function HtmlAssessment() {
  const [attempt, setAttempt] = useState<AttemptView | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saqlangan");
  const [remaining, setRemaining] = useState(0);
  const [tab, setTab] = useState<"practical" | "quiz" | "reasoning">(
    "practical",
  );
  const [preview, setPreview] = useState("");
  const live = useRef<{ attempt: AttemptView | null; draft: Draft }>({
    attempt: null,
    draft: emptyDraft,
  });
  const revision = useRef(0);
  const queue = useRef(Promise.resolve());
  const clock = useRef({ deadline: 0, server: 0, local: 0 });
  const hadFullscreen = useRef(false);
  const conflicted = useRef(false);

  const apply = useCallback((value: AttemptView, restore = false) => {
    live.current.attempt = value;
    revision.current = value.draft.revision;
    clock.current = {
      deadline: Date.parse(value.deadline),
      server: Date.parse(value.serverNow),
      local: performance.now(),
    };
    setRemaining(
      Math.max(
        0,
        Math.ceil(
          (Date.parse(value.deadline) - Date.parse(value.serverNow)) / 1000,
        ),
      ),
    );
    setAttempt(value);
    if (restore || value.submittedAt) {
      live.current.draft = value.draft;
      setDraft(value.draft);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    request()
      .then((result) => {
        if (!cancelled && result.attempt) apply(result.attempt, true);
      })
      .catch((failure) => {
        if (!cancelled)
          setError(
            failure instanceof Error ? failure.message : "Ulanish xatosi.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const persist = useCallback(
    (submit = false) => {
      const run = async () => {
        const current = live.current;
        if (
          !current.attempt ||
          current.attempt.submittedAt ||
          conflicted.current
        )
          return;
        const snapshot = current.draft;
        setSaveStatus("Saqlanmoqda…");
        try {
          const result = await request("PATCH", {
            draft: { ...snapshot, revision: revision.current },
            submit,
          });
          if (result.attempt) apply(result.attempt);
          setSaveStatus(
            live.current.draft === snapshot || result.attempt?.submittedAt
              ? "Serverga saqlangan"
              : "Yangi o‘zgarishlar saqlanmoqda…",
          );
          setError("");
        } catch (failure) {
          setSaveStatus("Saqlanmadi");
          setError(
            failure instanceof RequestError
              ? failure.message
              : "Aloqa uzildi. Sahifani yopmang; saqlashni qayta sinang. Taymer davom etadi.",
          );
          if (
            failure instanceof RequestError &&
            [401, 409].includes(failure.status)
          ) {
            conflicted.current = true;
            setConflict(true);
          }
        } finally {
          if (submit) setFinishing(false);
        }
      };
      queue.current = queue.current.then(run, run);
      return queue.current;
    },
    [apply],
  );

  function edit(change: Partial<Draft>) {
    const next = { ...live.current.draft, ...change };
    live.current.draft = next;
    setDraft(next);
    setSaveStatus("Saqlanmagan o‘zgarishlar");
  }

  const active = Boolean(attempt && !attempt.submittedAt);
  useEffect(() => {
    if (!active || conflict) return;
    const timeout = setTimeout(() => void persist(), 900);
    return () => clearTimeout(timeout);
  }, [draft, active, conflict, persist]);

  useEffect(() => {
    if (!active || conflict) return;
    const timer = setInterval(() => {
      const c = clock.current;
      setRemaining(
        Math.max(
          0,
          Math.ceil(
            (c.deadline - c.server - (performance.now() - c.local)) / 1000,
          ),
        ),
      );
    }, 1000);
    const heartbeat = setInterval(() => void persist(), 10000);
    const visibility = () => {
      if (document.hidden) {
        const next = {
          ...live.current.draft,
          signals: {
            ...live.current.draft.signals,
            hidden: Math.min(10000, live.current.draft.signals.hidden + 1),
          },
        };
        live.current.draft = next;
        setDraft(next);
        void persist();
      }
    };
    const fullscreen = () => {
      if (document.fullscreenElement) {
        hadFullscreen.current = true;
        return;
      }
      if (hadFullscreen.current) {
        hadFullscreen.current = false;
        const next = {
          ...live.current.draft,
          signals: {
            ...live.current.draft.signals,
            fullscreen: Math.min(
              10000,
              live.current.draft.signals.fullscreen + 1,
            ),
          },
        };
        live.current.draft = next;
        setDraft(next);
      }
    };
    const leave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("fullscreenchange", fullscreen);
    window.addEventListener("beforeunload", leave);
    return () => {
      clearInterval(timer);
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("fullscreenchange", fullscreen);
      window.removeEventListener("beforeunload", leave);
    };
  }, [active, conflict, persist]);

  useEffect(() => {
    if (!active || remaining > 0 || conflict) return;
    void persist(true);
    const retry = setInterval(() => void persist(true), 5000);
    return () => clearInterval(retry);
  }, [active, remaining, conflict, persist]);

  async function checkCode(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await request("POST", { action: "check", code });
      if (result.entry) setEntry(result.entry);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Kod tekshirilmadi.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function start() {
    if (!agreed) return;
    setBusy(true);
    setError("");
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        hadFullscreen.current = true;
      } catch {
        /* Fullscreen support is optional; timing and one attempt are enforced by the server. */
      }
    }
    try {
      const result = await request("POST", { action: "start", code });
      if (result.attempt) {
        conflicted.current = false;
        setConflict(false);
        apply(result.attempt, true);
      }
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Sinov boshlanmadi.",
      );
    } finally {
      setBusy(false);
    }
  }

  function blockPaste(event: React.ClipboardEvent | React.DragEvent) {
    if (!active) return;
    event.preventDefault();
    edit({
      signals: {
        ...live.current.draft.signals,
        paste: Math.min(10000, live.current.draft.signals.paste + 1),
      },
    });
    setNotice(
      "Tayyor matn yoki fayl joylash o‘chirilgan. Kod va izohni o‘zingiz yozing; bu urinish qayd etildi.",
    );
  }

  function showPreview() {
    // The policy precedes all student markup. No scripts, forms, remote loads or clickable navigation.
    const policy = `default-src 'none'; img-src ${location.origin}/icon.svg; style-src 'none'; script-src 'none'; form-action 'none'; base-uri 'none'`;
    setPreview(
      `<!doctype html><meta http-equiv="Content-Security-Policy" content="${policy}">${draft.code}`,
    );
  }

  if (loading)
    return (
      <div className="exam-shell" lang="uz">
        <p role="status">Sinov holati yuklanmoqda…</p>
      </div>
    );
  if (!attempt)
    return (
      <div className="exam-shell" lang="uz">
        <Link href="/playground/html-basics">← HTML Basics darslari</Link>
        <section className="exam-intro">
          <span className="exam-eyebrow">HTML BASICS / BAHOLASH</span>
          <h1>
            Bilimingizni ishlating.
            <br />
            <span>Sahifani qayta tiklang.</span>
          </h1>
          <p>
            Oddiy teg yodlash yetmaydi. Buzilgan sahifadagi muammolarni toping,
            buyurtma talablarini bajaring va qaroringizni tushuntiring.
          </p>
          <div className="exam-stats">
            <div>
              <strong>01</strong>
              <span>shaxsiy urinish</span>
            </div>
            <div>
              <strong>100</strong>
              <span>jami ball</span>
            </div>
            <div>
              <strong>12</strong>
              <span>dars mavzusi</span>
            </div>
          </div>
        </section>
        <div className="exam-entry-grid">
          <section className="exam-card">
            <h2>Sinov qoidalari</h2>
            <ol>
              <li>
                Vaqt “Boshlash” tugmasi bosilganda boshlanadi. Sahifani yopish
                yoki yangilash vaqtni to‘xtatmaydi.
              </li>
              <li>
                Shaxsiy kod faqat bitta urinish ochadi. Shu brauzerda davom
                eting; cookie’larni o‘chirmang.
              </li>
              <li>
                6 ta vaziyatli savol — 30 ball; 12 ta amaliy talab — 60 ball;
                ikkita izoh — o‘qituvchidan 10 ball.
              </li>
              <li>
                Faqat HTML: JavaScript, CSS, tashqi resurslar va yashirin mazmun
                taqiqlangan. Ishlatilsa amaliy qism 0 ball. Faqat #ichki
                havolalar, /icon.svg va topshiriqdagi email manzili ruxsat.
              </li>
              <li>
                Tayyor yechim, AI, boshqa odam yordami va nusxa joylashdan
                foydalanmang. Paste/drop bloklanadi; tabdan va to‘liq ekrandan
                chiqishlar o‘qituvchiga ko‘rinadi.
              </li>
              <li>
                Namuna yechim va sinov davomida avtomatik tekshirish yo‘q. O‘z
                sahifangiz ko‘rinishini ko‘rishingiz mumkin.
              </li>
              <li>
                Kod avtomatik saqlanadi. Aloqa uzilsa vaqt davom etadi;
                muddatgacha server qabul qilgan oxirgi nusxa baholanadi. Kod
                chegarasi 24 000, har bir izoh 1 600 belgi.
              </li>
            </ol>
          </section>
          <section className="exam-card">
            <h2>Shaxsiy kod bilan kirish</h2>
            {!entry ? (
              <form onSubmit={checkCode} className="exam-form">
                <label>
                  O‘qituvchi bergan kod
                  <input
                    autoComplete="off"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={80}
                    required
                    placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                  />
                </label>
                <button className="button button-primary" disabled={busy}>
                  {busy ? "Tekshirilmoqda…" : "Kodni tekshirish"}
                </button>
                <p>Kodni tekshirish urinishni boshlamaydi.</p>
              </form>
            ) : (
              <div className="exam-form">
                <p>
                  <strong>{entry.name}</strong>
                  <br />
                  {entry.title}
                </p>
                <p className="exam-duration">{entry.minutes} daqiqa</p>
                <label className="exam-check">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  Ism menga tegishli. Qoidalarni o‘qidim va mustaqil ishlayman.
                </label>
                <button
                  className="button button-primary"
                  disabled={busy || !agreed}
                  onClick={() => void start()}
                >
                  {busy ? "Boshlanmoqda…" : "Sinovni boshlash"}
                </button>
                <button
                  className="button button-secondary"
                  disabled={busy}
                  onClick={() => {
                    setEntry(null);
                    setAgreed(false);
                  }}
                >
                  Boshqa kod kiritish
                </button>
              </div>
            )}
            {error && (
              <p role="alert" className="exam-error">
                {error}
              </p>
            )}
          </section>
        </div>
      </div>
    );

  if (attempt.submittedAt)
    return (
      <div className="exam-shell" lang="uz">
        <section className="exam-card exam-result">
          <span className="exam-eyebrow">URINISH YAKUNLANDI</span>
          <h1>
            {attempt.finishReason === "timeout"
              ? "Vaqt tugadi."
              : "Ish topshirildi."}
          </h1>
          <p>
            {attempt.name} · {attempt.title}
          </p>
          <div className="exam-result-score">
            {attempt.reviewScore === null
              ? attempt.autoScore
              : (attempt.autoScore ?? 0) + attempt.reviewScore}
            <small>/{attempt.reviewScore === null ? 90 : 100}</small>
          </div>
          <p>
            {attempt.reviewScore === null
              ? "Bu avtomatik qismning dastlabki bali. Izohlar uchun o‘qituvchi yana 0–10 ball qo‘yadi; yakuniy baho hali tayyor emas."
              : `Avtomatik: ${attempt.autoScore}/90. Izohlar: ${attempt.reviewScore}/10.`}
          </p>
          {attempt.reviewNote && (
            <p className="exam-answer">{attempt.reviewNote}</p>
          )}
          <p>
            Urinish qayta ochilmaydi.{" "}
            {attempt.finishReason === "timeout" &&
              "Muddatdan oldin serverga saqlangan oxirgi nusxa baholandi."}
          </p>
          <div className="exam-actions">
            <button
              className="button button-secondary"
              onClick={() => location.reload()}
            >
              Bahoni yangilash
            </button>
            <Link
              className="button button-secondary"
              href="/playground/html-basics"
            >
              Darslarga qaytish
            </Link>
            <button
              className="button button-secondary"
              onClick={() => {
                setAttempt(null);
                live.current.attempt = null;
                setEntry(null);
                setCode("");
                setAgreed(false);
                setError("");
              }}
            >
              Keyingi o‘quvchi
            </button>
          </div>
        </section>
      </div>
    );

  const locked = remaining <= 0 || finishing || conflict;
  return (
    <div
      className="exam-shell exam-working"
      lang="uz"
      onPaste={blockPaste}
      onDrop={blockPaste}
      onCopy={(event) => event.preventDefault()}
    >
      <header className="exam-toolbar">
        <div>
          <span className="exam-eyebrow">{attempt.title}</span>
          <h1>{attempt.name}</h1>
        </div>
        <div
          className={`exam-timer ${remaining <= 300 ? "exam-timer-low" : ""}`}
          role="timer"
          aria-label="Qolgan vaqt"
        >
          {String(Math.floor(remaining / 60)).padStart(2, "0")}:
          {String(remaining % 60).padStart(2, "0")}
        </div>
        <div className="exam-save">
          <span role="status">{saveStatus}</span>
          <button
            type="button"
            className="button button-secondary"
            disabled={locked}
            onClick={() => void persist()}
          >
            Hozir saqlash
          </button>
        </div>
      </header>
      {error && (
        <p role="alert" className="exam-error">
          {error}
          {conflict && (
            <button
              className="button button-secondary"
              onClick={() => location.reload()}
            >
              Serverdagi nusxani yuklash
            </button>
          )}
        </p>
      )}
      {notice && (
        <p role="status" className="exam-notice">
          {notice}
          <button
            type="button"
            aria-label="Bildirishnomani yopish"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </p>
      )}
      {remaining <= 0 && (
        <p role="status" className="exam-notice">
          Vaqt tugadi. Serverga saqlangan ish yakunlanmoqda. Aloqa uzilgan
          bo‘lsa, sahifani ochiq qoldiring.
        </p>
      )}
      <nav className="exam-tabs" aria-label="Sinov qismlari">
        <button
          type="button"
          aria-pressed={tab === "practical"}
          onClick={() => setTab("practical")}
        >
          01 · Amaliy ish <span>60 ball</span>
        </button>
        <button
          type="button"
          aria-pressed={tab === "quiz"}
          onClick={() => setTab("quiz")}
        >
          02 · Fikrlash testi{" "}
          <span>{Object.keys(draft.answers).length}/6 · 30 ball</span>
        </button>
        <button
          type="button"
          aria-pressed={tab === "reasoning"}
          onClick={() => setTab("reasoning")}
        >
          03 · Yechim izohi <span>10 ball</span>
        </button>
      </nav>
      {tab === "practical" && (
        <>
          <div className="exam-task-heading">
            <span className="exam-eyebrow">
              VARIANT {attempt.challenge.variant + 1} / BUYURTMACHI TOPSHIRIG‘I
            </span>
            <h2>{attempt.challenge.name}</h2>
            <p>
              Tadbir sahifasi shoshilib yozilgan: ayrim tugmalar ishlamaydi,
              ma’lumotlar chala va tuzilma noto‘g‘ri. Uni quyidagi buyurtma
              bo‘yicha tiklang. Har bir talab 5 ball. Ko‘rinishning bezagi emas,
              HTML tuzilishi va mazmun baholanadi.
            </p>
          </div>
          <div className="exam-work-grid">
            <aside
              className="exam-requirements"
              aria-label="Amaliy talablar"
              tabIndex={0}
            >
              <h3>Qabul qilish talablari</h3>
              <ul>
                {attempt.challenge.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </aside>
            <section className="exam-editor">
              <label htmlFor="exam-code">HTML muharriri</label>
              <textarea
                id="exam-code"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                value={draft.code}
                maxLength={MAX_CODE_LENGTH}
                disabled={locked}
                onChange={(e) => edit({ code: e.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Tab" && !event.shiftKey && !locked) {
                    event.preventDefault();
                    const input = event.currentTarget;
                    const start = input.selectionStart;
                    const next =
                      draft.code.slice(0, start) +
                      "  " +
                      draft.code.slice(input.selectionEnd);
                    if (next.length <= MAX_CODE_LENGTH) {
                      edit({ code: next });
                      requestAnimationFrame(() => {
                        input.selectionStart = input.selectionEnd = start + 2;
                      });
                    }
                  }
                }}
              />
              <div className="exam-editor-footer">
                <span>
                  {draft.code.length.toLocaleString()}/
                  {MAX_CODE_LENGTH.toLocaleString()} belgi · Shift+Tab:
                  muharrirdan chiqish
                </span>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={locked}
                  onClick={showPreview}
                >
                  Ko‘rinishni yangilash
                </button>
              </div>
              <p className="muted">
                Ko‘rinish ball bermaydi. Havola va forma bu oynada bosilmaydi;
                ularning to‘g‘riligini kodingizdan tekshiring.
              </p>
              {preview ? (
                <iframe
                  className="exam-preview"
                  sandbox=""
                  title="HTML sahifa ko‘rinishi"
                  srcDoc={preview}
                  tabIndex={-1}
                />
              ) : (
                <div className="exam-preview-empty">
                  Kodni yozing, so‘ng ko‘rinishni yangilang.
                </div>
              )}
            </section>
          </div>
        </>
      )}
      {tab === "quiz" && (
        <section className="exam-quiz">
          <h2>Vaziyatni tahlil qiling</h2>
          <p>
            Har savolda bitta to‘g‘ri javob. Javobni topshirishgacha
            o‘zgartirish mumkin; to‘g‘ri javoblar sinov davomida ko‘rsatilmaydi.
          </p>
          {attempt.challenge.questions.map((q, index) => (
            <fieldset key={q.id} className="exam-card" disabled={locked}>
              <legend>
                {index + 1}. {q.prompt}
              </legend>
              {q.options.map((option, i) => (
                <label className="exam-option" key={i}>
                  <input
                    type="radio"
                    name={q.id}
                    value={i}
                    checked={draft.answers[q.id] === i}
                    onChange={() =>
                      edit({ answers: { ...draft.answers, [q.id]: i } })
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
          ))}
        </section>
      )}
      {tab === "reasoning" && (
        <section className="exam-form exam-reasoning">
          <h2>Qaroringizni himoya qiling</h2>
          <p>
            O‘z kodingizdan misol keltiring. Ushbu qismni o‘qituvchi o‘qib
            baholaydi; faqat uzun matn yozish ballni kafolatlamaydi.
          </p>
          {attempt.challenge.reasoning.map((question, index) => (
            <label key={question}>
              {question}
              <textarea
                rows={7}
                maxLength={1600}
                disabled={locked}
                value={draft.explanations[index]}
                onChange={(e) => {
                  const explanations: [string, string] = [
                    ...draft.explanations,
                  ];
                  explanations[index] = e.target.value;
                  edit({ explanations });
                }}
              />
              <span>{draft.explanations[index].length}/1600 belgi</span>
            </label>
          ))}
        </section>
      )}
      <footer className="exam-finish">
        <p>Topshirgandan keyin o‘zgartirish yoki qayta urinish bo‘lmaydi.</p>
        <button
          type="button"
          className="button button-primary"
          disabled={locked}
          onClick={() => {
            if (
              confirm(
                `Ishni yakunlaysizmi? ${Object.keys(draft.answers).length}/6 test javobi va amaliy kod topshiriladi. Qayta urinish yo‘q.`,
              )
            ) {
              setFinishing(true);
              void persist(true);
            }
          }}
        >
          {finishing ? "Topshirilmoqda…" : "Ishni yakunlash va topshirish"}
        </button>
      </footer>
    </div>
  );
}
