"use client";
import "./live.css";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Maximize, Users } from "lucide-react";
import { useTranslator } from "@/components/locale-provider";
import { liveCommandAction } from "@/app/admin/(cms)/live/actions";
import type { HostView } from "@/lib/live/data";
import { LETTERS } from "./letters";

// The classroom screen. It polls the game, counts down each question and
// reveals it by itself when time is up or everyone has answered.
export function LiveHost({
  initial,
  joinUrl,
  qr,
}: {
  initial: HostView;
  joinUrl: string;
  qr: string;
}) {
  const t = useTranslator();
  const [view, setView] = useState(initial);
  const [left, setLeft] = useState(initial.msLeft);
  const [pending, start] = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const revealing = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch(`/admin/live/${initial.id}/state`, {
      cache: "no-store",
    }).catch(() => null);
    if (!response?.ok) return;
    const next = (await response.json()) as HostView;
    setView(next);
    setLeft(next.msLeft);
  }, [initial.id]);

  const command = useCallback(
    (name: "start" | "reveal" | "next" | "end") =>
      start(async () => {
        await liveCommandAction(initial.id, name);
        await refresh();
      }),
    [initial.id, refresh],
  );

  useEffect(() => {
    if (view.state === "finished") return;
    const timer = setInterval(refresh, view.state === "question" ? 1000 : 2000);
    return () => clearInterval(timer);
  }, [refresh, view.state]);

  const questionIndex = view.current;
  // A smooth local countdown between polls.
  useEffect(() => {
    if (view.state !== "question") return;
    const until = Date.now() + view.msLeft;
    const tick = setInterval(
      () => setLeft(Math.max(0, until - Date.now())),
      200,
    );
    return () => clearInterval(tick);
  }, [view.state, view.msLeft, questionIndex]);

  // Reveal once per question: at zero, or when every player has answered.
  useEffect(() => {
    if (view.state !== "question" || revealing.current === view.current) return;
    const everyone =
      view.players.length > 0 && view.answeredCount >= view.players.length;
    if (left <= 0 || everyone) {
      revealing.current = view.current;
      command("reveal");
    }
  }, [left, view, command]);

  const seconds = Math.ceil(left / 1000);
  const q = view.question;
  const max = q?.counts ? Math.max(1, ...q.counts) : 1;

  return (
    <div className="live-host" ref={root}>
      <div className="live-host-bar">
        <span className="eyebrow">{view.title}</span>
        <span className="live-host-meta">
          {view.state !== "lobby" && view.state !== "finished" && (
            <span>
              {t("Question {number} of {total}", {
                number: view.current + 1,
                total: view.total,
              })}
            </span>
          )}
          <span>
            <Users size={15} aria-hidden="true" /> {view.players.length}
          </span>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => root.current?.requestFullscreen?.()}
          >
            <Maximize size={15} aria-hidden="true" /> {t("Full screen")}
          </button>
        </span>
      </div>

      {view.state === "lobby" && (
        <section className="live-lobby" aria-label={t("Join the game")}>
          <div className="live-join">
            <p>{t("Open {url} and enter the code", { url: joinUrl })}</p>
            <p className="live-code">
              <span className="visually-hidden">{t("Game code")}: </span>
              {view.code.slice(0, 3)} {view.code.slice(3)}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={t("QR code to join")} width={180} height={180} />
          </div>
          <div className="live-players" aria-live="polite">
            <h2>
              {t("{count} players joined", { count: view.players.length })}
            </h2>
            <ul>
              {view.players.map((p) => (
                <li key={p.name}>{p.name}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="button button-primary live-go"
            disabled={pending || view.total === 0}
            onClick={() => command("start")}
          >
            {t("Start the game")}
          </button>
        </section>
      )}

      {q && (view.state === "question" || view.state === "reveal") && (
        <section className="live-question" aria-live="polite">
          <div className="live-question-head">
            <h2>{q.prompt}</h2>
            {view.state === "question" ? (
              <span
                className="live-timer"
                role="timer"
                aria-label={t("Seconds left")}
              >
                {seconds}
              </span>
            ) : null}
          </div>
          <ol className="live-options">
            {q.options.map((option, i) => (
              <li
                key={i}
                className={`live-option live-option-${i % 4} ${
                  q.answer === null
                    ? ""
                    : q.answer === i
                      ? "is-right"
                      : "is-dim"
                }`}
              >
                <span className="live-letter" aria-hidden="true">
                  {LETTERS[i]}
                </span>
                <span className="live-option-text">{option}</span>
                {q.counts && (
                  <span className="live-count">
                    <span
                      className="live-count-bar"
                      style={{ width: `${(q.counts[i] / max) * 100}%` }}
                    />
                    <span>{q.counts[i]}</span>
                  </span>
                )}
              </li>
            ))}
          </ol>
          {view.state === "question" ? (
            <div className="live-actions">
              <span className="muted">
                {t("{answered} of {players} answered", {
                  answered: view.answeredCount,
                  players: view.players.length,
                })}
              </span>
              <button
                type="button"
                className="button button-secondary"
                disabled={pending}
                onClick={() => command("reveal")}
              >
                {t("Show the answer")}
              </button>
            </div>
          ) : (
            <>
              {q.explain && <p className="live-explain">{q.explain}</p>}
              <Ranking players={view.players.slice(0, 5)} t={t} />
              <div className="live-actions">
                <button
                  type="button"
                  className="button button-primary"
                  disabled={pending}
                  onClick={() => command("next")}
                >
                  {view.current + 1 < view.total
                    ? t("Next question")
                    : t("Show the results")}
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {view.state === "finished" && (
        <section className="live-final" aria-labelledby="live-final-title">
          <h2 id="live-final-title">{t("Final results")}</h2>
          <ol className="live-podium">
            {view.players.slice(0, 3).map((p) => (
              <li key={p.name} className={`live-podium-${p.place}`}>
                <span className="live-podium-place">{p.place}</span>
                <strong>{p.name}</strong>
                <span>{p.score}</span>
              </li>
            ))}
          </ol>
          <Ranking players={view.players} t={t} />
          <Link href="/admin/live" className="button button-secondary">
            {t("Back to live quizzes")}
          </Link>
        </section>
      )}

      {view.state !== "finished" && (
        <div className="live-end">
          <button
            type="button"
            className="button button-secondary"
            disabled={pending}
            onClick={() => {
              if (confirm(t("End the game now?"))) command("end");
            }}
          >
            {t("End the game")}
          </button>
        </div>
      )}
    </div>
  );
}

function Ranking({
  players,
  t,
}: {
  players: HostView["players"];
  t: ReturnType<typeof useTranslator>;
}) {
  if (!players.length) return null;
  return (
    <ol className="live-ranking" aria-label={t("Ranking")}>
      {players.map((p) => (
        <li key={p.name}>
          <span>{p.place}</span>
          <strong>{p.name}</strong>
          <span>{p.score}</span>
        </li>
      ))}
    </ol>
  );
}
