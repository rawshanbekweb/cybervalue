"use client";

import { useState } from "react";
import { Footprints, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/footprint/curriculum";
import {
  ACTIONS,
  auditRight,
  FINDINGS,
  type Action,
  type Calls,
} from "@/lib/footprint/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./footprint.css";

// Academy Intermediate · Digital footprint: turn OSINT on yourself and decide
// what to hide, secure or keep.
export function Footprint() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("OSINT · MODULE 5")}
      title={t("Digital footprint.")}
      subtitle={t("Turn the method on yourself.")}
      description={t(
        "Tell active from passive traces, see how one username links every account, audit a student’s six public findings and decide what to hide, secure or keep, deal with breaches, fix privacy settings, ask for removal and plan what to do today and this month.",
      )}
      badge={t("SELF / LAB")}
      icon={<Footprints size={22} />}
      checkpoints={["footprint-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) =>
        widget.type === "audit" ? (
          <AuditWidget {...props} />
        ) : (
          <CommonWidgetView widget={widget} {...props} />
        )
      }
    />
  );
}

/** Six findings from a self-audit, each to hide, secure or keep. */
function AuditWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const label: Record<Action, string> = {
    hide: t("Hide or delete"),
    secure: t("Secure the account"),
    keep: t("Keep it"),
  };
  const call = (id: string, a: Action) => {
    const next = { ...calls, [id]: a };
    setCalls(next);
    onSolved(auditRight(next));
  };
  const right = FINDINGS.filter((f) => calls[f.id] === f.action).length;
  return (
    <div className="nl-card cb-card">
      <ol className="fp-findings">
        {FINDINGS.map((f) => {
          const c = calls[f.id];
          return (
            <li key={f.id}>
              <fieldset className="fp-finding">
                <legend>
                  <code>{f.where}</code>
                </legend>
                <p className="fp-what">{text(f.what)}</p>
                <div className="br-modes">
                  {ACTIONS.map((a) => (
                    <label key={a} className={`br-mode${c === a ? " on" : ""}`}>
                      <input
                        type="radio"
                        name={`fp-${f.id}`}
                        checked={c === a}
                        onChange={() => call(f.id, a)}
                      />
                      {label[a]}
                    </label>
                  ))}
                </div>
                {c && (
                  <p
                    className={c === f.action ? "nl-pass" : "nl-fail"}
                    aria-live="polite"
                  >
                    {c === f.action
                      ? text(f.why)
                      : t(
                          "Ask: does this help a stranger find you, trick you or get into your accounts?",
                        )}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: FINDINGS.length })}
      </p>
      {auditRight(calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Two hidden, two secured, two kept. A smaller footprint, not an empty one.",
          )}
        </p>
      )}
    </div>
  );
}
