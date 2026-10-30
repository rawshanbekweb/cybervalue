"use client";

import { useState } from "react";
import { Scale, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/ethics/curriculum";
import { ACTIONS, LETTER, scopeRight, type Calls } from "@/lib/ethics/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./ethics.css";

// Academy Intermediate · OSINT ethics and law: check research actions
// against a signed authorisation.
export function Ethics() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("OSINT · MODULE 1")}
      title={t("Ethics and law.")}
      subtitle={t("Public doesn’t mean fair game.")}
      description={t(
        "Tell open sources from stolen or private ones, learn what personal-data and computer-crime law expect, check seven research actions against a signed authorisation, tell passive from active reconnaissance, avoid harm, protect yourself and record findings so they can be checked.",
      )}
      badge={t("OSINT / LAB")}
      icon={<Scale size={22} />}
      checkpoints={["ethics-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) =>
        widget.type === "scope" ? (
          <ScopeWidget {...props} />
        ) : (
          <CommonWidgetView widget={widget} {...props} />
        )
      }
    />
  );
}

/** The authorisation letter, then seven actions to allow or refuse. */
function ScopeWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [calls, setCalls] = useState<Calls>({});
  const call = (id: string, allowed: boolean) => {
    const next = { ...calls, [id]: allowed };
    setCalls(next);
    onSolved(scopeRight(next));
  };
  const right = ACTIONS.filter((a) => calls[a.id] === a.allowed).length;
  return (
    <div className="nl-card cb-card">
      <section className="et-letter" aria-label={t("Authorisation letter")}>
        <p className="et-head">
          {t("Authorisation for an OSINT assessment")} · <b>{LETTER.client}</b>
        </p>
        <p className="cb-label">
          {t("From {from} to {to}, inclusive", {
            from: LETTER.from,
            to: LETTER.to,
          })}
        </p>
        <div className="et-cols">
          <div>
            <p className="et-in">{t("In scope")}</p>
            <ul>
              {LETTER.inScope.map((s) => (
                <li key={s.en}>{text(s)}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="et-out">{t("Out of scope")}</p>
            <ul>
              {LETTER.outOfScope.map((s) => (
                <li key={s.en}>{text(s)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <ol className="et-actions">
        {ACTIONS.map((a) => {
          const c = calls[a.id];
          return (
            <li key={a.id}>
              <fieldset className="et-action">
                <legend>
                  <code>{a.date}</code>
                </legend>
                <p className="et-what">{text(a.what)}</p>
                <div className="br-modes">
                  <label className={`br-mode${c === true ? " on" : ""}`}>
                    <input
                      type="radio"
                      name={`et-${a.id}`}
                      checked={c === true}
                      onChange={() => call(a.id, true)}
                    />
                    {t("Allowed")}
                  </label>
                  <label className={`br-mode${c === false ? " on" : ""}`}>
                    <input
                      type="radio"
                      name={`et-${a.id}`}
                      checked={c === false}
                      onChange={() => call(a.id, false)}
                    />
                    {t("Not allowed")}
                  </label>
                </div>
                {c !== undefined && (
                  <p
                    className={c === a.allowed ? "nl-pass" : "nl-fail"}
                    aria-live="polite"
                  >
                    {c === a.allowed
                      ? text(a.why)
                      : t("Check the target, the method and the date again.")}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: ACTIONS.length })}
      </p>
      {scopeRight(calls) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Three allowed, four refused: one too early, one too personal, one too active and one aimed at the wrong company.",
          )}
        </p>
      )}
    </div>
  );
}
