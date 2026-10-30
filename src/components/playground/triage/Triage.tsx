"use client";

import { useState } from "react";
import { ListChecks, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/triage/curriculum";
import {
  ALERTS,
  allRight,
  right,
  VERDICTS,
  type Answers,
  type Verdict,
} from "@/lib/triage/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./triage.css";

// Academy Intermediate · Alert triage: judge a queue of five alerts by their
// context.
export function Triage() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("BLUE TEAM · MODULE 3")}
      title={t("Alert triage.")}
      subtitle={t("Real or not, now or later.")}
      description={t(
        "Put alerts in order of priority, read an alert’s parts, work a queue of five alerts to escalate, close or tune, stay careful under pressure, write a clean escalation, and learn SOC tiers, playbooks and metrics.",
      )}
      badge={t("TRIAGE / LAB")}
      icon={<ListChecks size={22} />}
      checkpoints={["triage-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) =>
        widget.type === "queue" ? (
          <QueueWidget {...props} />
        ) : (
          <CommonWidgetView widget={widget} {...props} />
        )
      }
    />
  );
}

/** Five alerts with context; pick escalate, close or tune for each. */
function QueueWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [answers, setAnswers] = useState<Answers>({});
  const label: Record<Verdict, string> = {
    escalate: t("Malicious: escalate"),
    close: t("Benign: close"),
    tune: t("False positive: tune the rule"),
  };
  const severity = {
    high: t("High"),
    medium: t("Medium"),
    low: t("Low"),
  };
  const done = ALERTS.filter((a) => right(a, answers[a.id])).length;
  return (
    <div className="nl-card cb-card">
      <ol className="tr-queue">
        {ALERTS.map((a) => {
          const v = answers[a.id];
          return (
            <li key={a.id} className="tr-alert">
              <fieldset>
                <legend>
                  <span className={`tr-sev tr-${a.severity}`}>
                    {severity[a.severity]}
                  </span>{" "}
                  <code>{a.rule}</code>
                </legend>
                <p className="tr-title">{text(a.title)}</p>
                <ul className="tr-context">
                  {a.context.map((c, i) => (
                    <li key={i}>{text(c)}</li>
                  ))}
                </ul>
                <div className="br-modes">
                  {VERDICTS.map((option) => (
                    <label
                      key={option}
                      className={`br-mode${v === option ? " on" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`tr-${a.id}`}
                        checked={v === option}
                        onChange={() => {
                          const next = { ...answers, [a.id]: option };
                          setAnswers(next);
                          onSolved(allRight(next));
                        }}
                      />
                      {label[option]}
                    </label>
                  ))}
                </div>
                {v && (
                  <p
                    className={right(a, v) ? "nl-pass" : "nl-fail"}
                    aria-live="polite"
                  >
                    {right(a, v)
                      ? text(a.why)
                      : t("Not quite — read the context again.")}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: done, total: ALERTS.length })}
      </p>
      {allRight(answers) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Queue cleared: two incidents escalated, two harmless alerts closed, one stale rule sent for tuning.",
          )}
        </p>
      )}
    </div>
  );
}
