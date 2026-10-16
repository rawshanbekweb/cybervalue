"use client";

import { useId, useState } from "react";
import { CheckCircle2, Dices, Lightbulb, Printer, XCircle } from "lucide-react";
import { useT } from "../../network-lab/use-t";
import { sameAnswer } from "@/lib/junior/ciphers";
import {
  CIPHERS,
  GENERATED,
  generateExercise,
  type Cipher,
  type CipherId,
  type Exercise,
} from "@/lib/junior/cipher-content";
import { PigpenText } from "./visuals";

function Given({ exercise }: { exercise: Exercise }) {
  if (!exercise.given) return null;
  return exercise.glyphs ? (
    <div className="jr-code cr-glyph-out">
      <PigpenText text={exercise.given} />
    </div>
  ) : (
    <code className="jr-code">{exercise.given}</code>
  );
}

export function ExerciseCard({
  exercise,
  number,
  solved,
  onSolved,
}: {
  exercise: Exercise;
  number: string;
  solved: boolean;
  onSolved?: () => void;
}) {
  const { t, text } = useT();
  const inputId = useId();
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState(false);
  const ok = sameAnswer(exercise.format, answer, exercise.answer);
  const check = () => {
    setChecked(true);
    if (ok) onSolved?.();
  };
  return (
    <li className={solved ? "cr-ex solved" : "cr-ex"}>
      <div className="cr-ex-head">
        <span className="cr-ex-num">{number}</span>
        <strong>{text(exercise.task)}</strong>
        {exercise.key && (
          <span className="cr-ex-key">
            {t("kalit", "key")}: <b>{exercise.key}</b>
          </span>
        )}
        {solved && (
          <CheckCircle2
            className="cr-ex-done"
            size={16}
            aria-label={t("Bajarilgan", "Solved")}
          />
        )}
      </div>
      <Given exercise={exercise} />
      {exercise.options ? (
        <fieldset className="cr-options">
          <legend className="visually-hidden">{text(exercise.task)}</legend>
          {exercise.options.map((option, i) => (
            <label key={i} className={answer === String(i) ? "on" : undefined}>
              <input
                type="radio"
                name={inputId}
                checked={answer === String(i)}
                onChange={() => {
                  setAnswer(String(i));
                  setChecked(false);
                }}
              />
              {text(option)}
            </label>
          ))}
        </fieldset>
      ) : (
        <>
          <label htmlFor={inputId} className="visually-hidden">
            {t("Javobingiz", "Your answer")}
          </label>
          <input
            id={inputId}
            className="jr-input"
            value={answer}
            placeholder={t("Javobingiz", "Your answer")}
            onChange={(event) => {
              setAnswer(event.target.value);
              setChecked(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") check();
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </>
      )}
      <div className="jr-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={check}
          disabled={!answer}
        >
          {t("Tekshirish", "Check")}
        </button>
        {exercise.hint && (
          <button
            type="button"
            className="jr-linkbtn"
            aria-expanded={hint}
            onClick={() => setHint(!hint)}
          >
            <Lightbulb size={14} aria-hidden="true" /> {t("Yordam", "Hint")}
          </button>
        )}
      </div>
      {hint && exercise.hint && (
        <p className="jr-note">{text(exercise.hint)}</p>
      )}
      {checked && (
        <p
          className={ok ? "jr-verdict jr-ok" : "jr-verdict jr-bad"}
          role="status"
        >
          {ok ? (
            <CheckCircle2 size={16} aria-hidden="true" />
          ) : (
            <XCircle size={16} aria-hidden="true" />
          )}
          <span>
            {ok
              ? t("To‘g‘ri! Zo‘r ish, agent.", "Correct! Nice work, agent.")
              : t(
                  "Hali emas. Yuqoridagi asbob bilan tekshirib ko‘ring.",
                  "Not yet. Check it with the tool above.",
                )}
          </span>
        </p>
      )}
    </li>
  );
}

export function Homework({
  cipher,
  solved,
  onSolved,
}: {
  cipher: Cipher;
  solved: number[];
  onSolved: (index: number) => void;
}) {
  const { t, locale } = useT();
  const [extra, setExtra] = useState<Exercise[]>([]);
  const canGenerate = GENERATED.includes(cipher.id);
  return (
    <div className="cr-homework">
      <ol className="cr-exs">
        {cipher.exercises.map((exercise, i) => (
          <ExerciseCard
            key={i}
            exercise={exercise}
            number={String(i + 1)}
            solved={solved.includes(i)}
            onSolved={() => onSolved(i)}
          />
        ))}
        {extra.map((exercise, i) => (
          <ExerciseCard
            key={`extra-${extra.length}-${i}`}
            exercise={exercise}
            number={`+${i + 1}`}
            solved={false}
          />
        ))}
      </ol>
      {canGenerate && (
        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            const next = generateExercise(cipher.id, locale, Math.random);
            if (next) setExtra([...extra, next]);
          }}
        >
          <Dices size={15} aria-hidden="true" />{" "}
          {t("Yangi misol", "New exercise")}
        </button>
      )}
    </div>
  );
}

// Printable homework sheet ----------------------------------------------------

type SheetItem = { cipher: CipherId; exercise: Exercise };

export function HomeworkSheet() {
  const { t, text, locale } = useT();
  const [chosen, setChosen] = useState<CipherId[]>([
    "atbash",
    "caesar",
    "morse",
  ]);
  const [per, setPer] = useState(3);
  const [items, setItems] = useState<SheetItem[]>([]);
  const [answers, setAnswers] = useState(false);
  const perId = useId();
  const build = () => {
    const next: SheetItem[] = [];
    for (const id of GENERATED.filter((g) => chosen.includes(g)))
      for (let i = 0; i < per; i++) {
        const exercise = generateExercise(id, locale, Math.random);
        if (exercise) next.push({ cipher: id, exercise });
      }
    setItems(next);
  };
  return (
    <section className="cr-sheet" aria-labelledby="cr-sheet-title">
      <div className="cr-sheet-controls">
        <h2 id="cr-sheet-title">
          {t("Uy vazifasi varag‘i", "Homework sheet")}
        </h2>
        <p className="jr-lead">
          {t(
            "O‘qituvchilar va ota-onalar uchun: shifrlarni tanlang, har biridan nechta misol kerakligini belgilang va har safar yangi varaq yarating. Javoblar alohida ko‘rsatiladi.",
            "For teachers and parents: pick the ciphers and how many exercises each, and make a fresh sheet every time. Answers are shown separately.",
          )}
        </p>
        <fieldset className="cr-sheet-pick">
          <legend className="jr-label">{t("Shifrlar", "Ciphers")}</legend>
          {CIPHERS.filter((c) => GENERATED.includes(c.id)).map((cipher) => (
            <label
              key={cipher.id}
              className={chosen.includes(cipher.id) ? "on" : undefined}
            >
              <input
                type="checkbox"
                checked={chosen.includes(cipher.id)}
                onChange={(event) =>
                  setChosen(
                    event.target.checked
                      ? [...chosen, cipher.id]
                      : chosen.filter((id) => id !== cipher.id),
                  )
                }
              />
              {text(cipher.title).split(" — ")[0]}
            </label>
          ))}
        </fieldset>
        <div className="jr-actions">
          <label htmlFor={perId} className="jr-label">
            {t("Har biridan:", "Each:")}
          </label>
          <select
            id={perId}
            className="jr-input cr-select"
            value={per}
            onChange={(event) => setPer(Number(event.target.value))}
          >
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button-primary"
            onClick={build}
            disabled={!chosen.length}
          >
            <Dices size={15} aria-hidden="true" />{" "}
            {t("Varaq yaratish", "Make a sheet")}
          </button>
          {items.length > 0 && (
            <>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => window.print()}
              >
                <Printer size={15} aria-hidden="true" />{" "}
                {t("Chop etish", "Print")}
              </button>
              <label className="cr-check">
                <input
                  type="checkbox"
                  checked={answers}
                  onChange={(event) => setAnswers(event.target.checked)}
                />
                {t("Javoblarni ko‘rsatish", "Show answers")}
              </label>
            </>
          )}
        </div>
      </div>
      {items.length > 0 && (
        <div className="cr-print">
          <h3>
            Cybervalue Academy Junior ·{" "}
            {t("Shifrlar — uy vazifasi", "Ciphers — homework")}
          </h3>
          <p className="cr-print-name">
            {t(
              "Ism: ____________________   Sana: ____________",
              "Name: ____________________   Date: ____________",
            )}
          </p>
          <ol>
            {items.map(({ cipher, exercise }, i) => {
              const info = CIPHERS.find((c) => c.id === cipher)!;
              return (
                <li key={i}>
                  <p>
                    <b>{text(info.title).split(" — ")[0]}.</b>{" "}
                    {text(exercise.task)}
                    {exercise.key && ` (${t("kalit", "key")}: ${exercise.key})`}
                  </p>
                  {exercise.glyphs ? (
                    <PigpenText text={exercise.given} size={28} />
                  ) : (
                    <code>{exercise.given}</code>
                  )}
                  <p className="cr-print-line">
                    {answers ? (
                      <span className="cr-print-answer">{exercise.answer}</span>
                    ) : (
                      "______________________________________"
                    )}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
