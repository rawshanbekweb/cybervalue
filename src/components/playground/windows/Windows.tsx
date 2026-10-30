"use client";

import { useState } from "react";
import { MonitorCog, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/windows/curriculum";
import {
  ACL,
  aclRight,
  EVENTS,
  eventsRight,
  MEANING_NAMES,
  MEANINGS,
  type Meaning,
  type Picks,
} from "@/lib/windows/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../codereview/codereview.css";

// Academy Intermediate · Windows basics: trim a share's access list, then
// read a night of Security log events.
export function Windows() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("SYSSEC · MODULE 2")}
      title={t("Windows basics.")}
      subtitle={t("Who, what they may touch, and what happened.")}
      description={t(
        "Tell standard from admin work, read NTFS permissions, trim a payroll share’s access list, meet Active Directory and Group Policy, name five Security log events from one suspicious night and switch on Windows’ built-in defences.",
      )}
      badge={t("WINDOWS / LAB")}
      icon={<MonitorCog size={22} />}
      checkpoints={["windows-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "acl":
            return <AclWidget {...props} />;
          case "events":
            return <EventsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** D:\Payroll's ACL; tick the entries that are too much. */
function AclWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<string[]>([]);
  const solved = aclRight(picked);
  const toggle = (who: string, on: boolean) => {
    const next = on ? [...picked, who] : picked.filter((p) => p !== who);
    setPicked(next);
    onSolved(aclRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <p className="cb-out">
        <code>D:\Payroll · {t("Security")}</code>
      </p>
      <ol className="cr-diff">
        {ACL.map((a) => (
          <li key={a.who} className="cr-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("{who} shouldn’t have this", { who: a.who })}
                checked={picked.includes(a.who)}
                onChange={(e) => toggle(a.who, e.target.checked)}
              />
              <code>{a.who}</code>
              <span>{text(a.right)}</span>
            </label>
            {solved && (
              <span className={a.risky ? "sd-bad" : "sd-ok"}>
                {text(a.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="cb-label">{t("Ticked: {n}", { n: picked.length })}</p>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Remove Everyone and Domain Users: now only HR, the system and backups reach the payroll.",
          )}
        </p>
      )}
    </div>
  );
}

/** Five Security log events; give each its meaning. */
function EventsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picks, setPicks] = useState<Picks>({});
  const right = EVENTS.filter((e) => picks[e.id] === e.meaning).length;
  return (
    <div className="nl-card cb-card">
      <p className="cb-out">
        <code>Event Viewer › Windows Logs › Security</code>
      </p>
      <ol className="sc-lines">
        {EVENTS.map((e) => {
          const c = picks[e.id];
          return (
            <li key={e.id} className="sc-line">
              <label className="cb-field">
                <code>
                  {t("Event {id}", { id: e.id })} · {e.line}
                </code>
                <select
                  value={c ?? ""}
                  onChange={(ev) => {
                    const next = {
                      ...picks,
                      [e.id]: ev.target.value as Meaning,
                    };
                    setPicks(next);
                    onSolved(eventsRight(next));
                  }}
                >
                  <option value="">{t("Choose a meaning")}</option>
                  {MEANINGS.map((m) => (
                    <option key={m} value={m}>
                      {text(MEANING_NAMES[m])}
                    </option>
                  ))}
                </select>
              </label>
              {c && (
                <span className={c === e.meaning ? "sd-ok" : "sd-bad"}>
                  {c === e.meaning ? t("That’s it") : t("Not this one")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: EVENTS.length })}
      </p>
      {eventsRight(picks) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "The story: password guessing, an RDP sign-in as the backup account, a new admin account, then the log wiped. Time to respond.",
          )}
        </p>
      )}
    </div>
  );
}
