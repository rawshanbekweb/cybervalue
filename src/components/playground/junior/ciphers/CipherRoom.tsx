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
  Mail,
  NotebookPen,
  Star,
} from "lucide-react";
import { useHashLessonId } from "../../useHashLessonId";
import { useT } from "../../network-lab/use-t";
import { CIPHERS } from "@/lib/junior/cipher-content";
import { AgentCard } from "../AgentCard";
import { DailyPuzzle } from "../campaign";
import { Narrator } from "../Narrator";
import { useJuniorState } from "../state";
import { BENCHES } from "./visuals";
import { Homework, HomeworkSheet } from "./homework";
import "../junior.css";
import "./ciphers.css";

export function CipherRoom() {
  const { t, text } = useT();
  const [id, setId] = useHashLessonId(CIPHERS.length, 1, "cipher");
  const {
    ciphers: progress,
    setCiphers: setRaw,
    events,
    addEvent,
  } = useJuniorState();
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
    <div className="junior cipher-room container page-content">
      <Link className="jr-back" href="/playground/junior">
        <ArrowLeft size={15} aria-hidden="true" /> Cybervalue Academy Junior
      </Link>
      <header className="jr-hero jr-hero-grid">
        <div>
          <span className="eyebrow">
            <span className="status-dot" />{" "}
            {t("JUNIOR · SHIFRLAR XONASI", "JUNIOR · CIPHER ROOM")}
          </span>
          <h1>{t("Shifrlar xonasi", "The Cipher Room")}</h1>
          <p>
            {t(
              "2600 yillik sirlar tarixi: Sparta tayoqchasidan tortib brauzeringizdagi qulfgacha. Har bir shifrni o‘z qo‘lingiz bilan sinab ko‘ring, uning tarixini o‘qing va uy vazifalarini yechib, XP to‘plang.",
              "2,600 years of secrets: from a Spartan rod to the padlock in your browser. Try every cipher with your own hands, read its story, and solve homework to earn XP.",
            )}
          </p>
        </div>
        <AgentCard />
      </header>

      <div className="jr-side">
        <DailyPuzzle />
        <Link
          className="jr-promo cr-secret-promo"
          href="/playground/junior/secret"
        >
          <span className="jr-promo-icon" aria-hidden="true">
            <Mail size={22} />
          </span>
          <span>
            <strong>
              {t("Do‘stingizga maxfiy xabar", "Send a friend a secret")}
            </strong>
            {t(
              "Xabarni shifrlang va havolani yuboring. Kalitni esa unga yuzma-yuz ayting — xuddi haqiqiy josuslardek!",
              "Encrypt a message and send the link. Tell them the key face to face — just like real spies!",
            )}
          </span>
        </Link>
      </div>

      <nav
        className="cr-timeline"
        aria-label={t("Shifrlar tarixi", "Cipher timeline")}
      >
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
              aria-label={t(
                `Qiyinlik: ${cipher.level} / 3`,
                `Difficulty: ${cipher.level} of 3`,
              )}
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
              <BookOpen size={16} aria-hidden="true" />{" "}
              {t("Tarixi", "The story")}
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
                <strong>{t("Qiziq fakt: ", "Fun fact: ")}</strong>
                {text(cipher.fact)}
              </p>
            </div>
          </section>

          <section className="cr-lab" aria-labelledby="cr-lab-title">
            <h3 id="cr-lab-title">
              <FlaskConical size={16} aria-hidden="true" />{" "}
              {t("Qanday ishlaydi — sinab ko‘ring", "How it works — try it")}
            </h3>
            <p className="jr-lead">{text(cipher.how)}</p>
            <Bench />
          </section>
        </div>

        <section className="cr-tasks" aria-labelledby="cr-tasks-title">
          <h3 id="cr-tasks-title">
            <NotebookPen size={16} aria-hidden="true" />{" "}
            {t("Uy vazifasi", "Homework")}{" "}
            <span className="cr-count">
              {solved.length}/{cipher.exercises.length} · +
              {t("har biriga 15 XP", "15 XP each")}
            </span>
          </h3>
          <Homework
            cipher={cipher}
            solved={solved}
            onSolved={(index) => {
              if (solved.includes(index)) return;
              setRaw({ ...progress, [cipher.id]: [...solved, index] });
            }}
          />
        </section>

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

      <HomeworkSheet />

      <p className="jr-foot">
        {t(
          "Hammasi shu brauzerda ishlaydi: yozganlaringiz hech qayerga yuborilmaydi. Natijalar shu qurilmada saqlanadi.",
          "Everything runs in this browser: nothing you type is sent anywhere. Your results are saved on this device.",
        )}
      </p>
    </div>
  );
}
