"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCode2,
  FlaskConical,
  History,
  Lightbulb,
  Play,
  RotateCcw,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";
import { MISSIONS, missionFiles, type Mission } from "@/lib/missions/catalog";
import {
  freshSandbox,
  simulate,
  type Actor,
  type LabRequest,
} from "@/lib/missions/engine";
import {
  EMPTY_SESSIONS,
  evaluateSession,
  missionReport,
  newSession,
  policyKey,
  recordRun,
  restoreSession,
  type Session,
} from "@/lib/missions/session";
import { translateStep } from "@/lib/missions/i18n";
import { useTranslator } from "@/components/locale-provider";
import { useLocalStorageState } from "../useLocalStorageState";
import { downloadText } from "../security-lab/storage";
import "./missions.css";

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
function selectedMission() {
  return (
    MISSIONS.find(
      (mission) => window.location.hash === `#mission/${mission.id}`,
    )?.id ?? "invoice"
  );
}

export function MissionControl() {
  const selected = useSyncExternalStore(
    subscribe,
    selectedMission,
    () => "invoice",
  );
  const mission = MISSIONS.find((item) => item.id === selected) ?? MISSIONS[0];
  const t = useTranslator();
  return (
    <div className="missions-root container">
      <header className="missions-header">
        <Link href="/playground" className="missions-back">
          <ArrowLeft size={15} /> {t("Playground")}
        </Link>
        <div className="missions-heading">
          <div>
            <span className="eyebrow">
              <span className="status-dot" /> {t("THE INVESTIGATION WORKSPACE")}
            </span>
            <h1>
              {t("Don’t follow the script.")}
              <br />
              <span>{t("Find the flaw.")}</span>
            </h1>
            <p>
              {t("Investigate a case. Challenge the system. Prove your fix.")}
            </p>
          </div>
          <div className="missions-mode">
            <FlaskConical size={20} />
            <div>
              <strong>{t("Browser sandbox")}</strong>
              <span>{t("Synthetic data · no setup needed")}</span>
            </div>
          </div>
        </div>
      </header>
      <nav className="mission-selector" aria-label={t("Choose a mission")}>
        {MISSIONS.map((item) => (
          <a
            key={item.id}
            href={`#mission/${item.id}`}
            aria-current={item.id === selected ? "page" : undefined}
          >
            <span className="mission-number">{item.number}</span>
            <div>
              <span>{t(item.category)}</span>
              <strong>{t(item.title)}</strong>
              <small>
                {t(item.difficulty)} · {t(item.minutes)}
              </small>
            </div>
            <ChevronRight size={18} />
          </a>
        ))}
      </nav>
      <Workspace key={mission.id} mission={mission} />
    </div>
  );
}

function Workspace({ mission }: { mission: Mission }) {
  const [raw, save] = useLocalStorageState<unknown>(
    `cybervalue:mission:${mission.id}:v1`,
    EMPTY_SESSIONS[mission.id],
  );
  const session = restoreSession(mission, raw);
  const [file, setFile] = useState(0);
  const [view, setView] = useState<"response" | "trace" | "compare">(
    "response",
  );
  const [notice, setNotice] = useState("");
  const [resetPending, setResetPending] = useState(false);
  const t = useTranslator();
  const result = evaluateSession(mission, session);
  const files = missionFiles(mission.id, session.variant, t);
  const latest = session.history.at(-1);
  const previous = session.history.at(-2);
  const update = (patch: Partial<Session>) => save({ ...session, ...patch });
  const editRequest = (patch: Partial<LabRequest>) =>
    update({ request: { ...session.request, ...patch } });
  const run = () => {
    const outcome = simulate(
      mission.id,
      session.variant,
      session.policy,
      session.request,
      session.sandbox,
    );
    save(recordRun(session, session.request, outcome));
    setNotice(
      `${t("Response {status}.", { status: outcome.status })} ${t(outcome.evidence === "exploit" ? "Unexpected access or behavior recorded as evidence." : outcome.evidence === "defense" ? "Defense evidence recorded. Run the full test suite before concluding." : "Inspect the response and execution trace.")}`,
    );
  };
  const changePolicy = (key: string, value: string) => {
    update({
      policy: { ...session.policy, [key]: value },
      sandbox: freshSandbox(),
      defensePolicy: null,
      testedPolicy: null,
    });
    setNotice(
      t(
        "Policy updated. Sandbox state reset; earlier requests remain in the evidence log. Retest this configuration.",
      ),
    );
  };
  const checklist = [
    {
      label: "Establish normal behavior",
      detail: "Run a valid owner request, order, or payment.",
      done: session.baseline,
    },
    {
      label: "Reproduce a failure",
      detail: "Capture an actual leak, invalid charge, replay, or forgery.",
      done: session.exploit,
    },
    {
      label: "Identify the root cause",
      detail: "Choose the explanation supported by your evidence.",
      done: result.diagnosed,
    },
    {
      label: "Verify a defense manually",
      detail: "Retry a problematic request against your current policy.",
      done: result.defended,
    },
    {
      label: "Pass every regression check",
      detail: "Block the failure and preserve valid behavior.",
      done: result.tests.length > 0 && result.passing === result.tests.length,
    },
  ];
  return (
    <>
      <div className="mission-statusbar">
        <div>
          <span className="status-dot" />
          <strong>
            {t(result.complete ? "CASE VERIFIED" : "INVESTIGATION OPEN")}
          </strong>
          <span>
            {t("CASE {number} / VARIANT {variant}", {
              number: mission.number,
              variant: session.variant,
            })}
          </span>
        </div>
        <span>
          {t("{done} / 5 objectives", {
            done: checklist.filter((item) => item.done).length,
          })}{" "}
          <b>
            {result.score}
            <small>/100</small>
          </b>
        </span>
      </div>
      <div className="mission-layout">
        <aside className="mission-brief">
          <section className="mission-panel">
            <span className="eyebrow">
              {t("INCOMING / {client}", { client: t(mission.client) })}
            </span>
            <h2>{t(mission.title)}</h2>
            <p>{t(mission.brief)}</p>
            <div className="mission-objective">
              <span>{t("YOUR ASSIGNMENT")}</span>
              <p>{t(mission.objective)}</p>
            </div>
            <ol className="mission-checklist">
              {checklist.map((item, index) => (
                <li key={item.label} className={item.done ? "is-done" : ""}>
                  <span>{item.done ? <Check size={13} /> : index + 1}</span>
                  <div>
                    <strong>{t(item.label)}</strong>
                    <p>{t(item.detail)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section className="mission-panel mission-hints">
            <h3>
              <Lightbulb size={17} /> {t("Need a lead?")}
            </h3>
            <p>
              {t(
                "Reveal hints one at a time. Each costs 5 learning points; all objectives remain achievable.",
              )}
            </p>
            {mission.hints.slice(0, session.hints).map((hint, index) => (
              <div key={hint}>
                <span>{t("LEAD 0{number}", { number: index + 1 })}</span>
                <p>{t(hint)}</p>
              </div>
            ))}
            <button
              className="mission-button secondary"
              disabled={session.hints >= mission.hints.length}
              onClick={() => update({ hints: session.hints + 1 })}
            >
              {t(
                session.hints === mission.hints.length
                  ? "All leads revealed"
                  : "Reveal the next lead",
              )}
              <ArrowRight size={14} />
            </button>
          </section>
          <div className="mission-save-note">
            {t(
              "Work is saved in this browser when storage is available. These are learning scores, not assessment grades.",
            )}
          </div>
        </aside>
        <div className="mission-desk">
          <section className="mission-panel mission-files">
            <div className="mission-panel-heading">
              <h3>
                <FileCode2 size={17} /> {t("Case files")}
              </h3>
              <span>{t("READ BEFORE TESTING")}</span>
            </div>
            <div
              className="mission-file-tabs"
              role="group"
              aria-label={t("Case files")}
            >
              {files.map((item, index) => (
                <button
                  key={item.name}
                  aria-pressed={file === index}
                  onClick={() => setFile(index)}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <pre>{files[file].text}</pre>
          </section>
          <section className="mission-panel mission-request">
            <div className="mission-panel-heading">
              <h3>
                <Terminal size={17} /> {t("Request workbench")}
              </h3>
              <span>{t("EDIT · SEND · OBSERVE")}</span>
            </div>
            <p className="mission-help">
              {t(
                "Edit paths, identity, and JSON freely within this case. Requests run in the browser simulation.",
              )}
            </p>
            <div className="mission-request-line">
              <label>
                {t("Method")}
                <select
                  aria-label={t("Request method")}
                  value={session.request.method}
                  onChange={(event) =>
                    editRequest({
                      method: event.target.value as LabRequest["method"],
                    })
                  }
                >
                  <option>GET</option>
                  <option>POST</option>
                </select>
              </label>
              <label className="mission-path">
                {t("Sandbox path")}
                <input
                  aria-label={t("Sandbox path")}
                  value={session.request.path}
                  maxLength={160}
                  onChange={(event) =>
                    editRequest({ path: event.target.value })
                  }
                  spellCheck={false}
                />
              </label>
              <label>
                {t("Identity")}
                <select
                  aria-label={t("Request identity")}
                  value={session.request.actor}
                  onChange={(event) =>
                    editRequest({ actor: event.target.value as Actor })
                  }
                >
                  <option value="alex">Alex</option>
                  <option value="sam">Sam</option>
                  <option value="anonymous">{t("Anonymous")}</option>
                </select>
              </label>
            </div>
            {session.request.method === "POST" && (
              <label className="mission-body-label">
                {t("JSON request body")}
                <textarea
                  aria-label={t("JSON request body")}
                  value={session.request.body}
                  onChange={(event) =>
                    editRequest({ body: event.target.value })
                  }
                  spellCheck={false}
                  maxLength={4000}
                  rows={9}
                />
              </label>
            )}
            <div className="mission-request-actions">
              <button className="mission-button" onClick={run}>
                <Play size={15} /> {t("Send request")}
              </button>
              <button
                className="mission-button quiet"
                onClick={() => {
                  update({ sandbox: freshSandbox() });
                  setNotice(
                    t("Sandbox counters reset. Policies and evidence kept."),
                  );
                }}
              >
                <RotateCcw size={14} /> {t("Reset sandbox")}
              </button>
              {mission.id === "webhook" && (
                <span className="mission-deliveries">
                  {t("{count} deliveries", {
                    count: session.sandbox.deliveries,
                  })}
                </span>
              )}
            </div>
            <div className="mission-notice" role="status">
              {notice ||
                t(
                  "Start with the normal request. Then change one variable and compare.",
                )}
            </div>
            <div className="mission-response">
              <div className="mission-response-bar">
                <div role="group" aria-label={t("Response view")}>
                  {(["response", "trace", "compare"] as const).map((item) => (
                    <button
                      key={item}
                      aria-pressed={view === item}
                      onClick={() => setView(item)}
                    >
                      {t(
                        item === "compare"
                          ? "Compare last two"
                          : item === "trace"
                            ? "Execution trace"
                            : "Response",
                      )}
                    </button>
                  ))}
                </div>
                {latest && (
                  <strong
                    className={
                      latest.outcome.status < 400
                        ? "status-ok"
                        : "status-denied"
                    }
                  >
                    {latest.outcome.status}
                  </strong>
                )}
              </div>
              {!latest ? (
                <div className="mission-console-empty">
                  <Terminal size={23} />
                  <p>{t("Your first request starts the investigation.")}</p>
                </div>
              ) : view === "response" ? (
                <pre>{JSON.stringify(latest.outcome.data, null, 2)}</pre>
              ) : view === "trace" ? (
                <ol className="mission-trace">
                  {latest.outcome.trace.map((step, index) => (
                    <li key={index}>
                      <span>{index + 1}</span>
                      {translateStep(t, step)}
                    </li>
                  ))}
                </ol>
              ) : previous ? (
                <div className="mission-compare">
                  {[previous, latest].map((entry, index) => (
                    <div key={index}>
                      <span>
                        {t(index === 0 ? "PREVIOUS" : "LATEST")} ·{" "}
                        {entry.outcome.status}
                      </span>
                      <p>
                        {entry.request.method} {entry.request.path} ·{" "}
                        {entry.request.actor === "anonymous"
                          ? t("Anonymous")
                          : entry.request.actor}
                      </p>
                      <pre>{JSON.stringify(entry.outcome.data, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mission-help">
                  {t("Send at least two requests to compare responses.")}
                </p>
              )}
            </div>
          </section>
          <section className="mission-panel">
            <div className="mission-panel-heading">
              <h3>
                <ShieldCheck size={17} /> {t("Defense engineering")}
              </h3>
              <span>{t("FIX WITHOUT BREAKING")}</span>
            </div>
            <p className="mission-help">
              {t(
                "Change the service’s policies, then retry your request. Policy changes start a fresh sandbox and invalidate previous verification.",
              )}
            </p>
            <div className="mission-controls">
              {mission.controls.map((control) => (
                <label key={control.key}>
                  {t(control.label)}
                  <select
                    value={session.policy[control.key]}
                    onChange={(event) =>
                      changePolicy(control.key, event.target.value)
                    }
                  >
                    {control.options.map((option) => (
                      <option value={option.value} key={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label className="mission-shutdown">
              <input
                type="checkbox"
                checked={session.policy.shutdown === "on"}
                onChange={(event) =>
                  changePolicy("shutdown", event.target.checked ? "on" : "off")
                }
              />
              <span>
                {t("Emergency block all traffic")}{" "}
                <small>
                  {t("Test the impact of taking the service offline.")}
                </small>
              </span>
            </label>
            <button
              className="mission-button"
              onClick={() => {
                update({ testedPolicy: policyKey(session.policy) });
                setNotice(
                  t(
                    "Regression suite finished in a separate clean sandbox. Review every failing expectation below.",
                  ),
                );
              }}
            >
              <ShieldCheck size={15} /> {t("Run regression suite")}
            </button>
            {result.tested && (
              <div className="mission-tests" aria-live="polite">
                <h4>
                  {t("{passing} / {total} checks passed", {
                    passing: result.passing,
                    total: result.tests.length,
                  })}
                </h4>
                {result.tests.map((test) => (
                  <details
                    key={test.name}
                    className={test.passed ? "test-pass" : "test-fail"}
                  >
                    <summary>
                      {test.passed ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <X size={15} />
                      )}
                      <span>{t(test.name)}</span>
                      <small>{t(test.passed ? "PASS" : "FAIL")}</small>
                    </summary>
                    <p>
                      {t("Expected: {value}", {
                        value: translateStep(t, test.expected),
                      })}
                    </p>
                    <pre>{t("Observed: {value}", { value: test.actual })}</pre>
                  </details>
                ))}
              </div>
            )}
          </section>
          <section className="mission-panel">
            <div className="mission-panel-heading">
              <h3>{t("Investigator’s conclusion")}</h3>
              <span>{t("CONNECT THE EVIDENCE")}</span>
            </div>
            <fieldset className="mission-hypotheses">
              <legend>{t("Which explanation fits the failure?")}</legend>
              {mission.hypotheses.map((hypothesis, index) => (
                <label key={hypothesis}>
                  <input
                    type="radio"
                    name="hypothesis"
                    value={index}
                    checked={session.hypothesis === index}
                    onChange={() => update({ hypothesis: index })}
                  />
                  <span>{t(hypothesis)}</span>
                </label>
              ))}
            </fieldset>
            {session.hypothesis !== -1 && (
              <p
                className={
                  result.diagnosed ? "mission-correct" : "mission-wrong"
                }
              >
                {t(
                  result.diagnosed
                    ? "This explains the trust boundary. Support it with request evidence."
                    : "This does not explain all the observed failure paths. Revisit the case files and test another assumption.",
                )}
              </p>
            )}
            <label className="mission-body-label">
              {t("Your findings and reasoning")}
              <textarea
                aria-label={t("Investigator notes")}
                rows={4}
                maxLength={5000}
                placeholder={t(
                  "What changed? Which request proves the impact? Why does the fix preserve valid behavior?",
                )}
                value={session.notes}
                onChange={(event) => update({ notes: event.target.value })}
              />
            </label>
            <button
              className="mission-button secondary"
              onClick={() =>
                downloadText(
                  `cybervalue-${mission.id}-case-${session.variant}.md`,
                  missionReport(mission, session, t),
                )
              }
            >
              <Download size={15} /> {t("Export investigation")}
            </button>
          </section>
          {result.complete && (
            <section
              className="mission-debrief"
              aria-label={t("Mission debrief")}
            >
              <CheckCircle2 size={28} />
              <span className="eyebrow">
                {t("EVIDENCE COLLECTED. DEFENSE VERIFIED.")}
              </span>
              <h2>{t("Case closed. Lesson earned.")}</h2>
              <p>{t(mission.debrief)}</p>
              <span>
                {t("Learning score: {score}/100 · {hints} hints used", {
                  score: result.score,
                  hints: session.hints,
                })}
              </span>
              {MISSIONS.findIndex((item) => item.id === mission.id) <
                MISSIONS.length - 1 && (
                <Link
                  className="mission-button"
                  href={`#mission/${MISSIONS[MISSIONS.findIndex((item) => item.id === mission.id) + 1].id}`}
                >
                  {t("Take the next case")} <ArrowRight size={15} />
                </Link>
              )}
            </section>
          )}
          <details className="mission-panel mission-history">
            <summary>
              <History size={17} /> {t("Evidence log")}{" "}
              <span>
                {t("{count} / 16 recent requests", {
                  count: session.history.length,
                })}
              </span>
            </summary>
            {session.history.length === 0 ? (
              <p>{t("No requests recorded yet.")}</p>
            ) : (
              <ol>
                {session.history.map((entry, index) => (
                  <li key={index}>
                    <span
                      className={
                        entry.outcome.status < 400
                          ? "status-ok"
                          : "status-denied"
                      }
                    >
                      {entry.outcome.status}
                    </span>
                    <div>
                      <strong>
                        {entry.request.method} {entry.request.path}
                      </strong>
                      <small>
                        {entry.request.actor === "anonymous"
                          ? t("Anonymous")
                          : entry.request.actor}{" "}
                        · {t(entry.outcome.evidence ?? "observation")}
                      </small>
                    </div>
                    <button
                      className="mission-button quiet"
                      onClick={() => {
                        update({ request: entry.request });
                        setNotice(
                          t(
                            "Request loaded into the workbench. Send it to run against the current policy.",
                          ),
                        );
                      }}
                    >
                      {t("Load request {number}", { number: index + 1 })}
                      <ArrowRight size={13} />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </details>
          <div className="mission-reset">
            <p>
              {t(
                "Want a fresh challenge? A new case changes fixture IDs and values and clears this mission’s current work.",
              )}
            </p>
            {resetPending ? (
              <div>
                <button
                  className="mission-button secondary"
                  onClick={() => {
                    save(newSession(mission, (session.variant % 3) + 1));
                    setResetPending(false);
                    setNotice(
                      t(
                        "New case loaded. Re-read the case files: the fixture values have changed.",
                      ),
                    );
                  }}
                >
                  {t("Start fresh case")}
                </button>
                <button
                  className="mission-button quiet"
                  onClick={() => setResetPending(false)}
                >
                  {t("Keep current work")}
                </button>
              </div>
            ) : (
              <button
                className="mission-button secondary"
                onClick={() => setResetPending(true)}
              >
                <RotateCcw size={14} /> {t("New case variant")}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
