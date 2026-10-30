"use client";

import { useState } from "react";
import { Radar, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/detection/curriculum";
import {
  EMPTY,
  EVENTS,
  exe,
  ITEMS,
  matches,
  perfect,
  score,
  sigma,
  type Item,
  type Rule,
} from "@/lib/detection/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./detection.css";

// Academy Intermediate · Detection rules: build a Sigma rule for encoded
// PowerShell and test it against real-looking process events.
export function Detection() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("BLUE TEAM · MODULE 2")}
      title={t("Detection rules.")}
      subtitle={t("Catch the attack, leave normal work alone.")}
      description={t(
        "Sort indicator, behaviour and anomaly rules, read a Sigma rule, build one for encoded PowerShell that catches every attack with no false alarms, set thresholds, tell false positives from misses, climb the pyramid of pain and keep rules tested.",
      )}
      badge={t("SIGMA / LAB")}
      icon={<Radar size={22} />}
      checkpoints={["detection-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) =>
        widget.type === "rule" ? (
          <RuleWidget {...props} />
        ) : (
          <CommonWidgetView widget={widget} {...props} />
        )
      }
    />
  );
}

/** Tick selection items and the filter; see what the rule catches. */
function RuleWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [rule, setRule] = useState<Rule>(EMPTY);
  const s = score(rule);
  const label: Record<Item, string> = {
    image: t("The program is powershell.exe"),
    enc: t("The command line contains “-enc”"),
    office: t("The parent is Word or Excel"),
  };
  const change = (next: Rule) => {
    setRule(next);
    onSolved(perfect(next));
  };
  return (
    <div className="nl-card cb-card">
      <fieldset className="br-directives">
        <legend>selection</legend>
        {ITEMS.map((i) => (
          <label key={i} className={`br-mode${rule[i] ? " on" : ""}`}>
            <input
              type="checkbox"
              checked={rule[i]}
              onChange={(e) => change({ ...rule, [i]: e.target.checked })}
            />
            {label[i]}
          </label>
        ))}
      </fieldset>
      <fieldset className="br-directives">
        <legend>filter</legend>
        <label className={`br-mode${rule.filter ? " on" : ""}`}>
          <input
            type="checkbox"
            checked={rule.filter}
            onChange={(e) => change({ ...rule, filter: e.target.checked })}
          />
          {t("Leave out the IT automation account svc_sccm")}
        </label>
      </fieldset>
      <pre className="al-code dt-yaml" tabIndex={0}>
        {sigma(rule)}
      </pre>
      <ol className="dt-events" aria-live="polite">
        {EVENTS.map((e) => {
          const hit = matches(rule, e);
          const kind = hit ? (e.bad ? "tp" : "fp") : e.bad ? "fn" : "tn";
          const verdict = {
            tp: t("Alert: attack caught"),
            fp: t("Alert: false alarm"),
            fn: t("Silent: attack missed"),
            tn: t("Silent: normal work"),
          }[kind];
          return (
            <li key={e.time} className={`dt-event dt-${kind}`}>
              <span className="dt-head">
                <code>{e.time}</code> <code>{exe(e.parent)}</code> →{" "}
                <code>{exe(e.image)}</code> · <code>{e.user}</code>
              </span>
              <code className="dt-cmd">{e.commandLine}</code>
              <span className="dt-verdict">{verdict}</span>
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Attacks caught: {tp} of 3 · false alarms: {fp}", {
          tp: s.tp,
          fp: s.fp,
        })}
      </p>
      {perfect(rule) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "All three attacks caught and IT left alone. Requiring an Office parent would have missed the two later ones.",
          )}
        </p>
      )}
    </div>
  );
}
