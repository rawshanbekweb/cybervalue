"use client";

import { useState } from "react";
import { ScanSearch, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/autotest/curriculum";
import {
  CHECK_NAMES,
  CHECKS,
  FINDINGS,
  PROBLEMS,
  pipelineRight,
  triageRight,
  type Calls,
  type Check,
  type Picks,
} from "@/lib/autotest/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Automated security testing: triage SAST findings,
// then place each problem with the check that catches it.
export function AutoTest() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("APPSEC · MODULE 4")}
      title={t("Automated security testing.")}
      subtitle={t("Let machines check every commit.")}
      description={t(
        "See why checks belong on every pull request, learn what SAST can and can’t see, triage six findings into real problems and false alarms, add dependency and secret scanning, probe a running site with DAST, place each check in the pipeline and decide what blocks a merge.",
      )}
      badge={t("DEVSECOPS / LAB")}
      icon={<ScanSearch size={22} />}
      checkpoints={["autotest-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "triage":
            return <TriageWidget {...props} />;
          case "pipeline":
            return <PipelineWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Six analyser findings: a real problem or a false alarm? */
function TriageWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const call = (id: string, real: boolean) => {
    const next = { ...calls, [id]: real };
    setCalls(next);
    onSolved(triageRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {FINDINGS.map((f) => {
          const c = calls[f.id];
          return (
            <li key={f.id} className="sc-line">
              <p className="cb-label">
                <code>{f.rule}</code> · <code>{f.file}</code>
              </p>
              <code className="sc-code">{f.code}</code>
              <fieldset className="sch-choice">
                <legend className="visually-hidden">
                  {t("{rule} in {file}", { rule: f.rule, file: f.file })}
                </legend>
                <label>
                  <input
                    type="radio"
                    name={`at-${f.id}`}
                    checked={c === true}
                    onChange={() => call(f.id, true)}
                  />{" "}
                  {t("Real problem")}
                </label>
                <label>
                  <input
                    type="radio"
                    name={`at-${f.id}`}
                    checked={c === false}
                    onChange={() => call(f.id, false)}
                  />{" "}
                  {t("False alarm")}
                </label>
              </fieldset>
              {c !== undefined && (
                <span className={c === f.real ? "sd-ok" : "sd-bad"}>
                  {c === f.real ? text(f.why) : t("Look again")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {triageRight(calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Three to fix and three exceptions to write down. The question each time: can a user reach this value?",
          )}
        </p>
      )}
    </div>
  );
}

/** Five problems; choose the check that catches each. */
function PipelineWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picks, setPicks] = useState<Picks>({});
  const right = PROBLEMS.filter((p) => picks[p.id] === p.check).length;
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {PROBLEMS.map((p) => {
          const c = picks[p.id];
          return (
            <li key={p.id} className="sc-line">
              <label className="cb-field">
                {text(p.text)}
                <select
                  value={c ?? ""}
                  onChange={(e) => {
                    const next = { ...picks, [p.id]: e.target.value as Check };
                    setPicks(next);
                    onSolved(pipelineRight(next));
                  }}
                >
                  <option value="">{t("Choose a check")}</option>
                  {CHECKS.map((check) => (
                    <option key={check} value={check}>
                      {text(CHECK_NAMES[check])}
                    </option>
                  ))}
                </select>
              </label>
              {c && (
                <span className={c === p.check ? "sd-ok" : "sd-bad"}>
                  {c === p.check ? t("That’s the check") : t("Not this one")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: PROBLEMS.length })}
      </p>
      {pipelineRight(picks) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Every layer has its job: secrets before the commit, SAST and SCA on the pull request, DAST against staging.",
          )}
        </p>
      )}
    </div>
  );
}
