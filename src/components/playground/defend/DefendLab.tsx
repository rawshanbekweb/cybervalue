"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  Crosshair,
  Download,
  Lightbulb,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  SCENARIOS,
  SITE_ORIGIN,
  displayInput,
  summarize,
  type CaseResult,
  type Scenario,
} from "@/lib/defend/scenarios";
import { MAX_CODE_LENGTH } from "@/lib/defend/harness";
import { useTranslator } from "@/components/locale-provider";
import type { Translator } from "@/lib/i18n";
import { useLocalStorageState } from "../useLocalStorageState";
import { downloadText } from "../security-lab/storage";
import { previewDocument, runCase } from "./runner";
import "./defend.css";

type Saved = {
  code: string;
  hints: number;
  runs: number;
  defended: boolean;
};

const storageKey = (id: string) => `cybervalue:defend:${id}:v1`;

// Storage is untrusted: keep only well-formed fields.
function restore(raw: unknown, scenario: Scenario): Saved {
  const value = (raw && typeof raw === "object" ? raw : {}) as Partial<Saved>;
  const count = (n: unknown, max: number) =>
    typeof n === "number" && Number.isInteger(n) && n >= 0
      ? Math.min(n, max)
      : 0;
  return {
    code:
      typeof value.code === "string"
        ? value.code.slice(0, MAX_CODE_LENGTH)
        : scenario.starter,
    hints: count(value.hints, scenario.hints.length),
    runs: count(value.runs, 100000),
    defended: value.defended === true,
  };
}

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
const selectedScenario = () =>
  SCENARIOS.find((item) => window.location.hash === `#scenario/${item.id}`)
    ?.id ?? SCENARIOS[0].id;

export function DefendLab() {
  const t = useTranslator();
  const selected = useSyncExternalStore(
    subscribe,
    selectedScenario,
    () => SCENARIOS[0].id,
  );
  const scenario =
    SCENARIOS.find((item) => item.id === selected) ?? SCENARIOS[0];
  return (
    <div className="defend-root container">
      <header className="defend-header">
        <Link href="/playground" className="defend-back">
          <ArrowLeft size={15} /> {t("Playground")}
        </Link>
        <div className="defend-heading">
          <div>
            <span className="eyebrow">
              <span className="status-dot" /> {t("BUILD & DEFEND")}
            </span>
            <h1>
              {t("Write the code.")}
              <br />
              <span>{t("Survive the attack.")}</span>
            </h1>
            <p>
              {t(
                "You write the rendering code. An attacker bot fires real payloads at it. Fix it until every attack fails and every feature still works.",
              )}
            </p>
          </div>
          <div className="defend-mode">
            <Bot size={22} />
            <div>
              <strong>{t("Real sandbox")}</strong>
              <span>{t("Payloads truly execute · isolated · offline")}</span>
            </div>
          </div>
        </div>
      </header>
      <nav className="defend-nav" aria-label={t("Choose a scenario")}>
        {SCENARIOS.map((item) => (
          <NavItem
            key={item.id}
            scenario={item}
            current={item.id === scenario.id}
          />
        ))}
      </nav>
      <Workspace key={scenario.id} scenario={scenario} />
    </div>
  );
}

function NavItem({
  scenario,
  current,
}: {
  scenario: Scenario;
  current: boolean;
}) {
  const t = useTranslator();
  const [raw] = useLocalStorageState<unknown>(storageKey(scenario.id), null);
  const saved = restore(raw, scenario);
  return (
    <a
      href={`#scenario/${scenario.id}`}
      aria-current={current ? "page" : undefined}
    >
      <span className="defend-nav-number">{scenario.number}</span>
      <div>
        <span>{t(scenario.level)}</span>
        <strong>{t(scenario.title)}</strong>
        <small className={saved.defended ? "is-defended" : undefined}>
          {saved.defended ? (
            <>
              <ShieldCheck size={13} /> {t("Defended")}
            </>
          ) : (
            t("{count} attacks waiting", {
              count: scenario.cases.filter((c) => c.kind === "attack").length,
            })
          )}
        </small>
      </div>
    </a>
  );
}

type Phase = "idle" | "running" | "done";

function Workspace({ scenario }: { scenario: Scenario }) {
  const t = useTranslator();
  const [raw, save] = useLocalStorageState<unknown>(
    storageKey(scenario.id),
    null,
  );
  const saved = restore(raw, scenario);
  const update = (patch: Partial<Saved>) => save({ ...saved, ...patch });
  const [results, setResults] = useState<CaseResult[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [testedCode, setTestedCode] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const running = useRef(false);

  const summary = summarize(scenario, results);
  const stale = phase === "done" && testedCode !== saved.code;
  const attacks = scenario.cases.filter((c) => c.kind === "attack");
  const features = scenario.cases.filter((c) => c.kind === "function");
  const index = SCENARIOS.findIndex((item) => item.id === scenario.id);
  const next = SCENARIOS[index + 1];

  const launch = async () => {
    if (running.current) return;
    running.current = true;
    const code = saved.code;
    setPhase("running");
    setResults([]);
    setNotice("");
    setPreview(previewDocument(code, scenario));
    const collected: CaseResult[] = [];
    // Features first, then the attacks, streamed into the console one by one.
    for (const item of [...features, ...attacks]) {
      const report = await runCase(code, scenario, item.input);
      collected.push({
        id: item.id,
        kind: item.kind,
        passed: item.check(report),
        report,
      });
      setResults([...collected]);
    }
    const outcome = summarize(scenario, collected);
    setTestedCode(code);
    setPhase("done");
    save({
      ...saved,
      code,
      runs: saved.runs + 1,
      defended: saved.defended || outcome.defended,
    });
    setNotice(
      outcome.defended
        ? t("Every attack failed and every feature works. Scenario defended.")
        : t(
            "{attacks} of {total} attacks blocked. Read the findings, fix the code and attack again.",
            {
              attacks: outcome.attacks.passed,
              total: outcome.attacks.total,
            },
          ),
    );
    running.current = false;
  };

  return (
    <div className="defend-layout">
      <aside className="defend-brief">
        <section className="defend-panel">
          <span className="eyebrow">
            {t("CLIENT")} / {t(scenario.client)}
          </span>
          <h2>{t(scenario.title)}</h2>
          <p>{t(scenario.brief)}</p>
          <h3>{t("Your contract")}</h3>
          <pre className="defend-contract">
            <code>{`function ${scenario.signature}`}</code>
          </pre>
          <p className="defend-help">
            {t(
              "Keep this function name and parameters. The page root is an empty element; the site address is available as SITE ({site}).",
              { site: SITE_ORIGIN },
            )}
          </p>
          <h3>{t("Must keep working")}</h3>
          <ul className="defend-features">
            {features.map((item) => (
              <li key={item.id}>{t(item.label)}</li>
            ))}
          </ul>
          <p className="defend-arsenal">
            <Crosshair size={15} />{" "}
            {t(
              "The bot has {count} attacks ready. You see each one when it hits.",
              { count: attacks.length },
            )}
          </p>
        </section>
        <section className="defend-panel defend-hints">
          <h3>
            <Lightbulb size={16} /> {t("Need a lead?")}
          </h3>
          {scenario.hints.slice(0, saved.hints).map((hint, i) => (
            <div key={hint}>
              <span>{t("LEAD 0{number}", { number: i + 1 })}</span>
              <p>{t(hint)}</p>
            </div>
          ))}
          <button
            className="defend-button secondary"
            disabled={saved.hints >= scenario.hints.length}
            onClick={() => update({ hints: saved.hints + 1 })}
          >
            {t(
              saved.hints >= scenario.hints.length
                ? "All leads revealed"
                : "Reveal the next lead",
            )}
            <ArrowRight size={14} />
          </button>
          <Link href={scenario.lesson} className="defend-lesson">
            {t("Review the related lesson")} <ArrowUpRight size={14} />
          </Link>
        </section>
      </aside>

      <div className="defend-desk">
        <section className="defend-panel" aria-labelledby="defend-editor">
          <div className="defend-panel-heading">
            <h3 id="defend-editor">{t("Your code")}</h3>
            <span>
              {t("{count} / {limit} characters", {
                count: saved.code.length,
                limit: MAX_CODE_LENGTH,
              })}
            </span>
          </div>
          <label className="sr-only" htmlFor="defend-code">
            {t("JavaScript code")}
          </label>
          <textarea
            id="defend-code"
            className="defend-code"
            value={saved.code}
            maxLength={MAX_CODE_LENGTH}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            rows={16}
            readOnly={phase === "running"}
            onChange={(event) => update({ code: event.target.value })}
            onKeyDown={(event) => {
              // Tab indents; Shift+Tab still leaves the editor.
              if (event.key !== "Tab" || event.shiftKey) return;
              event.preventDefault();
              const el = event.currentTarget;
              const { selectionStart: start, selectionEnd: end } = el;
              const value = `${el.value.slice(0, start)}  ${el.value.slice(end)}`;
              update({ code: value });
              requestAnimationFrame(() =>
                el.setSelectionRange(start + 2, start + 2),
              );
            }}
          />
          <p className="defend-help">
            {t(
              "Tab inserts spaces; Shift+Tab leaves the editor. Your code is saved in this browser.",
            )}
          </p>
          <div className="defend-actions">
            <button
              className="defend-button attack"
              onClick={launch}
              disabled={phase === "running"}
            >
              <Crosshair size={16} />
              {phase === "running"
                ? t("Attack in progress…")
                : t("Launch the attack")}
            </button>
            <button
              className="defend-button secondary"
              onClick={() => setPreview(previewDocument(saved.code, scenario))}
            >
              <Play size={15} /> {t("Run preview")}
            </button>
            <button
              className="defend-button quiet"
              onClick={() => {
                if (
                  !window.confirm(
                    t(
                      "Restore the vulnerable starter code? Your current code will be replaced.",
                    ),
                  )
                )
                  return;
                update({ code: scenario.starter });
                setResults([]);
                setPhase("idle");
                setNotice(t("Starter code restored."));
              }}
            >
              <RotateCcw size={14} /> {t("Restore starter")}
            </button>
          </div>
        </section>

        <section className="defend-panel" aria-labelledby="defend-preview">
          <div className="defend-panel-heading">
            <h3 id="defend-preview">{t("Preview with normal data")}</h3>
            <span>{t("ISOLATED SANDBOX")}</span>
          </div>
          {preview ? (
            <iframe
              className="defend-preview"
              sandbox="allow-scripts"
              srcDoc={preview}
              title={t("Preview of your page")}
            />
          ) : (
            <p className="defend-empty">
              {t("Run the preview or launch the attack to see your page.")}
            </p>
          )}
        </section>

        <section className="defend-panel defend-console-panel">
          <div className="defend-panel-heading">
            <h3>
              <Bot size={17} /> {t("Attacker console")}
            </h3>
            {phase !== "idle" && (
              <span className="defend-score">
                {t("Attacks blocked {attacks} · Features {features}", {
                  attacks: `${summary.attacks.passed}/${summary.attacks.total}`,
                  features: `${summary.features.passed}/${summary.features.total}`,
                })}
              </span>
            )}
          </div>
          <div className="defend-console" role="log" aria-live="polite">
            {phase === "idle" && (
              <p className="defend-empty">
                {t("> Bot is idle. Launch the attack when your code is ready.")}
              </p>
            )}
            {results.map((result, i) => (
              <ResultLine
                key={result.id}
                index={i}
                scenario={scenario}
                result={result}
                t={t}
              />
            ))}
            {phase === "running" && (
              <p className="defend-cursor">{t("> Bot is attacking…")}</p>
            )}
          </div>
          {notice && (
            <p className="defend-notice" role="status">
              {notice}
            </p>
          )}
          {stale && (
            <p className="defend-help">
              {t("Your code changed since this attack. Launch it again.")}
            </p>
          )}
        </section>

        {phase === "done" && summary.defended && !stale && (
          <section className="defend-debrief" aria-label={t("Debrief")}>
            <CheckCircle2 size={30} />
            <span className="eyebrow">
              {t("ALL ATTACKS FAILED. EVERY FEATURE WORKS.")}
            </span>
            <h2>{t("The bot is beaten.")}</h2>
            <p>{t(scenario.debrief)}</p>
            <span>
              {t("Attack runs: {runs} · Leads used: {hints}", {
                runs: saved.runs,
                hints: saved.hints,
              })}
            </span>
            <div className="defend-actions">
              <button
                className="defend-button secondary"
                onClick={() =>
                  downloadText(
                    `cybervalue-defend-${scenario.id}.md`,
                    report(scenario, saved, results, t),
                  )
                }
              >
                <Download size={15} /> {t("Export defense report")}
              </button>
              {next && (
                <a className="defend-button" href={`#scenario/${next.id}`}>
                  {t("Next scenario")} <ArrowRight size={15} />
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ResultLine({
  index,
  scenario,
  result,
  t,
}: {
  index: number;
  scenario: Scenario;
  result: CaseResult;
  t: Translator;
}) {
  const item = scenario.cases.find((c) => c.id === result.id)!;
  const attack = item.kind === "attack";
  const status = result.passed
    ? t(attack ? "BLOCKED" : "WORKS")
    : t(attack ? "VULNERABLE" : "BROKEN");
  const { report } = result;
  return (
    <details
      className={`defend-line ${result.passed ? "pass" : "fail"}`}
      open={!result.passed}
    >
      <summary>
        <span className="defend-line-index">
          {String(index + 1).padStart(2, "0")}
        </span>
        {result.passed ? (
          attack ? (
            <ShieldCheck size={15} />
          ) : (
            <Check size={15} />
          )
        ) : attack ? (
          <ShieldAlert size={15} />
        ) : (
          <X size={15} />
        )}
        <span className="defend-line-kind">
          {t(attack ? "ATTACK" : "FEATURE")}
        </span>
        <span className="defend-line-label">{t(item.label)}</span>
        <b>{status}</b>
      </summary>
      {!result.passed && <p>{t(item.failure)}</p>}
      {report.fired.length > 0 && (
        <p className="defend-evidence">
          {t("Evidence: the payload executed ({markers}).", {
            markers: report.fired.join(", "),
          })}
        </p>
      )}
      {report.threw && (
        <p className="defend-evidence">
          {t("Your code threw an error: {message}", { message: report.threw })}
        </p>
      )}
      <div className="defend-io">
        <div>
          <span>{t("Input the bot sent")}</span>
          <pre>{displayInput(item.input)}</pre>
        </div>
        <div>
          <span>
            {scenario.id === "redirect"
              ? t("Your function returned")
              : t("Resulting page HTML")}
          </span>
          <pre>
            {scenario.id === "redirect"
              ? JSON.stringify(report.returned)
              : report.html || t("(empty)")}
          </pre>
        </div>
      </div>
    </details>
  );
}

function report(
  scenario: Scenario,
  saved: Saved,
  results: CaseResult[],
  t: Translator,
) {
  const lines = scenario.cases.map((item) => {
    const passed = results.find((r) => r.id === item.id)?.passed;
    return `- [${passed ? "x" : " "}] ${t(item.kind === "attack" ? "ATTACK" : "FEATURE")}: ${t(item.label)}`;
  });
  return [
    `# ${t("Build & Defend")}: ${t(scenario.title)}`,
    "",
    t("Attack runs: {runs} · Leads used: {hints}", {
      runs: saved.runs,
      hints: saved.hints,
    }),
    "",
    `## ${t("Results")}`,
    ...lines,
    "",
    `## ${t("Defended code")}`,
    "```js",
    saved.code,
    "```",
    "",
    `## ${t("Lesson")}`,
    t(scenario.debrief),
    "",
    t(
      "Attacks ran in an isolated browser sandbox against your own code. This is a learning record, not a security certification.",
    ),
    "",
  ].join("\n");
}
