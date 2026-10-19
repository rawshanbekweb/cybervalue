"use client";

import { Check, Lock, ShieldCheck } from "lucide-react";
import { useT } from "../playground/network-lab/use-t";
import {
  STAGES,
  stageOf,
  stageOpen,
  type Game,
  type Mission,
} from "@/lib/kids/games";
import type { Text } from "@/lib/kids/lang";

// The levels of a puzzle game (maze, cipher), grouped by stage: a level can
// be picked once its stage is open, and a finished stage shows its lesson.
export function PuzzleLevels({
  game,
  missions,
  known,
  selected,
  onChoose,
  stages,
  lessons,
}: {
  game: Game;
  missions: (Mission & { done: boolean })[];
  known: Set<string>;
  selected: string;
  onChoose: (id: string) => void;
  /** One title and one lesson per stage. */
  stages: Text[];
  lessons: Text[];
}) {
  const { t, text } = useT();
  return (
    <section className="kids-missions" aria-labelledby="kids-missions-title">
      <div className="kids-panel-head">
        <h2 id="kids-missions-title">{t("Levels")}</h2>
        <span>
          {t("{done} of {total}", {
            done: missions.filter((m) => m.done).length,
            total: missions.length,
          })}
        </span>
      </div>
      {STAGES.map((stage) => {
        const list = missions.filter((m) => stageOf(m) === stage.stage);
        const open = stageOpen(game, stage.stage, known);
        return (
          <div
            key={stage.stage}
            className={`kids-stage-group ${open ? "" : "locked"}`}
          >
            <h3 className="kids-stage-title">
              {!open && <Lock size={16} aria-hidden="true" />}
              {t("Stage {n}: {title}", {
                n: stage.stage,
                title: text(stages[stage.stage - 1]),
              })}
            </h3>
            <ol className="kids-mission-list">
              {list.map((m) => (
                <li key={m.id} className={m.done ? "done" : ""}>
                  <span className="kids-mission-mark" aria-hidden="true">
                    {m.done ? <Check size={14} /> : null}
                  </span>
                  <button
                    type="button"
                    className="kids-level-button"
                    aria-pressed={m.id === selected}
                    disabled={!open}
                    onClick={() => onChoose(m.id)}
                  >
                    {text(m.title)}
                  </button>
                  <span className="kids-mission-xp">+{m.xp} XP</span>
                  {m.done && (
                    <span className="visually-hidden">{t("Done")}</span>
                  )}
                </li>
              ))}
            </ol>
            {list.every((m) => m.done) && (
              <details className="kids-lesson">
                <summary>
                  <ShieldCheck size={16} aria-hidden="true" />{" "}
                  {t("Cyber lesson")}
                </summary>
                <p>{text(lessons[stage.stage - 1])}</p>
              </details>
            )}
          </div>
        );
      })}
    </section>
  );
}
