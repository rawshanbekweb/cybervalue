"use client";

import { useState } from "react";
import { Megaphone, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/awareness/curriculum";
import { PLAN, planRight } from "@/lib/awareness/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Awareness programmes: find the four plan choices
// that backfire.
export function Awareness() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("HUMAN · MODULE 3")}
      title={t("Awareness programmes.")}
      subtitle={t("Short, regular, blameless — and measured by reports.")}
      description={t(
        "Learn why awareness matters, pick topics by risk, review an awareness plan for four choices that backfire, run fair phishing simulations, measure reporting rather than clicks, keep sessions short and build a blameless culture.",
      )}
      badge={t("AWARENESS / LAB")}
      icon={<Megaphone size={22} />}
      checkpoints={["awareness-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "plan":
            return <PlanWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight plan choices; tick the ones that backfire. */
function PlanWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = planRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(planRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {PLAN.map((choice, i) => (
          <li key={i} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Choice {n} backfires", { n: i + 1 })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <span className="sc-code">{text(choice.text)}</span>
            </label>
            {solved && (
              <span className={choice.backfires ? "sd-bad" : "sd-ok"}>
                {text(choice.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four backfire: shaming people, counting only clicks, one long lecture a year and a frightening simulation theme.",
          )}
        </p>
      )}
    </div>
  );
}
