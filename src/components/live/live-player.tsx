"use client";
import "./live.css";
import { useCallback, useEffect, useState } from "react";
import { useTranslator } from "@/components/locale-provider";
import type { PlayerView } from "@/lib/live/data";
import { LETTERS } from "./letters";

const STORAGE = "cybervalue:live:seat";

type Seat = { game: string; token: string };

function readSeat(): Seat | null {
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORAGE) ?? "null");
    return raw && typeof raw.game === "string" && typeof raw.token === "string"
      ? raw
      : null;
  } catch {
    return null;
  }
}

function writeSeat(seat: Seat | null) {
  try {
    if (seat) sessionStorage.setItem(STORAGE, JSON.stringify(seat));
    else sessionStorage.removeItem(STORAGE);
  } catch {}
}

const ERRORS: Record<string, string> = {
  code: "No game is open with this code. Check the screen.",
  name: "Use up to 24 letters, digits or spaces for your name.",
  taken: "Someone in this game already uses this name. Add an initial.",
  full: "This game is full.",
  busy: "Too many tries. Wait a minute and try again.",
};

async function post(path: string, body: unknown) {
  const response = await fetch(`/api/live/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(() => null);
  if (!response) return { status: 0, data: null };
  return {
    status: response.status,
    data: (await response.json().catch(() => null)) as Record<
      string,
      unknown
    > | null,
  };
}

// A student's phone: join with the code and a name, then answer each
// question as the teacher shows it. The seat lives in this tab only.
export function LivePlayer() {
  const t = useTranslator();
  const [seat, setSeat] = useState<Seat | null>(null);
  const [view, setView] = useState<PlayerView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState<{ q: number; choice: number } | null>(null);
  const [closed, setClosed] = useState(-1);

  useEffect(() => {
    // Restore after a reload, and take the code from the QR link.
    /* eslint-disable react-hooks/set-state-in-effect */
    setSeat(readSeat());
    const fromLink = new URLSearchParams(location.search).get("code");
    if (fromLink) setCode(fromLink.replace(/\D/g, "").slice(0, 6));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const poll = useCallback(async () => {
    if (!seat) return;
    const { status, data } = await post("state", seat);
    if (status === 404) {
      writeSeat(null);
      setSeat(null);
      setView(null);
      return;
    }
    if (status === 200 && data) setView(data as unknown as PlayerView);
  }, [seat]);

  useEffect(() => {
    if (!seat || view?.state === "finished") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void poll();
    const timer = setInterval(poll, view?.state === "question" ? 1500 : 2500);
    return () => clearInterval(timer);
  }, [seat, poll, view?.state]);

  async function join(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { status, data } = await post("join", { code, name });
    setBusy(false);
    if (status === 200 && data) {
      const next = { game: String(data.game), token: String(data.token) };
      writeSeat(next);
      setSeat(next);
      return;
    }
    setError(t(ERRORS[String(data?.error)] ?? "Connection lost. Try again."));
  }

  async function answer(choice: number) {
    if (!seat || !view) return;
    const question = view.current;
    setSent({ q: question, choice });
    const { status, data } = await post("answer", { ...seat, choice });
    if (status === 409 && data?.error === "closed") setClosed(question);
    else if (status !== 200 && data?.error !== "answered") setSent(null);
    void poll();
  }

  function leave() {
    writeSeat(null);
    setSeat(null);
    setView(null);
    setSent(null);
  }

  if (!seat)
    return (
      <form className="live-card live-join-form" onSubmit={join}>
        <div className="live-field">
          <label htmlFor="live-code">{t("Game code")}</label>
          <input
            id="live-code"
            inputMode="numeric"
            autoComplete="off"
            maxLength={7}
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="123 456"
          />
        </div>
        <div className="live-field">
          <label htmlFor="live-name">{t("Your name")}</label>
          <input
            id="live-name"
            autoComplete="given-name"
            maxLength={24}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        {error && (
          <p className="live-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button-primary" disabled={busy}>
          {busy ? t("Joining…") : t("Join")}
        </button>
      </form>
    );

  if (!view)
    return (
      <p className="live-card" role="status">
        {t("Connecting…")}
      </p>
    );

  const mine =
    view.answered ?? (sent && sent.q === view.current ? sent.choice : null);

  return (
    <div className="live-card live-play" aria-live="polite">
      <p className="live-me">
        <strong>{view.me.name}</strong>
        <span>
          {t("{score} points", { score: view.me.score })}
          {view.me.place > 0 &&
            ` · ${t("place {place} of {players}", {
              place: view.me.place,
              players: view.me.players,
            })}`}
        </span>
      </p>

      {view.state === "lobby" && (
        <p className="live-wait" role="status">
          {t("You are in. Watch the screen; the game starts soon.")}{" "}
          {t("{count} players joined", { count: view.me.players })}
        </p>
      )}

      {view.state === "question" && view.question && (
        <>
          <p className="live-progress">
            {t("Question {number} of {total}", {
              number: view.current + 1,
              total: view.total,
            })}{" "}
            · {Math.ceil(view.msLeft / 1000)} s
          </p>
          <h2 className="live-prompt">{view.question.prompt}</h2>
          {mine !== null ? (
            <p className="live-wait" role="status">
              {t(
                "Answer {letter} sent. Wait for the teacher to show the result.",
                {
                  letter: LETTERS[mine],
                },
              )}
            </p>
          ) : closed === view.current || view.msLeft <= 0 ? (
            <p className="live-wait" role="status">
              {t("Time is up.")}
            </p>
          ) : (
            <div className="live-choices">
              {view.question.options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  className={`live-choice live-option-${i % 4}`}
                  onClick={() => answer(i)}
                >
                  <span className="live-letter" aria-hidden="true">
                    {LETTERS[i]}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {view.state === "reveal" && view.question && view.reveal && (
        <>
          <p
            className={`live-verdict ${view.reveal.correct ? "is-right" : "is-wrong"}`}
            role="status"
          >
            {view.reveal.correct
              ? t("Correct! +{points}", { points: view.reveal.points })
              : view.answered === null
                ? t("No answer this time.")
                : t("Not this time.")}
          </p>
          <p>
            {t("Right answer: {letter}. {answer}", {
              letter: LETTERS[view.reveal.answer],
              answer: view.question.options[view.reveal.answer],
            })}
          </p>
          {view.reveal.explain && (
            <p className="live-explain">{view.reveal.explain}</p>
          )}
          <Top rows={view.top} t={t} />
        </>
      )}

      {view.state === "finished" && (
        <>
          <h2 className="live-prompt">{t("Game over")}</h2>
          <p role="status">
            {t("You placed {place} of {players} with {score} points.", {
              place: view.me.place,
              players: view.me.players,
              score: view.me.score,
            })}
          </p>
          <Top rows={view.top} t={t} />
          <button
            type="button"
            className="button button-secondary"
            onClick={leave}
          >
            {t("Join another game")}
          </button>
        </>
      )}
    </div>
  );
}

function Top({
  rows,
  t,
}: {
  rows: PlayerView["top"];
  t: ReturnType<typeof useTranslator>;
}) {
  if (!rows.length) return null;
  return (
    <ol className="live-ranking" aria-label={t("Top players")}>
      {rows.map((row) => (
        <li key={row.place}>
          <span>{row.place}</span>
          <strong>{row.name}</strong>
          <span>{row.score}</span>
        </li>
      ))}
    </ol>
  );
}
