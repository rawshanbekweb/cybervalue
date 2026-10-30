"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/authn/curriculum";
import {
  CANDIDATES,
  check,
  MIN_LENGTH,
  policyRight,
  USERNAME,
  VERDICT_TEXT,
  type Calls,
} from "@/lib/authn/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Authentication: apply a modern password policy to
// six candidates.
export function Authn() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("SYSSEC · MODULE 4")}
      title={t("Authentication.")}
      subtitle={t("Proving who you are, in layers.")}
      description={t(
        "Sort the three factors, follow a modern password policy and apply it to six passwords, store passwords as slow salted hashes, rank MFA methods by phishing resistance, use SSH keys properly and watch sign-ins for spraying and impossible travel.",
      )}
      badge={t("SIGN-IN / LAB")}
      icon={<KeyRound size={22} />}
      checkpoints={["authn-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "policy":
            return <PolicyWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Six passwords for one user; accept or reject each under the policy. */
function PolicyWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const call = (p: string, ok: boolean) => {
    const next = { ...calls, [p]: ok };
    setCalls(next);
    onSolved(policyRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <p className="cb-label">
        {t(
          "Policy: at least {n} characters, not on the breached list, not containing the username “{user}”.",
          { n: MIN_LENGTH, user: USERNAME },
        )}
      </p>
      <ol className="sc-lines">
        {CANDIDATES.map((p, i) => {
          const c = calls[p];
          const verdict = check(p, USERNAME);
          const ok = verdict === "ok";
          return (
            <li key={p} className="sc-line">
              <code className="sc-code">
                {p} <small>({t("{n} characters", { n: [...p].length })})</small>
              </code>
              <fieldset className="sch-choice">
                <legend className="visually-hidden">{p}</legend>
                <label>
                  <input
                    type="radio"
                    name={`pw-${i}`}
                    checked={c === true}
                    onChange={() => call(p, true)}
                  />{" "}
                  {t("Accept")}
                </label>
                <label>
                  <input
                    type="radio"
                    name={`pw-${i}`}
                    checked={c === false}
                    onChange={() => call(p, false)}
                  />{" "}
                  {t("Reject")}
                </label>
              </fieldset>
              {c !== undefined && (
                <span className={c === ok ? "sd-ok" : "sd-bad"}>
                  {c === ok ? text(VERDICT_TEXT[verdict]) : t("Look again")}
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
            "Only the two long phrases pass. Note that neither needs a capital or a digit: length and the breached list do the work.",
          )}
        </p>
      )}
    </div>
  );
}
