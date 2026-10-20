"use client";

import { useEffect, useRef, useState } from "react";
import { Check, KeyRound, Laptop, Lock, Server } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import {
  LESSONS,
  PROGRESS_KEY,
  type SshGoal,
  type Widget,
} from "@/lib/ssh-basics/curriculum";
import {
  prompt,
  secret,
  startSim,
  step,
  type Line,
  type Sim,
} from "@/lib/ssh-basics/sim";
import "../bash-basics/bash-basics.css";
import "./ssh-basics.css";

// Academy · SSH: how remote connection works, with a pretend SSH client.
export function SshBasics() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("TERMINAL FOUNDATIONS · ANIMATED")}
      title={t("Remote access with SSH.")}
      subtitle={t("How remote connection works.")}
      description={t(
        "Watch an encrypted SSH session being built, connect to a practice server, accept its host key, then switch from a password to a key pair.",
      )}
      badge={t("SSH / REMOTE")}
      icon={<KeyRound size={22} />}
      renderWidget={(widget: Widget, props) =>
        widget.type === "ssh" ? (
          <SshWidget goals={widget.goals} {...props} />
        ) : (
          <CommonWidgetView widget={widget} {...props} />
        )
      }
    />
  );
}

/** A pretend SSH client with a live picture of the connection. */
function SshWidget({ goals, onSolved }: { goals: SshGoal[] } & WidgetProps) {
  const { t, text } = useT();
  const [sim, setSim] = useState<Sim>(startSim);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const screen = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines]);
  const submit = () => {
    if (input.trim() === "clear") {
      setLines([]);
      setInput("");
      return;
    }
    const result = step(sim, input);
    setSim(result.sim);
    setLines((old) => [...old, ...result.lines].slice(-200));
    setInput("");
    field.current?.focus();
    if (goals.every((g) => g.check(result.sim))) onSolved(true);
  };
  const connected = sim.mode.kind === "remote";
  const waiting = sim.mode.kind === "confirm" || sim.mode.kind === "password";
  return (
    <div className="nl-card ss-widget">
      <div
        className={`ss-link${connected ? " up" : ""}${waiting ? " wait" : ""}`}
        aria-hidden="true"
      >
        <span className="ss-end">
          <Laptop size={20} />
          {t("Laptop")}
          {sim.key && (
            <span className="ss-key">
              <KeyRound size={12} /> id_ed25519
            </span>
          )}
        </span>
        <span className="ss-pipe">
          {connected && (
            <span className="ss-tunnel">
              <Lock size={12} /> {t("encrypted")}
            </span>
          )}
        </span>
        <span className="ss-end">
          <Server size={20} />
          server.uz
          {sim.copied && (
            <span className="ss-key">
              <KeyRound size={12} /> .pub
            </span>
          )}
        </span>
      </div>
      <p className="al-counter" aria-live="polite">
        {connected
          ? t("Connected to server.uz — commands now run on the server.")
          : waiting
            ? t("The server is waiting for your answer.")
            : t("Not connected. Commands run on your laptop.")}
      </p>
      <div
        className="bb-screen ss-screen"
        ref={screen}
        tabIndex={0}
        aria-label={t("Terminal output")}
        aria-live="polite"
      >
        {lines.length === 0 && (
          <p className="bb-dim">
            {t("Type a command and press Enter. Try: ssh ali@server.uz")}
          </p>
        )}
        {lines.map((line, i) => (
          <div key={i} className={`ss-${line.kind}`}>
            {line.text}
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
        <label
          htmlFor="ss-line"
          className={connected ? "ss-remote-prompt" : "bb-prompt"}
        >
          {prompt(sim)}
        </label>
        <input
          id="ss-line"
          ref={field}
          type={secret(sim) ? "password" : "text"}
          value={input}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          maxLength={200}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="nl-primary">
          {t("Run")}
        </button>
      </form>
      <ul className="bb-goals" aria-label={t("Goals")}>
        {goals.map((goal, i) => {
          const met = goal.check(sim);
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
    </div>
  );
}
