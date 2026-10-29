"use client";

import { useState } from "react";
import { ScrollText, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/logs/curriculum";
import {
  answersRight,
  AUTH_LOG,
  epochSolved,
  FORMATS,
  grep,
  RAWS,
  readAs,
  type Format,
  type Grep,
} from "@/lib/logs/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "../evidence/evidence.css";
import "./logs.css";

// Academy Intermediate · Logs and artefacts: grep through auth.log and read
// timestamps in the right epoch.
export function Logs() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("DIGITAL FORENSICS · MODULE 3")}
      title={t("Logs and artefacts.")}
      subtitle={t("Who did what, and when.")}
      description={t(
        "Read and grep a Linux auth.log until the break-in and the back door show, sort Windows event IDs and browser and system artefacts, and turn raw epoch numbers into one moment.",
      )}
      badge={t("LOG / LAB")}
      icon={<ScrollText size={22} />}
      checkpoints={["logs-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "grep":
            return <GrepWidget {...props} />;
          case "epoch":
            return <EpochWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** grep over auth.log, then name the attacker and their account. */
function GrepWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [g, setG] = useState<Grep>({
    pattern: "",
    ignoreCase: false,
    invert: false,
  });
  const [ip, setIp] = useState("");
  const [account, setAccount] = useState("");
  const result = grep(g);
  const command = `grep -E${g.ignoreCase ? " -i" : ""}${g.invert ? " -v" : ""} '${g.pattern}' /var/log/auth.log`;
  const answer = (nextIp: string, nextAccount: string) => {
    setIp(nextIp);
    setAccount(nextAccount);
    onSolved(answersRight(nextIp, nextAccount));
  };
  return (
    <div className="nl-card cb-card">
      <label className="cb-field">
        {t("Pattern")}
        <input
          value={g.pattern}
          maxLength={80}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          placeholder="Accepted"
          onChange={(e) => setG({ ...g, pattern: e.target.value })}
        />
      </label>
      <div className="lg-flags">
        <label className="ui-switch">
          <input
            type="checkbox"
            checked={g.ignoreCase}
            onChange={(e) => setG({ ...g, ignoreCase: e.target.checked })}
          />
          {t("-i: ignore case")}
        </label>
        <label className="ui-switch">
          <input
            type="checkbox"
            checked={g.invert}
            onChange={(e) => setG({ ...g, invert: e.target.checked })}
          />
          {t("-v: lines that don’t match")}
        </label>
      </div>
      <p className="cb-out">
        <code>$ {command}</code>
      </p>
      <pre className="al-code lg-out" tabIndex={0} aria-live="polite">
        {result.ok
          ? result.lines.length
            ? result.lines.join("\n")
            : t("(no lines match)")
          : t("grep: that pattern is not a valid regular expression")}
      </pre>
      <p className="cb-label">
        {t("{n} of {total} lines", {
          n: result.lines.length,
          total: AUTH_LOG.length,
        })}
      </p>
      <div className="cb-grid">
        <label className="cb-field">
          {t("The attacker’s IP address")}
          <input
            value={ip}
            maxLength={40}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => answer(e.target.value, account)}
          />
        </label>
        <label className="cb-field">
          {t("The account they created")}
          <input
            value={account}
            maxLength={40}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            onChange={(e) => answer(ip, e.target.value)}
          />
        </label>
      </div>
      {answersRight(ip, account) && (
        <p className="nl-pass">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Guessed root’s password, got in at 07:13:55 and added a second root account. Remove it, rotate every password and turn off password logins.",
          )}
        </p>
      )}
    </div>
  );
}

/** Read each raw number as Unix seconds, Unix milliseconds or WebKit time. */
function EpochWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [picks, setPicks] = useState<Record<string, Format | undefined>>({});
  const label: Record<Format, string> = {
    unixS: t("Unix seconds"),
    unixMs: t("Unix milliseconds"),
    webkit: t("Chrome / WebKit microseconds since 1601"),
  };
  return (
    <div className="nl-card cb-card">
      {RAWS.map((r) => {
        const pick = picks[r.id];
        const read = pick ? readAs(r.value, pick) : null;
        return (
          <fieldset key={r.id} className="ev-copy">
            <legend>
              <code>{r.source}</code>
            </legend>
            <code className="ev-hash lg-raw">{String(r.value)}</code>
            <div className="br-modes">
              {FORMATS.map((f) => (
                <label key={f} className={`br-mode${pick === f ? " on" : ""}`}>
                  <input
                    type="radio"
                    name={`lg-${r.id}`}
                    checked={pick === f}
                    onChange={() => {
                      const next = { ...picks, [r.id]: f };
                      setPicks(next);
                      onSolved(epochSolved(next));
                    }}
                  />
                  {label[f]}
                </label>
              ))}
            </div>
            {pick && (
              <p className="cb-out" aria-live="polite">
                {read
                  ? `${read} (UTC)`
                  : t("Not a possible date in this format.")}
              </p>
            )}
          </fieldset>
        );
      })}
      {epochSolved(picks) && (
        <p className="nl-pass">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "All three say 2026-10-03 02:14:07 UTC: the login, the app and the download agree.",
          )}
        </p>
      )}
    </div>
  );
}
