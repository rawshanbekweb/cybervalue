"use client";

import { useState } from "react";
import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/baseline/curriculum";
import { DRIFTED, drifted, driftRight, ROWS } from "@/lib/baseline/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Patching and baselines: compare a server against
// its baseline and tick what has drifted.
export function Baseline() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("SYSSEC · MODULE 5")}
      title={t("Patching and baselines.")}
      subtitle={t("Get secure, then stay secure.")}
      description={t(
        "See why unpatched flaws cause most breaches, put updates in order, automate them and check they took effect, learn what a baseline is, find four drifted settings on a server, keep drift away and measure progress.",
      )}
      badge={t("BASELINE / LAB")}
      icon={<ClipboardCheck size={22} />}
      checkpoints={["baseline-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "drift":
            return <DriftWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** The server beside its baseline; tick the drifted settings. */
function DriftWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<string[]>([]);
  const solved = driftRight(picked);
  const toggle = (s: string, on: boolean) => {
    const next = on ? [...picked, s] : picked.filter((p) => p !== s);
    setPicked(next);
    onSolved(driftRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <div className="sc-table" tabIndex={0}>
        <table className="ui-cases sch-table">
          <thead>
            <tr>
              <th scope="col">{t("Setting")}</th>
              <th scope="col">{t("Baseline")}</th>
              <th scope="col">{t("Current")}</th>
              <th scope="col">{t("Drifted")}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.setting}>
                <th scope="row">
                  <code>{r.setting}</code>
                  {solved && (
                    <small className={drifted(r) ? "sd-bad" : "sd-ok"}>
                      <br />
                      {text(r.fix)}
                    </small>
                  )}
                </th>
                <td>
                  <code>{r.baseline}</code>
                </td>
                <td>
                  <code>{r.current}</code>
                </td>
                <td>
                  <input
                    type="checkbox"
                    aria-label={t("{setting} has drifted", {
                      setting: r.setting,
                    })}
                    checked={picked.includes(r.setting)}
                    onChange={(e) => toggle(r.setting, e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cb-label">{t("Ticked: {n}", { n: picked.length })}</p>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "{n} settings drifted: password logins, the firewall, a reboot that never happened and a missing audit service. Fix them, then find out how each slipped through.",
            { n: DRIFTED.length },
          )}
        </p>
      )}
    </div>
  );
}
