"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Check,
  Globe,
  Laptop,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Server,
  Shield,
  SkipForward,
  Terminal,
  User,
  X,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  actorX,
  anatomyIds,
  type Actor,
  type Bucket,
  type Explain,
  type Part,
  type Question,
  type SortItem,
  type Step,
} from "@/lib/anim-lab/types";

type Solved = (solved: boolean) => void;

const ICONS = {
  laptop: Laptop,
  server: Server,
  lock: Lock,
  user: User,
  globe: Globe,
  shield: Shield,
  terminal: Terminal,
};

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True when the reader asked the system for less motion. */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * A message sequence: actors stand in columns and each step flies an
 * envelope from one to another. Play runs the whole exchange; Next step
 * moves one message at a time. Seeing every message solves the widget.
 */
export function SequenceWidget({
  actors,
  steps,
  onSolved,
}: {
  actors: Actor[];
  steps: Step[];
  onSolved: Solved;
}) {
  const { t, text } = useT();
  const reduce = useReducedMotion();
  const fly = reduce ? 0 : 1100;
  const [shown, setShown] = useState(0);
  const [flying, setFlying] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const advance = (from: number, auto: boolean) => {
    if (from >= steps.length) return;
    setFlying(from);
    timer.current = setTimeout(() => {
      setFlying(null);
      setShown(from + 1);
      if (from + 1 === steps.length) {
        setPlaying(false);
        onSolved(true);
      } else if (auto) {
        timer.current = setTimeout(() => advance(from + 1, true), 450);
      }
    }, fly);
  };
  const play = () => {
    if (playing) {
      if (timer.current) clearTimeout(timer.current);
      setPlaying(false);
      setFlying(null);
      return;
    }
    const start = shown >= steps.length ? 0 : shown;
    if (start === 0) setShown(0);
    setPlaying(true);
    advance(start, true);
  };
  const next = () => {
    if (playing || flying !== null) return;
    advance(shown >= steps.length ? 0 : shown, false);
    if (shown >= steps.length) setShown(0);
  };
  const restart = () => {
    if (timer.current) clearTimeout(timer.current);
    setPlaying(false);
    setFlying(null);
    setShown(0);
  };

  const current = flying !== null ? steps[flying] : null;
  const last = flying === null && shown > 0 ? steps[shown - 1] : null;
  return (
    <div className="nl-card al-sequence">
      <div
        className="al-stage"
        style={{ "--cols": actors.length } as React.CSSProperties}
      >
        <div className="al-actors">
          {actors.map((actor) => {
            const Icon = ICONS[actor.icon];
            const busy =
              current?.to === actor.id || (last && last.to === actor.id);
            return (
              <div key={actor.id} className={`al-actor${busy ? " on" : ""}`}>
                <span className="al-actor-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span>{text(actor.label)}</span>
              </div>
            );
          })}
        </div>
        <div className="al-lane" aria-hidden="true">
          {actors.map((actor) => (
            <span
              key={actor.id}
              className="al-lifeline"
              style={{ left: `${actorX(actors, actor.id)}%` }}
            />
          ))}
          {current && (
            <span
              key={`fly-${flying}-${shown}`}
              className={`al-packet al-${current.tone ?? "plain"} al-flying`}
              style={
                {
                  "--from": `${actorX(actors, current.from)}%`,
                  "--to": `${actorX(actors, current.to)}%`,
                  "--dur": `${fly}ms`,
                } as React.CSSProperties
              }
            >
              {current.tone === "locked" && <Lock size={12} />}
              {current.label}
            </span>
          )}
          {last && (
            <span
              className={`al-packet al-${last.tone ?? "plain"} al-rest`}
              style={{ left: `${actorX(actors, last.to)}%` }}
            >
              {last.tone === "locked" && <Lock size={12} />}
              {last.label}
            </span>
          )}
        </div>
      </div>
      <div className="nl-task-actions">
        <button type="button" className="nl-primary" onClick={play}>
          {playing ? (
            <Pause size={16} aria-hidden="true" />
          ) : (
            <Play size={16} aria-hidden="true" />
          )}
          {playing ? t("Pause") : t("Play")}
        </button>
        <button
          type="button"
          className="nl-ghost"
          onClick={next}
          disabled={playing || flying !== null}
        >
          <SkipForward size={15} aria-hidden="true" />
          {t("Next step")}
        </button>
        <button type="button" className="nl-ghost" onClick={restart}>
          <RotateCcw size={15} aria-hidden="true" />
          {t("Restart")}
        </button>
        <span className="al-counter">
          {t("Messages: {n}/{total}", { n: shown, total: steps.length })}
        </span>
      </div>
      <ol className="al-log" aria-live="polite">
        {steps.slice(0, shown).map((step, i) => (
          <li key={i} className={`al-appear al-log-${step.tone ?? "plain"}`}>
            <code>
              {text(actors.find((a) => a.id === step.from)!.label)} →{" "}
              {text(actors.find((a) => a.id === step.to)!.label)}: {step.label}
            </code>
            <span>{text(step.detail)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * A code block whose highlighted parts explain themselves when chosen.
 * Exploring every part solves the widget.
 */
export function AnatomyWidget({
  lines,
  parts,
  onSolved,
}: {
  lines: Part[][];
  parts: Explain[];
  onSolved: Solved;
}) {
  const { t, text } = useT();
  const ids = anatomyIds(lines);
  const [seen, setSeen] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const choose = (id: string) => {
    setActive(id);
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    if (ids.every((x) => next.includes(x))) onSolved(true);
  };
  const explain = parts.find((p) => p.id === active);
  return (
    <div className="nl-card al-anatomy">
      <pre className="al-code" tabIndex={0}>
        {lines.map((line, i) => (
          <span key={i} className="al-line">
            {line.map((part, j) =>
              part.id ? (
                <button
                  key={j}
                  type="button"
                  className={`al-part${seen.includes(part.id) ? " seen" : ""}${
                    active === part.id ? " on" : ""
                  }`}
                  aria-pressed={active === part.id}
                  onClick={() => choose(part.id!)}
                >
                  {part.text}
                </button>
              ) : (
                <span key={j}>{part.text}</span>
              ),
            )}
            {"\n"}
          </span>
        ))}
      </pre>
      <div className="al-explain" aria-live="polite">
        {explain ? (
          <div key={explain.id} className="al-appear">
            <strong>{text(explain.title)}</strong>
            <p>{text(explain.body)}</p>
          </div>
        ) : (
          <p className="al-muted">
            {t("Click a highlighted part of the message.")}
          </p>
        )}
      </div>
      <p className="al-counter">
        {t("{seen} of {total} parts explored", {
          seen: seen.length,
          total: ids.length,
        })}
      </p>
    </div>
  );
}

/**
 * Cards come one at a time; the student drops each into a bucket. A wrong
 * bucket shakes the card; sorting every card solves the widget.
 */
export function SortWidget({
  buckets,
  items,
  onSolved,
}: {
  buckets: Bucket[];
  items: SortItem[];
  onSolved: Solved;
}) {
  const { t, text } = useT();
  const [index, setIndex] = useState(0);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const card = items[index];
  const choose = (bucket: string) => {
    if (!card) return;
    if (bucket !== card.bucket) {
      setWrong(bucket);
      setMisses(misses + 1);
      return;
    }
    setWrong(null);
    setIndex(index + 1);
    if (index + 1 === items.length) onSolved(true);
  };
  return (
    <div className="nl-card al-sort">
      <div className="al-deck" aria-live="polite">
        {card ? (
          <div
            key={`${index}-${misses}`}
            className={`al-card${wrong ? " al-shake" : " al-drop"}`}
          >
            <span className="al-card-count">
              {index + 1}/{items.length}
            </span>
            {card.code ? (
              <code>{text(card.label)}</code>
            ) : (
              <span>{text(card.label)}</span>
            )}
          </div>
        ) : (
          <p className="nl-pass al-appear">
            <Check size={16} aria-hidden="true" /> {t("All sorted!")}
          </p>
        )}
        {wrong && card && (
          <p className="nl-fail">
            <X size={14} aria-hidden="true" />{" "}
            {t("Not “{bucket}”. Think again.", {
              bucket: text(buckets.find((b) => b.id === wrong)!.label),
            })}
          </p>
        )}
      </div>
      <div className="al-buckets">
        {buckets.map((bucket) => {
          const inside = items
            .slice(0, index)
            .filter((item) => item.bucket === bucket.id);
          return (
            <div key={bucket.id} className="al-bucket">
              <button
                type="button"
                className="nl-ghost"
                onClick={() => choose(bucket.id)}
                disabled={!card}
              >
                {text(bucket.label)}
              </button>
              <ul>
                {inside.map((item, i) => (
                  <li key={i} className="al-appear">
                    {item.code ? (
                      <code>{text(item.label)}</code>
                    ) : (
                      text(item.label)
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Multiple choice with the reason shown after each answer. */
export function QuizWidget({
  questions,
  onSolved,
}: {
  questions: Question[];
  onSolved: Solved;
}) {
  const { t, text } = useT();
  const [answers, setAnswers] = useState<(number | null)[]>(
    questions.map(() => null),
  );
  const choose = (q: number, option: number) => {
    const next = answers.map((a, i) => (i === q ? option : a));
    setAnswers(next);
    onSolved(next.every((a, i) => a === questions[i].answer));
  };
  return (
    <div className="nl-card al-quiz">
      {questions.map((q, i) => {
        const answer = answers[i];
        return (
          <fieldset key={i}>
            <legend>
              {i + 1}. {text(q.ask)}
            </legend>
            {q.options.map((option, j) => (
              <label key={j} className="al-option">
                <input
                  type="radio"
                  name={`al-q${i}`}
                  checked={answer === j}
                  onChange={() => choose(i, j)}
                />
                {text(option)}
              </label>
            ))}
            {answer !== null && (
              <p
                className={`al-appear ${answer === q.answer ? "nl-pass" : "nl-fail"}`}
              >
                {answer === q.answer ? t("Right.") : t("Not quite.")}{" "}
                {answer === q.answer && text(q.explain)}
              </p>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
