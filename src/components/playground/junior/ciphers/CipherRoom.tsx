"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  FlaskConical,
  Lightbulb,
  NotebookPen,
  Star,
} from "lucide-react";
import { useHashLessonId } from "../../useHashLessonId";
import { useT } from "../../network-lab/use-t";
import { CIPHERS } from "@/lib/junior/cipher-content";
import { Narrator } from "../Narrator";
import { useJuniorState } from "../state";
import { BENCHES } from "./visuals";
import "../junior.css";
import "./ciphers.css";

export function CipherRoom() {
  const { t, text } = useT();
  const [id, setId] = useHashLessonId(CIPHERS.length, 1, "cipher");
  const { ciphers: progress, events, addEvent } = useJuniorState();
  const timeline = useRef<HTMLOListElement>(null);
  // Keep the chosen stop visible on narrow screens, where the timeline
  // scrolls sideways; the page itself does not move.
  useEffect(() => {
    const list = timeline.current;
    const nav = list?.parentElement;
    const stop = list?.querySelector<HTMLElement>(".cr-stop.on");
    if (nav && stop)
      nav.scrollTo({
        left: stop.offsetLeft - (nav.clientWidth - stop.offsetWidth) / 2,
      });
  }, [id]);
  const cipher = CIPHERS[id - 1];
  // Opening every cipher earns the Historian badge.
  const fresh = !events.visited?.includes(cipher.id);
  useEffect(() => {
    if (fresh) addEvent({ visited: [...(events.visited ?? []), cipher.id] });
  }, [fresh, events, cipher.id, addEvent]);
  const Bench = BENCHES[cipher.id];
  const solved = progress[cipher.id] ?? [];
  const open = (next: number) => {
    setId(next);
    document
      .getElementById("cr-cipher")
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  return (
    <div className="cipher-room">
      <header className="jr-hero jr-page-head">
        <span className="eyebrow">
          <span className="status-dot" /> {t("CIPHER ROOM · 10 CIPHERS")}
        </span>
        <h1>
          {t("2,600 years of secrets.")} <span>{t("In your own hands.")}</span>
        </h1>
        <p>
          {t(
            "From a Spartan rod to the padlock in your browser. Pick a cipher, read its story and try how it works. Exercises are in the Homework section.",
          )}
        </p>
      </header>

      <nav className="cr-timeline" aria-label={t("Cipher timeline")}>
        <ol ref={timeline}>
          {CIPHERS.map((item) => {
            const count = progress[item.id]?.length ?? 0;
            const full = count === item.exercises.length;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`cr-stop${item.number === id ? " on" : ""}${full ? " done" : ""}`}
                  aria-current={item.number === id ? "step" : undefined}
                  onClick={() => open(item.number)}
                >
                  <span className="cr-when">{text(item.when)}</span>
                  <span className="cr-dot" aria-hidden="true">
                    {full ? <Check size={12} /> : item.number}
                  </span>
                  <span className="cr-name">
                    {text(item.title).split(" — ")[0]}
                  </span>
                  <span className="cr-count">
                    {count}/{item.exercises.length}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <article
        id="cr-cipher"
        className="cr-cipher"
        aria-labelledby="cr-cipher-title"
        key={cipher.id}
      >
        <header className="cr-head">
          <span className="eyebrow">
            {text(cipher.when)} ·{" "}
            <span
              className="cr-stars"
              role="img"
              aria-label={t("Difficulty: {level} of 3", {
                level: cipher.level,
              })}
            >
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  size={12}
                  aria-hidden="true"
                  className={n <= cipher.level ? "on" : undefined}
                />
              ))}
            </span>
          </span>
          <h2 id="cr-cipher-title">{text(cipher.title)}</h2>
          <p className="jr-hook">{text(cipher.tagline)}</p>
        </header>

        <div className="cr-grid">
          <section className="cr-story" aria-labelledby="cr-story-title">
            <h3 id="cr-story-title">
              <BookOpen size={16} aria-hidden="true" /> {t("The story")}
            </h3>
            {cipher.story.map((paragraph, i) => (
              <p key={i}>{text(paragraph)}</p>
            ))}
            <Narrator
              text={[...cipher.story, cipher.fact].map(text).join(" ")}
            />
            <div className="cr-fact">
              <Lightbulb size={16} aria-hidden="true" />
              <p>
                <strong>{t("Fun fact: ")}</strong>
                {text(cipher.fact)}
              </p>
            </div>
          </section>

          <section className="cr-lab" aria-labelledby="cr-lab-title">
            <h3 id="cr-lab-title">
              <FlaskConical size={16} aria-hidden="true" />{" "}
              {t("How it works — try it")}
            </h3>
            <p className="jr-lead">{text(cipher.how)}</p>
            <Bench />
          </section>
        </div>

        <Link
          className="cr-homework-link"
          href={`/junior/homework#cipher/${cipher.number}`}
        >
          <span className="jr-ring" aria-hidden="true">
            <NotebookPen size={18} />
          </span>
          <span>
            <strong>
              {t("Homework")}: {text(cipher.title).split(" — ")[0]}
            </strong>
            <small>
              {t("{length} of {length2} exercises solved · 15 XP each", {
                length: solved.length,
                length2: cipher.exercises.length,
              })}
            </small>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>

        <div className="cr-pager">
          {id > 1 ? (
            <button
              type="button"
              className="jr-next"
              onClick={() => open(id - 1)}
            >
              <ArrowLeft size={15} aria-hidden="true" />
              {text(CIPHERS[id - 2].title).split(" — ")[0]}
            </button>
          ) : (
            <span />
          )}
          {id < CIPHERS.length && (
            <button
              type="button"
              className="jr-next"
              onClick={() => open(id + 1)}
            >
              {text(CIPHERS[id].title).split(" — ")[0]}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </article>
    </div>
  );
}
