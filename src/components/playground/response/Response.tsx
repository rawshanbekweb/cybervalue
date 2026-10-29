"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ShieldCheck,
  Siren,
  Skull,
  X,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/response/curriculum";
import {
  containSolved,
  INCIDENTS,
  MOVES,
  OUTCOMES,
  QUEUE,
  severity,
  triageSolved,
  type Move,
} from "@/lib/response/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "../firewall/firewall.css";
import "../evidence/evidence.css";
import "./response.css";

// Academy Intermediate · Incident response: triage by severity and
// containing ransomware.
export function IncidentResponse() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("DIGITAL FORENSICS · MODULE 4")}
      title={t("Incident response.")}
      subtitle={t("Calm, in order, and written down.")}
      description={t(
        "Sort the work of the NIST lifecycle, rank incidents by impact and urgency, contain ransomware without destroying evidence or tipping off the attacker, and run a blameless lessons-learned review.",
      )}
      badge={t("IR / LAB")}
      icon={<Siren size={22} />}
      checkpoints={["response-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "triage":
            return <TriageWidget {...props} />;
          case "contain":
            return <ContainWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Reorder the queue from the most severe incident down. */
function TriageWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [order, setOrder] = useState(QUEUE);
  const solved = triageSolved(order);
  const move = (i: number, by: -1 | 1) => {
    const next = [...order];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    setOrder(next);
    onSolved(triageSolved(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="fw-rules" aria-label={t("Incidents, most severe first")}>
        {order.map((id, i) => {
          const inc = INCIDENTS.find((x) => x.id === id)!;
          return (
            <li key={id} className="fw-rule ir-item">
              <span className="fw-id">{i + 1}</span>
              <span className="ir-what">
                {text(inc.what)}
                <small>
                  {t("impact {impact} × urgency {urgency} = {severity}", {
                    impact: inc.impact,
                    urgency: inc.urgency,
                    severity: severity(inc),
                  })}
                </small>
              </span>
              <span className="fw-move">
                <button
                  type="button"
                  disabled={i === 0}
                  aria-label={t("Move incident {n} up", { n: i + 1 })}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={i === order.length - 1}
                  aria-label={t("Move incident {n} down", { n: i + 1 })}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <p className={solved ? "nl-pass" : "nl-fail"} aria-live="polite">
        {solved ? (
          <>
            <Check size={15} aria-hidden="true" />{" "}
            {t("Ransomware first, the lost encrypted laptop last.")}
          </>
        ) : (
          <>
            <X size={15} aria-hidden="true" />{" "}
            {t(
              "Not by severity yet: the queue is still in the order the reports came in.",
            )}
          </>
        )}
      </p>
    </div>
  );
}

/** Pick the containment moves; see what each one does. */
function ContainWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<Move[]>([]);
  const label: Record<Move, string> = {
    isolate: t("Cut the infected hosts off the network"),
    memory: t("Capture the memory of one infected host"),
    account: t("Disable the compromised domain account"),
    poweroff: t("Power off every computer in the company"),
    reimage: t("Reinstall the infected machines right away"),
    chat: t("Post an update in the company chat"),
  };
  const missing = MOVES.filter((m) => OUTCOMES[m].good && !picked.includes(m));
  return (
    <div className="nl-card cb-card">
      <fieldset className="ev-steps">
        <legend>
          {t("02:30, ransomware on the file server. Your moves:")}
        </legend>
        {MOVES.map((m) => (
          <label key={m} className="ui-switch">
            <input
              type="checkbox"
              checked={picked.includes(m)}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...picked, m]
                  : picked.filter((x) => x !== m);
                setPicked(next);
                onSolved(containSolved(next));
              }}
            />
            {label[m]}
          </label>
        ))}
      </fieldset>
      {picked.length > 0 && (
        <ul className="ir-outcomes" aria-live="polite">
          {MOVES.filter((m) => picked.includes(m)).map((m) => (
            <li key={m} className={OUTCOMES[m].good ? "ok" : "bad"}>
              {OUTCOMES[m].good ? (
                <ShieldCheck size={15} aria-hidden="true" />
              ) : (
                <Skull size={15} aria-hidden="true" />
              )}{" "}
              {text(OUTCOMES[m].why)}
            </li>
          ))}
        </ul>
      )}
      <p className={containSolved(picked) ? "nl-pass" : "cb-out"}>
        {containSolved(picked)
          ? t("Spread stopped, evidence kept, attacker none the wiser.")
          : missing.length > 0
            ? t("{n} more right moves to make.", { n: missing.length })
            : t("Every right move is made, but take back the harmful ones.")}
      </p>
    </div>
  );
}
