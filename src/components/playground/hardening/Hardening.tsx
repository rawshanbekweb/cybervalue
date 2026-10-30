"use client";

import { useState } from "react";
import { ServerCog, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/hardening/curriculum";
import {
  ACTION_NAMES,
  ACTIONS,
  ENTRIES,
  permsRight,
  RISKY,
  SERVICES,
  servicesRight,
  type Action,
  type Picks,
} from "@/lib/hardening/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../codereview/codereview.css";

// Academy Intermediate · Linux hardening: find the risky permissions, then
// decide what each listening service should do.
export function Hardening() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("SYSSEC · MODULE 1")}
      title={t("Linux hardening.")}
      subtitle={t("Close every door you don’t use.")}
      description={t(
        "Shrink the attack surface, read permissions and special bits, find three risky entries in an audit listing, keep sudo to least privilege, decide which listening services stay public, harden SSH, and set up updates, a firewall and logs.",
      )}
      badge={t("HARDENING / LAB")}
      icon={<ServerCog size={22} />}
      checkpoints={["hardening-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "perms":
            return <PermsWidget {...props} />;
          case "services":
            return <ServicesWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** An audit listing; tick the risky entries. */
function PermsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<string[]>([]);
  const solved = permsRight(picked);
  const toggle = (path: string, on: boolean) => {
    const next = on ? [...picked, path] : picked.filter((p) => p !== path);
    setPicked(next);
    onSolved(permsRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <p className="cb-out">
        <code>$ ls -l …</code>
      </p>
      <ol className="cr-diff">
        {ENTRIES.map((e) => (
          <li key={e.path} className="cr-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("{path} is risky", { path: e.path })}
                checked={picked.includes(e.path)}
                onChange={(ev) => toggle(e.path, ev.target.checked)}
              />
              <code>
                {e.mode} {e.owner} {e.path}
              </code>
            </label>
            {solved && (
              <span className={e.risky ? "sd-bad" : "sd-ok"}>
                {text(e.why)}
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
            "{n} fixes: chmod 640 /etc/shadow, remove the SUID bit from backup, and chmod 755 the cron script. The SUID on passwd and the sticky bit on /tmp stay.",
            { n: RISKY.length },
          )}
        </p>
      )}
    </div>
  );
}

/** `ss -tlnp` output; choose what each service should do. */
function ServicesWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picks, setPicks] = useState<Picks>({});
  const right = SERVICES.filter((s) => picks[s.name] === s.action).length;
  return (
    <div className="nl-card cb-card">
      <p className="cb-out">
        <code>$ sudo ss -tlnp</code>
      </p>
      <ol className="sc-lines">
        {SERVICES.map((s) => {
          const c = picks[s.name];
          return (
            <li key={s.name} className="sc-line">
              <label className="cb-field">
                <code>
                  {s.listen} · {s.name}
                </code>
                <select
                  value={c ?? ""}
                  onChange={(e) => {
                    const next = {
                      ...picks,
                      [s.name]: e.target.value as Action,
                    };
                    setPicks(next);
                    onSolved(servicesRight(next));
                  }}
                >
                  <option value="">{t("Choose an action")}</option>
                  {ACTIONS.map((a) => (
                    <option key={a} value={a}>
                      {text(ACTION_NAMES[a])}
                    </option>
                  ))}
                </select>
              </label>
              {c && (
                <span className={c === s.action ? "sd-ok" : "sd-bad"}>
                  {c === s.action ? text(s.why) : t("Think again")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: SERVICES.length })}
      </p>
      {servicesRight(picks) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Two public, two on localhost, two off: the internet now sees only the site and SSH.",
          )}
        </p>
      )}
    </div>
  );
}
