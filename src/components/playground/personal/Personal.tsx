"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/personal/curriculum";
import { HABITS, habitsRight } from "@/lib/personal/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Personal protection: find the four habits that
// need fixing.
export function Personal() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("HUMAN · MODULE 2")}
      title={t("Personal protection.")}
      subtitle={t("A different password everywhere, MFA, updates and backups.")}
      description={t(
        "Use long passphrases and a password manager, turn on MFA and keep recovery codes, review eight habits and fix four, keep devices updated, back up with 3-2-1 and make a personal security plan.",
      )}
      badge={t("SAFETY / LAB")}
      icon={<KeyRound size={22} />}
      checkpoints={["personal-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "habits":
            return <HabitsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight habits; tick the ones to fix. */
function HabitsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = habitsRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(habitsRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {HABITS.map((habit, i) => (
          <li key={i} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Habit {n} needs fixing", { n: i + 1 })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <span className="sc-code">{text(habit.text)}</span>
            </label>
            {solved && (
              <span className={habit.fix ? "sd-bad" : "sd-ok"}>
                {text(habit.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four to fix: a reused password, email without MFA, postponed updates and a factory router password.",
          )}
        </p>
      )}
    </div>
  );
}
