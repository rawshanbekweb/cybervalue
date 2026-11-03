"use client";

import { useState } from "react";
import { Siren, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/reporting/curriculum";
import { DETAILS, reportRight } from "@/lib/reporting/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Reporting incidents: pick what belongs in a first
// report.
export function Reporting() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("HUMAN · MODULE 4")}
      title={t("Reporting incidents.")}
      subtitle={t("Fast, through a known route, factual and blameless.")}
      description={t(
        "Learn what counts as an incident and why the first hour matters, know whom to tell and how, pick what belongs in a first report, keep the evidence, build a blameless culture and write a one-page reporting procedure.",
      )}
      badge={t("REPORT / LAB")}
      icon={<Siren size={22} />}
      checkpoints={["reporting-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "report":
            return <ReportWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight items; tick what belongs in the first report. */
function ReportWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = reportRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(reportRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {DETAILS.map((detail, i) => (
          <li key={i} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Item {n} belongs in the report", { n: i + 1 })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <span className="sc-code">{text(detail.text)}</span>
            </label>
            {solved && (
              <span className={detail.belongs ? "sd-ok" : "sd-bad"}>
                {text(detail.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Five belong: what, when, which device and account, the email itself and what you already did. Never your password, blame or unrelated data.",
          )}
        </p>
      )}
    </div>
  );
}
