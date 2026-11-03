"use client";

import { useState } from "react";
import { ShieldCheck, UserCog } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/iam/curriculum";
import {
  evaluate,
  POLICY,
  policyRight,
  REQUESTS,
  type Calls,
  type Decision,
} from "@/lib/iam/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · IAM: evaluate six requests against an AWS-style
// policy.
export function Iam() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CLOUD · MODULE 2")}
      title={t("Identity and access.")}
      subtitle={t("Deny by default, allow only what is needed.")}
      description={t(
        "Tell people from workloads, read a policy’s effect, action and resource, evaluate six requests with default deny and explicit deny, write least-privilege policies, prefer roles and temporary keys, lock down the root account and review access regularly.",
      )}
      badge={t("IAM / LAB")}
      icon={<UserCog size={22} />}
      checkpoints={["iam-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "evaluate":
            return <EvaluateWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** The `reporter` policy and six requests; allowed or denied? */
function EvaluateWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const call = (i: number, allowed: boolean) => {
    const next = { ...calls, [i]: allowed };
    setCalls(next);
    onSolved(policyRight(next));
  };
  const reason: Record<Decision, string> = {
    allow: t("Allowed: an Allow statement matches."),
    implicit: t("Denied by default: no statement allows it."),
    explicit: t("Denied: an explicit Deny wins."),
  };
  return (
    <div className="nl-card cb-card">
      <pre className="al-code sc-rules" tabIndex={0}>
        {JSON.stringify(
          {
            Statement: POLICY.map((s) => ({
              Effect: s.effect,
              Action: s.action,
              Resource: s.resource,
            })),
          },
          null,
          2,
        )}
      </pre>
      <ol className="sc-lines">
        {REQUESTS.map((r, i) => {
          const c = calls[i];
          const decision = evaluate(POLICY, r.action, r.resource);
          const allowed = decision === "allow";
          return (
            <li key={i} className="sc-line">
              <code className="sc-code">
                {r.action} → {r.resource}
              </code>
              <fieldset className="sch-choice">
                <legend className="visually-hidden">
                  {r.action} {r.resource}
                </legend>
                <label>
                  <input
                    type="radio"
                    name={`iam-${i}`}
                    checked={c === true}
                    onChange={() => call(i, true)}
                  />{" "}
                  {t("Allowed")}
                </label>
                <label>
                  <input
                    type="radio"
                    name={`iam-${i}`}
                    checked={c === false}
                    onChange={() => call(i, false)}
                  />{" "}
                  {t("Denied")}
                </label>
              </fieldset>
              {c !== undefined && (
                <span className={c === allowed ? "sd-ok" : "sd-bad"}>
                  {c === allowed ? reason[decision] : t("Look again")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {policyRight(calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Two allowed, three denied by default and one stopped by the Deny on salaries — even though an Allow matched it too.",
          )}
        </p>
      )}
    </div>
  );
}
