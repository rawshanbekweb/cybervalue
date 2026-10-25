"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  SquareTerminal,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { useReducedMotion } from "../anim-lab/widgets";
import {
  LESSONS,
  PROGRESS_KEY,
  type Entry,
  type Goal,
  type Log,
  type Widget,
} from "@/lib/bash-basics/curriculum";
import {
  emptyState,
  run,
  type Files,
  type State,
} from "@/lib/bash-basics/interp";
import "./bash-basics.css";

// Academy · Bash basics: variables, loops and scripts, typed into a safe
// pretend terminal that runs in the browser.
export function BashBasics() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      checkpoints={["bash-1"]}
      eyebrow={t("TERMINAL FOUNDATIONS · ANIMATED")}
      title={t("Bash basics.")}
      subtitle={t("Variables, loops and your first scripts.")}
      description={t(
        "Store values in variables, watch a loop go round one turn at a time, fix an endless loop and write a script that scans a login log.",
      )}
      badge={t("BASH / SCRIPTS")}
      icon={<SquareTerminal size={22} />}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "shell":
            return (
              <ShellWidget
                files={widget.files}
                goals={widget.goals}
                {...props}
              />
            );
          case "script":
            return <ScriptWidget widget={widget} {...props} />;
          case "loop":
            return <LoopWidget {...widget} {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

function Goals({ goals, log }: { goals: Goal[]; log: Log }) {
  const { t, text } = useT();
  return (
    <ul className="bb-goals" aria-label={t("Goals")}>
      {goals.map((goal, i) => {
        const met = goal.check(log);
        return (
          <li key={i} className={met ? "met" : ""}>
            <span className="bb-goal-mark" aria-hidden="true">
              {met ? <Check size={13} /> : i + 1}
            </span>
            {text(goal.label)}
            <span className="visually-hidden">
              {met ? t("done") : t("not yet")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Variables as labelled boxes; a changed box flashes. */
function Shelf({ state, changed }: { state: State; changed: string[] }) {
  const { t } = useT();
  const names = Object.keys(state.vars);
  return (
    <div className="bb-shelf" aria-label={t("Variables")}>
      <span className="bb-shelf-title">{t("Variables")}</span>
      {names.length === 0 ? (
        <span className="al-muted">{t("No variables yet.")}</span>
      ) : (
        names.map((name) => (
          <span
            key={`${name}=${state.vars[name]}`}
            className={`bb-box${changed.includes(name) ? " bb-flash" : ""}`}
          >
            <span className="bb-box-name">{name}</span>
            <code>{state.vars[name] === "" ? "''" : state.vars[name]}</code>
          </span>
        ))
      )}
    </div>
  );
}

const PROMPT = "student@bash-lab:~$";

/** A pretend terminal keeping its variables between commands. */
function ShellWidget({
  files,
  goals,
  onSolved,
}: { files: Files; goals: Goal[] } & WidgetProps) {
  const { t } = useT();
  const [log, setLog] = useState<Log>({
    state: emptyState(files),
    entries: [],
  });
  const [changed, setChanged] = useState<string[]>([]);
  const [line, setLine] = useState("");
  const [recall, setRecall] = useState(-1);
  const screen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [log]);
  const submit = () => {
    const command = line.trim();
    if (!command) return;
    if (command === "clear") {
      setLog({ ...log, entries: [] });
      setLine("");
      return;
    }
    const result = run(command, log.state);
    const entry: Entry = {
      command,
      output: result.output,
      error: result.error,
    };
    const next = { state: result.state, entries: [...log.entries, entry] };
    setLog(next);
    setChanged(result.assigned);
    setLine("");
    setRecall(-1);
    if (goals.every((g) => g.check(next))) onSolved(true);
  };
  const commands = log.entries.map((e) => e.command);
  return (
    <div className="nl-card bb-shell">
      <div
        className="bb-screen"
        ref={screen}
        tabIndex={0}
        aria-label={t("Terminal output")}
        aria-live="polite"
      >
        {log.entries.length === 0 && (
          <p className="bb-dim">
            {t("Type a command and press Enter. Try: ls")}
          </p>
        )}
        {log.entries.map((entry, i) => (
          <div key={i} className="bb-entry al-appear">
            <div>
              <span className="bb-prompt">{PROMPT}</span> {entry.command}
            </div>
            {entry.output.map((out, j) => (
              <div key={j}>{out}</div>
            ))}
            {entry.error && <div className="bb-error">{entry.error}</div>}
          </div>
        ))}
      </div>
      <form
        className="bb-input"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="bb-line" className="bb-prompt">
          {PROMPT}
        </label>
        <input
          id="bb-line"
          value={line}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          maxLength={400}
          onChange={(e) => setLine(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" && commands.length) {
              e.preventDefault();
              const at =
                recall < 0 ? commands.length - 1 : Math.max(0, recall - 1);
              setRecall(at);
              setLine(commands[at]);
            }
          }}
        />
        <button type="submit" className="nl-primary">
          {t("Run")}
        </button>
      </form>
      <Shelf state={log.state} changed={changed} />
      <Goals goals={goals} log={log} />
    </div>
  );
}

/** An editable script, run with arguments; output lines appear in turn. */
function ScriptWidget({
  widget,
  onSolved,
}: { widget: Extract<Widget, { type: "script" }> } & WidgetProps) {
  const { t } = useT();
  const [source, setSource] = useState(widget.source);
  const [args, setArgs] = useState(widget.args);
  const [log, setLog] = useState<Log>({
    state: emptyState(widget.files),
    entries: [],
  });
  const [runs, setRuns] = useState(0);
  const last = log.entries.at(-1);
  const execute = () => {
    const argv = args.trim() ? args.trim().split(/\s+/) : [];
    const result = run(source, emptyState(widget.files, argv));
    const entry: Entry = {
      command: `bash ${widget.name}${argv.length ? ` ${argv.join(" ")}` : ""}`,
      output: result.output,
      error: result.error,
      source,
    };
    const next = { state: result.state, entries: [...log.entries, entry] };
    setLog(next);
    setRuns(runs + 1);
    if (widget.goals.every((g) => g.check(next))) onSolved(true);
  };
  return (
    <div className="nl-card bb-script">
      <label className="bb-file" htmlFor="bb-source">
        {widget.name}
      </label>
      <textarea
        id="bb-source"
        className="bb-editor"
        value={source}
        rows={Math.min(16, source.split("\n").length + 1)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        onChange={(e) => setSource(e.target.value.slice(0, 4000))}
      />
      <div className="bb-run">
        <code className="bb-prompt">$ bash {widget.name}</code>
        <input
          aria-label={t("Arguments")}
          placeholder={t("for example: auth.log")}
          value={args}
          spellCheck={false}
          maxLength={80}
          onChange={(e) => setArgs(e.target.value)}
        />
        <button type="button" className="nl-primary" onClick={execute}>
          <Play size={15} aria-hidden="true" /> {t("Run")}
        </button>
        <button
          type="button"
          className="nl-ghost"
          onClick={() => setSource(widget.source)}
        >
          <RotateCcw size={14} aria-hidden="true" /> {t("Start over")}
        </button>
      </div>
      <div className="bb-screen bb-output" tabIndex={0} aria-live="polite">
        {!last ? (
          <p className="bb-dim">{t("Press Run to execute the script.")}</p>
        ) : (
          <div key={runs}>
            <div>
              <span className="bb-prompt">$</span> {last.command}
            </div>
            {last.output.map((out, i) => (
              <div
                key={i}
                className="al-appear"
                style={{ animationDelay: `${Math.min(i, 20) * 70}ms` }}
              >
                {out}
              </div>
            ))}
            {last.error && (
              <div className="bb-error al-appear">{last.error}</div>
            )}
          </div>
        )}
      </div>
      <Goals goals={widget.goals} log={log} />
    </div>
  );
}

/** A for loop shown one turn at a time: the list, the variable, the output. */
function LoopWidget({
  name,
  items,
  line,
  onSolved,
}: { name: string; items: string[]; line: string } & WidgetProps) {
  const { t } = useT();
  const reduce = useReducedMotion();
  // Two beats per item: the variable takes the item, then the body runs.
  const total = items.length * 2;
  const [beat, setBeat] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const step = (to: number, auto: boolean) => {
    setBeat(to);
    if (to === total) {
      setPlaying(false);
      onSolved(true);
      return;
    }
    if (auto)
      timer.current = setTimeout(() => step(to + 1, true), reduce ? 0 : 900);
  };
  const play = () => {
    if (playing) {
      if (timer.current) clearTimeout(timer.current);
      setPlaying(false);
      return;
    }
    setPlaying(true);
    step(beat >= total ? 1 : beat + 1, true);
  };
  const restart = () => {
    if (timer.current) clearTimeout(timer.current);
    setPlaying(false);
    setBeat(0);
  };
  const index = beat === 0 ? -1 : Math.ceil(beat / 2) - 1;
  const inBody = beat > 0 && beat % 2 === 0;
  const value = index >= 0 ? items[index] : "";
  const outputs = items
    .slice(0, Math.floor(beat / 2))
    .map(
      (item) =>
        run(`${name}=${JSON.stringify(item)}; ${line}`, emptyState()).output[0],
    );
  const forLine = `for ${name} in ${items.join(" ")}; do`;
  return (
    <div className="nl-card bb-loop">
      <pre className="al-code bb-loop-code" tabIndex={0}>
        <span className={`bb-loop-line${beat > 0 && !inBody ? " on" : ""}`}>
          {forLine}
        </span>
        {"\n"}
        <span
          className={`bb-loop-line${inBody ? " on" : ""}`}
        >{`  ${line}`}</span>
        {"\ndone"}
      </pre>
      <div className="bb-chips" aria-label={t("List")}>
        {items.map((item, i) => (
          <span
            key={item}
            className={`bb-chip${i === index ? " on" : ""}${i < index || (i === index && inBody) ? " used" : ""}`}
          >
            {item}
          </span>
        ))}
      </div>
      <div className="bb-shelf">
        <span className="bb-shelf-title">{t("Variables")}</span>
        <span key={value} className={`bb-box${value ? " bb-flash" : ""}`}>
          <span className="bb-box-name">{name}</span>
          <code>{value || "''"}</code>
        </span>
        <span className="al-counter">
          {t("Turn {n} of {total}", {
            n: Math.max(0, index + 1),
            total: items.length,
          })}
        </span>
      </div>
      <div className="bb-screen" aria-live="polite" tabIndex={0}>
        {outputs.length === 0 ? (
          <p className="bb-dim">{t("Output appears here.")}</p>
        ) : (
          outputs.map((out, i) => (
            <div key={i} className="al-appear">
              {out}
            </div>
          ))
        )}
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
          onClick={() => step(beat >= total ? 1 : beat + 1, false)}
          disabled={playing}
        >
          <SkipForward size={15} aria-hidden="true" /> {t("Next step")}
        </button>
        <button type="button" className="nl-ghost" onClick={restart}>
          <RotateCcw size={15} aria-hidden="true" /> {t("Restart")}
        </button>
      </div>
    </div>
  );
}
