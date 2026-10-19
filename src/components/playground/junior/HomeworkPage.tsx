"use client";

import Link from "next/link";
import { Check, FlaskConical, Lock } from "lucide-react";
import { useT } from "../network-lab/use-t";
import { useHashLessonId } from "../useHashLessonId";
import { CIPHERS } from "@/lib/junior/cipher-content";
import { cipherLevelOpen, exercisesToOpen } from "@/lib/junior/verify";
import { DailyPuzzle } from "./campaign";
import { Homework, HomeworkSheet } from "./ciphers/homework";
import { useJuniorState } from "./state";
import "./ciphers/ciphers.css";

// Homework on its own page: today's puzzle, then the exercises of one cipher
// at a time, and the printable sheet for teachers.
export function HomeworkPage() {
  const { t, text } = useT();
  const [id, setId] = useHashLessonId(CIPHERS.length, 1, "cipher");
  const { ciphers, solveExercise } = useJuniorState();
  const cipher = CIPHERS[id - 1];
  const solved = ciphers[cipher.id] ?? [];
  const open = cipherLevelOpen(cipher.level, ciphers);
  return (
    <div className="jr-homework-page">
      <header className="jr-hero jr-page-head">
        <span className="eyebrow">
          <span className="status-dot" /> {t("HOMEWORK")}
        </span>
        <h1>
          {t("A little every day.")} <span>{t("Stronger every week.")}</span>
        </h1>
        <p>
          {t(
            "Solve the daily puzzle, then work through the cipher exercises. Every right answer earns XP and is saved to your account.",
          )}
        </p>
      </header>

      <DailyPuzzle />

      <section className="jr-hw" aria-labelledby="jr-hw-title">
        <h2 id="jr-hw-title">{t("Cipher exercises")}</h2>
        <nav className="jr-hw-pick" aria-label={t("Pick a cipher")}>
          {CIPHERS.map((item) => {
            const count = ciphers[item.id]?.length ?? 0;
            const full = count === item.exercises.length;
            const closed = !cipherLevelOpen(item.level, ciphers);
            return (
              <button
                key={item.id}
                type="button"
                aria-current={item.number === id ? "true" : undefined}
                className={full ? "done" : closed ? "locked" : undefined}
                onClick={() => setId(item.number)}
              >
                {full && <Check size={13} aria-hidden="true" />}
                {closed && <Lock size={13} aria-label={t("Locked")} />}
                {text(item.title).split(" — ")[0]}
                <small>
                  {count}/{item.exercises.length}
                </small>
              </button>
            );
          })}
        </nav>
        <div className="jr-hw-head">
          <h3>{text(cipher.title)}</h3>
          <Link
            href={`/junior/ciphers#cipher/${cipher.number}`}
            className="jr-linkbtn"
          >
            <FlaskConical size={14} aria-hidden="true" />{" "}
            {t("Open the tool and the story")}
          </Link>
        </div>
        {open ? (
          <Homework
            key={cipher.id}
            cipher={cipher}
            solved={solved}
            onSolved={(index, answer) =>
              solveExercise(cipher.id, index, answer)
            }
          />
        ) : (
          <p className="jr-locked" role="status">
            <Lock size={16} aria-hidden="true" />{" "}
            {t(
              "Level {level} homework opens after {count} more exercises of level {previous}. You can already read this cipher’s story and try its tool.",
              {
                level: cipher.level,
                previous: cipher.level - 1,
                count: exercisesToOpen(cipher.level, ciphers),
              },
            )}
          </p>
        )}
      </section>

      <HomeworkSheet />
    </div>
  );
}
