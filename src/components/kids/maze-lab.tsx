"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Check,
  Flag,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useT } from "../playground/network-lab/use-t";
import {
  GAMES,
  missionKey,
  STAGES,
  stageOf,
  stageOpen,
  type Mission,
} from "@/lib/kids/games";
import {
  CONDITIONS,
  find,
  LEVELS,
  mazeSolved,
  parseMaze,
  runMaze,
  type Frame,
  type Outcome,
} from "@/lib/kids/maze";
import { kidsLevel } from "@/lib/kids/progress";
import { saveKidsAction } from "@/app/[lang]/kids/actions";
import { CodeEditor } from "./code-editor";
import "./kids.css";

const game = GAMES.labirint;
const levelOf = (m: Mission) =>
  m.check.kind === "maze" ? LEVELS[m.check.level] : LEVELS.l1;

// The maze lab: the board, the program, and the levels as missions. A run
// is animated step by step, and a solved level is checked again on the
// server with the same program.
export function MazeLab({
  initialDone,
  initialXp,
}: {
  initialDone: string[];
  initialXp: number;
}) {
  const { t, text } = useT();
  const [done, setDone] = useState(initialDone);
  const [xp, setXp] = useState(initialXp);
  const known = useMemo(() => new Set(done), [done]);
  const missions = game.missions.map((m) => ({
    ...m,
    done: known.has(missionKey(game.id, m.id)),
    open: stageOpen(game, stageOf(m), known),
  }));
  const first = missions.find((m) => m.open && !m.done) ?? missions[0];
  const [selected, setSelected] = useState(first.id);
  const mission = missions.find((m) => m.id === selected) ?? first;
  const level = levelOf(mission);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draft = drafts[selected] ?? "";
  const problems = useMemo(() => parseMaze(draft).problems, [draft]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{
    outcome: Outcome;
    solved: boolean;
  } | null>(null);
  const [hint, setHint] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, startSaving] = useTransition();
  const lvl = kidsLevel(xp);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  function choose(id: string) {
    stop();
    setSelected(id);
    setFrames([]);
    setStep(0);
    setResult(null);
    setHint(false);
  }

  function complete() {
    const key = missionKey(game.id, mission.id);
    if (known.has(key)) return;
    setDone((list) => [...new Set([...list, key])]);
    setXp((value) => value + mission.xp);
    startSaving(async () => {
      const saved = await saveKidsAction({
        game: game.id,
        mission: mission.id,
        code: draft,
      });
      if (saved.ok && saved.done) {
        setDone(saved.done);
        if (typeof saved.xp === "number") setXp(saved.xp);
      }
    });
  }

  function run() {
    stop();
    const program = parseMaze(draft);
    if (program.problems.length) return;
    const outcome = runMaze(program.nodes, level);
    const solved =
      mission.check.kind === "maze" && mazeSolved(draft, level, mission.check);
    setFrames(outcome.frames);
    setResult(null);
    setStep(0);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    timer.current = setInterval(
      () => {
        i += 1;
        if (i >= outcome.frames.length) {
          stop();
          setResult({ outcome: outcome.outcome, solved });
          if (solved && mission.open) complete();
          return;
        }
        setStep(i);
      },
      reduce ? 40 : 260,
    );
  }

  const start = find(level, "S");
  const pos = frames[step] ?? { ...start, dir: level.dir, line: 0 };
  const taken = new Set(
    frames
      .slice(0, step + 1)
      .filter((f) => level.map[f.y][f.x] === "*")
      .map((f) => `${f.x},${f.y}`),
  );
  const trail = new Set(frames.slice(0, step + 1).map((f) => `${f.x},${f.y}`));
  const width = level.map[0].length;
  const rules = mission.check.kind === "maze" ? mission.check : null;
  const message = !result
    ? null
    : result.solved
      ? t("You did it! The robot reached the exit.")
      : result.outcome === "exit"
        ? rules?.maxLines
          ? t(
              "The exit is reached, but the code must use takrorla and fit in {lines} lines.",
              { lines: rules.maxLines },
            )
          : t(
              "The exit is reached, but this level wants toki and agar: let the robot decide by itself.",
            )
        : result.outcome === "wall"
          ? t("Bump! The robot hit a wall. Look at the highlighted line.")
          : result.outcome === "too-long"
            ? t("The program runs too long. Is the loop ever going to stop?")
            : t("The commands ran out before the exit.");

  return (
    <div className="kids container">
      <div className="kids-lab-top">
        <Link className="kids-back" href="/kids">
          <ArrowLeft size={16} aria-hidden="true" /> {t("All games")}
        </Link>
        <p className="kids-level-chip">
          <Sparkles size={16} aria-hidden="true" /> {text(lvl.level.title)} ·{" "}
          {xp} XP
        </p>
      </div>
      <header className="kids-lab-head">
        <h1>{text(game.title)}</h1>
        <p>{text(game.tagline)}</p>
      </header>

      <div className="kids-lab">
        <section className="kids-stage" aria-labelledby="maze-title">
          <div className="kids-maze-head">
            <h2 id="maze-title">{text(mission.title)}</h2>
            <p>{text(mission.task)}</p>
          </div>
          <div
            className="kids-maze"
            style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}
            role="img"
            aria-label={t(
              "Maze, {rows} rows by {columns} columns. The robot is at column {x}, row {y}.",
              {
                rows: level.map.length,
                columns: width,
                x: pos.x + 1,
                y: pos.y + 1,
              },
            )}
          >
            {level.map.flatMap((row, y) =>
              [...row].map((cell, x) => {
                const here = pos.x === x && pos.y === y;
                return (
                  <span
                    key={`${x},${y}`}
                    className={`kids-maze-cell ${cell === "#" ? "wall" : "floor"} ${
                      cell === "E" ? "exit" : ""
                    } ${trail.has(`${x},${y}`) ? "trail" : ""}`}
                  >
                    {cell === "E" && !here && <Flag size={18} />}
                    {cell === "*" && !taken.has(`${x},${y}`) && !here && (
                      <Star size={16} />
                    )}
                    {here && (
                      <span
                        className={`kids-maze-robot ${
                          result?.outcome === "wall" ? "bump" : ""
                        }`}
                        style={{ transform: `rotate(${pos.dir * 90}deg)` }}
                      >
                        <ArrowUp size={20} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                );
              }),
            )}
          </div>
          {message && (
            <p
              className={`kids-maze-result ${result?.solved ? "ok" : ""}`}
              role="status"
            >
              {message}
            </p>
          )}
        </section>

        <section className="kids-code" aria-labelledby="kids-code-title">
          <div className="kids-panel-head">
            <h2 id="kids-code-title">{t("Robot program")}</h2>
            <span>{t("Write the commands, then press Run")}</span>
          </div>
          <CodeEditor
            label={t("Robot program")}
            value={draft}
            onChange={(value) =>
              setDrafts((all) => ({ ...all, [selected]: value }))
            }
            onRun={run}
            bad={new Set(problems.map((p) => p.line))}
            active={frames[step]?.line ?? 0}
          />
          {problems.length > 0 && (
            <ul className="kids-problems" role="status">
              {problems.slice(0, 4).map((p) => (
                <li key={`${p.line}-${p.message.en}`}>
                  <strong>{t("Line {line}", { line: p.line })}</strong>{" "}
                  {text(p.message)}
                </li>
              ))}
            </ul>
          )}
          <div className="kids-code-actions">
            <button
              type="button"
              className="kids-button"
              onClick={run}
              disabled={!mission.open}
            >
              <Play size={18} aria-hidden="true" /> {t("Run")}
            </button>
            <button
              type="button"
              className="kids-button kids-button-quiet"
              onClick={() => choose(selected)}
            >
              <RotateCcw size={16} aria-hidden="true" /> {t("Back to start")}
            </button>
          </div>
          {hint ? (
            <p className="kids-hint">
              <Lightbulb size={16} aria-hidden="true" /> {text(mission.hint)}
            </p>
          ) : (
            <button
              type="button"
              className="kids-link"
              onClick={() => setHint(true)}
            >
              <Lightbulb size={16} aria-hidden="true" /> {t("Show a hint")}
            </button>
          )}
          <details className="kids-guide">
            <summary>
              <BookOpen size={16} aria-hidden="true" /> {t("Code guide")}
            </summary>
            <h3>{t("Commands")}</h3>
            <pre>{`oldinga(3)\nchapga()\nongga()`}</pre>
            <h3>{t("Loops")}</h3>
            <pre>{`takrorla 4:\n    oldinga()\n    ongga()`}</pre>
            <h3>{t("Conditions")}</h3>
            <pre>{`toki chiqishda_emas:\n    agar oldinda_devor bo'lsa:\n        ongga()\n    aks_holda:\n        oldinga()`}</pre>
            <p className="kids-muted">
              {t("Conditions: {names}", { names: CONDITIONS.join(", ") })}
            </p>
          </details>
        </section>

        <section
          className="kids-missions kids-maze-levels"
          aria-labelledby="kids-missions-title"
        >
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
                    title: text(MAZE_STAGES[stage.stage - 1]),
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
                        onClick={() => choose(m.id)}
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
                    <p>{text(MAZE_LESSONS[stage.stage - 1])}</p>
                  </details>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

const MAZE_STAGES = [
  { uz: "Ketma-ketlik", en: "Sequences" },
  { uz: "Sikllar", en: "Loops" },
  { uz: "Shartlar", en: "Conditions" },
];

const MAZE_LESSONS = [
  {
    uz: "Kompyuter buyruqlarni aynan siz yozgan tartibda bajaradi. Shuning uchun xakerlar ham, himoyachilar ham dastur qadamlarini birma-bir kuzatadi.",
    en: "A computer runs commands exactly in the order you wrote them. That is why hackers and defenders alike follow a program step by step.",
  },
  {
    uz: "Sikl bitta ishni ko‘p marta qiladi. Antivirus ham har bir faylni sikl bilan birma-bir tekshirib chiqadi.",
    en: "A loop does one job many times. An antivirus checks every file one by one with a loop too.",
  },
  {
    uz: "“Chap qo‘l qoidasi” haqiqiy algoritm. Dasturlar shunday qoidalar bilan o‘zi qaror qiladi. Robotlar ham, tarmoqdagi paketlar ham yo‘lni shu tarzda topadi.",
    en: "The “left-hand rule” is a real algorithm. Programs decide by themselves with rules like this; robots and network packets find their way the same way.",
  },
];
