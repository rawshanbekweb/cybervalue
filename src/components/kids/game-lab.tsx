"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Terminal,
  Unlock,
} from "lucide-react";
import { useT } from "../playground/network-lab/use-t";
import {
  compile,
  devMode,
  GAMES,
  missionKey,
  passwordOpens,
  STAGES,
  stageOf,
  stageOpen,
  type GameId,
} from "@/lib/kids/games";
import { fire, normalize, suggest } from "@/lib/kids/lang";
import { kidsLevel } from "@/lib/kids/progress";
import { saveKidsAction } from "@/app/[lang]/kids/actions";
import type { GameApi } from "./game-types";
import { SpaceGame } from "./space-game";
import { RobotGame } from "./robot-game";
import { SnakeGame } from "./snake-game";
import "./kids.css";

type Line = { kind: "in" | "out" | "ok" | "err"; text: string };

/** "o'qi("eslatma.txt")" → { name: "o'qi", arg: "eslatma.txt" }. */
function parseCommand(input: string) {
  const text = normalize(input.trim()).replace(/;$/, "");
  const call = /^([a-z_']+)\s*\((.*)\)$/.exec(text);
  if (!call) return { name: text, arg: "" };
  return {
    name: call[1],
    arg: call[2]
      .trim()
      .replace(/^["'](.*)["']$/, "$1")
      .trim(),
  };
}

// The game hacking lab: the game on one side, its code on the other, a secret
// terminal underneath and the missions that guide the child through it.
export function GameLab({
  gameId,
  initialCode,
  initialDone,
  initialXp,
}: {
  gameId: GameId;
  initialCode: string;
  initialDone: string[];
  initialXp: number;
}) {
  const { t, text } = useT();
  const game = GAMES[gameId];
  const api = useRef<GameApi>(null);
  const [draft, setDraft] = useState(initialCode || game.starter);
  const [code, setCode] = useState(initialCode || game.starter);
  const [editing, setEditing] = useState(false);
  const [done, setDone] = useState(initialDone);
  const [xp, setXp] = useState(initialXp);
  const [hint, setHint] = useState<string | null>(null);
  const [cheered, setCheered] = useState<string | null>(null);
  const [command, setCommand] = useState("");
  const [log, setLog] = useState<Line[]>([
    { kind: "out", text: t("Secret terminal. Type yordam() for the list.") },
  ]);
  const [, startSaving] = useTransition();
  const known = useMemo(() => new Set(done), [done]);
  const dev = devMode(game, known);
  const program = useMemo(() => compile(game, code, dev), [game, code, dev]);
  const draftProblems = useMemo(
    () => compile(game, draft, dev).problems,
    [game, draft, dev],
  );
  const fireEvent = useCallback(
    (
      event: string,
      current: Parameters<typeof fire>[3],
      live: Parameters<typeof fire>[4],
    ) => fire(program.handlers, game.schema, event, current, live),
    [program, game],
  );
  const missions = game.missions.map((m) => ({
    ...m,
    done: known.has(missionKey(gameId, m.id)),
    open: stageOpen(game, stageOf(m), known),
  }));
  const current = missions.find((m) => m.open && !m.done) ?? null;
  const stages = STAGES.map((s) => {
    const list = missions.filter((m) => stageOf(m) === s.stage);
    return {
      ...s,
      missions: list,
      open: stageOpen(game, s.stage, known),
      finished: list.every((m) => m.done),
    };
  });
  const level = kidsLevel(xp);

  // Saves to the account; a finished mission is checked again on the server.
  function save(update: {
    code?: string;
    score?: number;
    mission?: string;
    cheat?: string;
    password?: string;
  }) {
    startSaving(async () => {
      const result = await saveKidsAction({ game: gameId, ...update });
      if (result.ok && result.done) {
        setDone(result.done);
        if (typeof result.xp === "number") setXp(result.xp);
      }
    });
  }

  function complete(
    missionId: string,
    proof: Omit<Parameters<typeof save>[0], "mission">,
  ) {
    if (known.has(missionKey(gameId, missionId))) return;
    const mission = game.missions.find((m) => m.id === missionId);
    if (!mission || !stageOpen(game, stageOf(mission), known)) return;
    setDone((list) => [...new Set([...list, missionKey(gameId, missionId)])]);
    setXp((value) => value + mission.xp);
    setCheered(missionId);
    setHint(null);
    save({ ...proof, mission: missionId });
  }

  function run() {
    setCode(draft);
    setEditing(false);
    const next = compile(game, draft, dev);
    const passed = game.missions.filter(
      (m) =>
        m.check.kind === "code" &&
        !known.has(missionKey(gameId, m.id)) &&
        stageOpen(game, stageOf(m), known) &&
        m.check.test(next),
    );
    if (passed.length) passed.forEach((m) => complete(m.id, { code: draft }));
    else save({ code: draft });
  }

  function reset() {
    setDraft(game.starter);
    setCode(game.starter);
    save({ code: game.starter });
  }

  function onScore(score: number) {
    for (const m of game.missions)
      if (
        m.check.kind === "score" &&
        stageOpen(game, stageOf(m), known) &&
        score >= m.check.score &&
        !known.has(missionKey(gameId, m.id))
      )
        complete(m.id, { score });
  }

  function terminal(event: React.FormEvent) {
    event.preventDefault();
    const input = command.trim();
    if (!input) return;
    setCommand("");
    const { name, arg } = parseCommand(input);
    const lines: Line[] = [{ kind: "in", text: `> ${input}` }];
    const out = (text: string) => lines.push({ kind: "out", text });
    if (name === "yordam") {
      game.cheats.forEach((c) => out(`${c.name}() — ${text(c.effect)}`));
      out(`fayllar() — ${t("list the game's files")}`);
      out(`o'qi("…") — ${t("read a file")}`);
      out(`kirish("…") — ${t("open developer mode with a password")}`);
    } else if (name === "tozalash") {
      setLog([]);
      return;
    } else if (name === "fayllar") {
      Object.keys(game.files).forEach((file) => out(file));
    } else if (name === "o'qi") {
      const file = game.files[arg];
      if (file) text(file).split("\n").forEach(out);
      else {
        const close = suggest(arg, Object.keys(game.files));
        lines.push({
          kind: "err",
          text: close
            ? t("No such file. Did you mean {name}?", { name: close })
            : t("No such file. Type fayllar()"),
        });
      }
    } else if (name === "kirish") {
      const login = game.missions.find((m) => m.check.kind === "login");
      if (dev)
        lines.push({ kind: "ok", text: t("Developer mode is already on.") });
      else if (login && !stageOpen(game, stageOf(login), known))
        lines.push({
          kind: "err",
          text: t("Locked. Finish the rules stage first."),
        });
      else if (passwordOpens(game, arg)) {
        lines.push({
          kind: "ok",
          text: t(
            "Access granted! Developer mode is on: you can write “qachon” events.",
          ),
        });
        if (login) complete(login.id, { password: arg });
      } else
        lines.push({ kind: "err", text: t("Wrong password. Access denied.") });
    } else if (game.cheats.some((c) => c.name === name)) {
      const ok = api.current?.cheat(name) ?? false;
      lines.push(
        ok
          ? { kind: "ok", text: t("Done! Look at the game.") }
          : { kind: "err", text: t("Start the game first.") },
      );
      if (ok)
        for (const m of game.missions)
          if (m.check.kind === "cheat" && m.check.cheat === name)
            complete(m.id, { cheat: name });
    } else {
      const close = suggest(name, [
        ...game.cheats.map((c) => c.name),
        "yordam",
        "tozalash",
        "fayllar",
        "o'qi",
        "kirish",
      ]);
      lines.push({
        kind: "err",
        text: close
          ? t("Unknown command. Did you mean {name}()?", { name: close })
          : t("Unknown command. Type yordam()"),
      });
    }
    setLog((old) => [...old, ...lines].slice(-40));
  }

  const labels = {
    start: t("Tap, click or press Space to start"),
    over: t("Game over!"),
    paused: t("Paused while you edit the code"),
    controls:
      gameId === "kosmos"
        ? t("Move with ← → arrows, A and D, or drag your finger")
        : gameId === "robot"
          ? t("Jump with Space, ↑ or a tap")
          : t("Steer with the arrows, WASD or a swipe"),
  };
  const Game =
    gameId === "kosmos"
      ? SpaceGame
      : gameId === "robot"
        ? RobotGame
        : SnakeGame;
  const lineCount = draft.split("\n").length;
  const badLines = new Set(draftProblems.map((p) => p.line));

  return (
    <div className="kids container">
      <div className="kids-lab-top">
        <Link className="kids-back" href="/kids">
          <ArrowLeft size={16} aria-hidden="true" /> {t("All games")}
        </Link>
        <div className="kids-chips">
          <p className="kids-level-chip">
            <Sparkles size={16} aria-hidden="true" /> {text(level.level.title)}{" "}
            · {xp} XP
          </p>
          {dev && (
            <p className="kids-level-chip kids-dev-chip">
              <Unlock size={16} aria-hidden="true" /> {t("Developer mode")}
            </p>
          )}
        </div>
      </div>
      <header className="kids-lab-head">
        <h1>{text(game.title)}</h1>
        <p>{text(game.tagline)}</p>
      </header>

      <div className="kids-lab">
        <section className="kids-stage" aria-label={t("Game")}>
          <Game
            ref={api}
            values={program.values}
            rules={program.rules}
            fire={fireEvent}
            running={!editing}
            onScore={onScore}
            onOver={(score) => save({ score })}
            labels={labels}
          />
        </section>

        <section className="kids-code" aria-labelledby="kids-code-title">
          <div className="kids-panel-head">
            <h2 id="kids-code-title">{t("Game code")}</h2>
            <span>{t("Change a value, then press Run")}</span>
          </div>
          <div className="kids-editor">
            <ol className="kids-gutter" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <li key={i} className={badLines.has(i + 1) ? "bad" : ""}>
                  {i + 1}
                </li>
              ))}
            </ol>
            <textarea
              aria-label={t("Game code")}
              value={draft}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              rows={Math.max(lineCount, 9)}
              onChange={(e) => setDraft(e.target.value.slice(0, 4000))}
              onFocus={() => setEditing(true)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  run();
                  return;
                }
                // Enter keeps the indent, and opens one after a line ending
                // in ":", so blocks are easy to type.
                if (e.key !== "Enter" || e.shiftKey) return;
                const area = e.currentTarget;
                const at = area.selectionStart;
                const line = area.value.slice(
                  area.value.lastIndexOf("\n", at - 1) + 1,
                  at,
                );
                const indent =
                  (/^[ \t]*/.exec(line)?.[0] ?? "") +
                  (/:\s*$/.test(line) ? "    " : "");
                if (!indent) return;
                e.preventDefault();
                const value = `${area.value.slice(0, at)}\n${indent}${area.value.slice(area.selectionEnd)}`;
                setDraft(value.slice(0, 4000));
                const caret = at + 1 + indent.length;
                requestAnimationFrame(() =>
                  area.setSelectionRange(caret, caret),
                );
              }}
            />
          </div>
          {draftProblems.length > 0 && (
            <ul className="kids-problems" role="status">
              {draftProblems.slice(0, 4).map((p) => (
                <li key={`${p.line}-${p.message.en}`}>
                  <strong>{t("Line {line}", { line: p.line })}</strong>{" "}
                  {text(p.message)}
                </li>
              ))}
            </ul>
          )}
          <div className="kids-code-actions">
            <button type="button" className="kids-button" onClick={run}>
              <Play size={18} aria-hidden="true" /> {t("Run")}
            </button>
            <button
              type="button"
              className="kids-button kids-button-quiet"
              onClick={reset}
            >
              <RotateCcw size={16} aria-hidden="true" /> {t("Original code")}
            </button>
          </div>
          <details className="kids-guide">
            <summary>
              <BookOpen size={16} aria-hidden="true" /> {t("Code guide")}
            </summary>
            <h3>{t("Stage 1: settings")}</h3>
            <pre>{`tezlik = 8\nkema_rangi = "qizil"\nko'rinmas = ha`}</pre>
            {stages[1].open ? (
              <>
                <h3>{t("Stage 2: rules")}</h3>
                <p>
                  {t(
                    "“agar” checks a condition while the game runs. Indent the lines of a block with spaces. “va” joins two conditions; “aks_holda” runs when the condition is false.",
                  )}
                </p>
                <pre>{`agar ochko > 50 bo'lsa tezlik = 9\n\nagar hayotlar < 2 va vaqt > 10 bo'lsa:\n    tezlik = 12\naks_holda:\n    tezlik = 5`}</pre>
                <p className="kids-muted">
                  {t("You can watch: {names}", {
                    names: game.watch.join(", "),
                  })}
                </p>
              </>
            ) : (
              <p className="kids-muted">
                <Lock size={14} aria-hidden="true" />{" "}
                {t("Rules open after the settings stage.")}
              </p>
            )}
            {dev ? (
              <>
                <h3>{t("Stage 3: events")}</h3>
                <p>
                  {t(
                    '“qachon” runs its lines every time something happens in the game. Inside: ochko += 5, hayotlar += 1, a setting, or xabar("…").',
                  )}
                </p>
                <pre>{`qachon ${Object.keys(game.events)[1]}:\n    ochko += 5\n    xabar("Zo'r!")`}</pre>
                <ul className="kids-events">
                  {Object.entries(game.events).map(([name, about]) => (
                    <li key={name}>
                      <code>{name}</code> — {text(about)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="kids-muted">
                <Lock size={14} aria-hidden="true" />{" "}
                {t("Events open in developer mode. Find the password!")}
              </p>
            )}
          </details>
        </section>

        <section
          className="kids-missions"
          aria-labelledby="kids-missions-title"
        >
          <div className="kids-panel-head">
            <h2 id="kids-missions-title">{t("Missions")}</h2>
            <span>
              {t("{done} of {total}", {
                done: missions.filter((m) => m.done).length,
                total: missions.length,
              })}
            </span>
          </div>
          {cheered && (
            <p className="kids-cheer" role="status">
              <Sparkles size={18} aria-hidden="true" />{" "}
              {t("Hacked! “{title}” is done.", {
                title: text(
                  game.missions.find((m) => m.id === cheered)?.title ?? {
                    uz: "",
                    en: "",
                  },
                ),
              })}
            </p>
          )}
          {current ? (
            <div className="kids-mission-now">
              <p className="kids-eyebrow">{t("Now")}</p>
              <h3>{text(current.title)}</h3>
              <p>{text(current.task)}</p>
              {hint === current.id ? (
                <p className="kids-hint">
                  <Lightbulb size={16} aria-hidden="true" />{" "}
                  {text(current.hint)}
                </p>
              ) : (
                <button
                  type="button"
                  className="kids-link"
                  onClick={() => setHint(current.id)}
                >
                  <Lightbulb size={16} aria-hidden="true" /> {t("Show a hint")}
                </button>
              )}
            </div>
          ) : (
            <p className="kids-mission-now kids-all-done">
              {t(
                "Every mission in this game is done. You are a real game hacker!",
              )}
            </p>
          )}
          {stages.map((stage) => (
            <div
              key={stage.stage}
              className={`kids-stage-group ${stage.open ? "" : "locked"}`}
            >
              <h3 className="kids-stage-title">
                {stage.open ? (
                  stage.finished ? (
                    <ShieldCheck size={16} aria-hidden="true" />
                  ) : null
                ) : (
                  <Lock size={16} aria-hidden="true" />
                )}
                {t("Stage {n}: {title}", {
                  n: stage.stage,
                  title: text(stage.title),
                })}
              </h3>
              {!stage.open && (
                <p className="kids-muted">
                  {t("Finish stage {n} to open it.", { n: stage.stage - 1 })}
                </p>
              )}
              <ol className="kids-mission-list">
                {stage.missions.map((m) => (
                  <li key={m.id} className={m.done ? "done" : ""}>
                    <span className="kids-mission-mark" aria-hidden="true">
                      {m.done ? <Check size={14} /> : null}
                    </span>
                    <span>{text(m.title)}</span>
                    <span className="kids-mission-xp">+{m.xp} XP</span>
                    {m.done && (
                      <span className="visually-hidden">{t("Done")}</span>
                    )}
                  </li>
                ))}
              </ol>
              {stage.finished && (
                <details className="kids-lesson">
                  <summary>
                    <ShieldCheck size={16} aria-hidden="true" />{" "}
                    {t("Cyber lesson")}
                  </summary>
                  <p>{text(stage.lesson)}</p>
                </details>
              )}
            </div>
          ))}
        </section>

        <section
          className="kids-terminal"
          aria-labelledby="kids-terminal-title"
        >
          <div className="kids-panel-head">
            <h2 id="kids-terminal-title">
              <Terminal size={16} aria-hidden="true" /> {t("Secret terminal")}
            </h2>
          </div>
          <div
            className="kids-terminal-log"
            role="log"
            aria-live="polite"
            aria-label={t("Secret terminal")}
            tabIndex={0}
          >
            {log.map((line, i) => (
              <p key={i} className={`kids-term-${line.kind}`}>
                {line.text}
              </p>
            ))}
          </div>
          <form onSubmit={terminal} className="kids-terminal-form">
            <span aria-hidden="true">&gt;</span>
            <input
              aria-label={t("Terminal command")}
              value={command}
              onChange={(e) => setCommand(e.target.value.slice(0, 80))}
              placeholder="yordam()"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button type="submit" className="kids-button kids-button-small">
              {t("Enter")}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
