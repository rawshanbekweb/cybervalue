"use client";

import { useState } from "react";
import { Check, Siren, X } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/ids/curriculum";
import {
  alerts,
  CONTENT,
  contentMatches,
  contentScore,
  contentSolved,
  peak,
  REQUESTS,
  SOURCES,
  thresholdSolved,
  WINDOWS,
  type ContentRule,
  type Threshold,
} from "@/lib/ids/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./ids.css";

// Academy Intermediate · Intrusion detection: a content rule against
// encoded attacks and a brute-force threshold to tune.
export function Ids() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("NETWORK SECURITY · MODULE 5")}
      title={t("Intrusion detection.")}
      subtitle={t("Catch the attack, not the colleague.")}
      description={t(
        "Read a Suricata rule, make a content match catch encoded path traversal, tune a brute-force threshold for a slow bot, triage alerts, and see why a tiny false-positive rate buries real attacks.",
      )}
      badge={t("IDS / LAB")}
      icon={<Siren size={22} />}
      checkpoints={["ids-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "content":
            return <ContentWidget {...props} />;
          case "threshold":
            return <ThresholdWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

function Mark({ ok }: { ok: boolean }) {
  const { t } = useT();
  return ok ? (
    <Check size={14} aria-label={t("As it should be")} />
  ) : (
    <X size={14} aria-label={t("Not as it should be")} />
  );
}

/** content:"/etc/passwd" with or without http.uri and nocase. */
function ContentWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [rule, setRule] = useState<ContentRule>({
    normalized: false,
    nocase: false,
  });
  const change = (next: ContentRule) => {
    setRule(next);
    onSolved(contentSolved(next));
  };
  const score = contentScore(rule);
  const text = `alert http any any -> $HOME_NET any (msg:"Path traversal"; ${
    rule.normalized ? "http.uri; " : ""
  }content:"${CONTENT}";${rule.nocase ? " nocase;" : ""} sid:1000002;)`;
  return (
    <div className="nl-card cb-card">
      <pre className="al-code id-rule" tabIndex={0}>
        {text}
      </pre>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={rule.normalized}
          onChange={(e) => change({ ...rule, normalized: e.target.checked })}
        />
        {t("Match on the normalized URI (http.uri)")}
      </label>
      <label className="ui-switch">
        <input
          type="checkbox"
          checked={rule.nocase}
          onChange={(e) => change({ ...rule, nocase: e.target.checked })}
        />
        {t("Ignore upper and lower case (nocase)")}
      </label>
      <table className="ui-cases id-cases" aria-live="polite">
        <caption className="cb-label">
          {t("Caught {caught} of {total} attacks, {noise} false alarms", {
            caught: score.caught.length,
            total: score.caught.length + score.missed.length,
            noise: score.noise.length,
          })}
        </caption>
        <tbody>
          {REQUESTS.map((r) => {
            const hit = contentMatches(rule, r.line);
            const ok = hit === r.attack;
            return (
              <tr key={r.line} className={ok ? "ok" : "bad"}>
                <td>
                  <code>{r.line}</code>
                  <small className="id-kind">
                    {r.attack ? t("attack") : t("ordinary request")}
                  </small>
                </td>
                <td>
                  {hit ? t("alert") : t("silent")} <Mark ok={ok} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** count N within S seconds, tracked by source. */
function ThresholdWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [th, setTh] = useState<Threshold>({ count: 3, seconds: 60 });
  const change = (next: Threshold) => {
    setTh(next);
    onSolved(thresholdSolved(next));
  };
  return (
    <div className="nl-card cb-card">
      <pre className="al-code id-rule" tabIndex={0}>
        {`threshold: type both, track by_src, count ${th.count}, seconds ${th.seconds};`}
      </pre>
      <label className="cb-field">
        {t("count: failed logins from one source")} <strong>{th.count}</strong>
        <input
          type="range"
          className="id-range"
          min={1}
          max={20}
          value={th.count}
          onChange={(e) => change({ ...th, count: Number(e.target.value) })}
        />
      </label>
      <fieldset className="br-modes">
        <legend>{t("seconds: the window they must fit in")}</legend>
        {WINDOWS.map((w) => (
          <label key={w} className={`br-mode${th.seconds === w ? " on" : ""}`}>
            <input
              type="radio"
              name="id-window"
              checked={th.seconds === w}
              onChange={() => change({ ...th, seconds: w })}
            />
            {w}
          </label>
        ))}
      </fieldset>
      <table className="ui-cases id-cases" aria-live="polite">
        <thead>
          <tr>
            <th scope="col">{t("Source")}</th>
            <th scope="col">{t("Most in one window")}</th>
            <th scope="col">{t("Alert")}</th>
          </tr>
        </thead>
        <tbody>
          {SOURCES.map((s) => {
            const hit = alerts(th, s);
            const ok = hit === (s.who === "bot");
            return (
              <tr key={s.id} className={ok ? "ok" : "bad"}>
                <td>
                  <code>{s.ip}</code>
                  <small className="id-kind">
                    {s.id === "alice" && t("a colleague, three typos in a row")}
                    {s.id === "bob" &&
                      t("a colleague, four tries over the morning")}
                    {s.id === "bot" && t("a bot, fifty guesses in a minute")}
                    {s.id === "slow" && t("a bot, one guess every 25 seconds")}
                  </small>
                </td>
                <td>{peak(s.times, th.seconds)}</td>
                <td>
                  {hit ? t("alert") : t("silent")} <Mark ok={ok} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
