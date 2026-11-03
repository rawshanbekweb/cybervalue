"use client";

import { useState } from "react";
import { MailWarning, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import {
  LESSONS,
  PROGRESS_KEY,
  type Widget,
} from "@/lib/manipulation/curriculum";
import { EMAIL, signsRight } from "@/lib/manipulation/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Manipulation tactics: find the five warning signs
// in a phishing email.
export function Manipulation() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("HUMAN · MODULE 1")}
      title={t("Manipulation tactics.")}
      subtitle={t("Stop, check through another channel, report.")}
      description={t(
        "Learn how social engineering works, recognise urgency, authority and fear, find five warning signs in a phishing email, handle phone pretexts, messenger scams, QR codes and strangers at the door, and report quickly without blame.",
      )}
      badge={t("PHISHING / LAB")}
      icon={<MailWarning size={22} />}
      checkpoints={["manipulation-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "signs":
            return <SignsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight parts of an email; tick the warning signs. */
function SignsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = signsRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(signsRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {EMAIL.map((part, i) => (
          <li key={i} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Part {n} is a warning sign", { n: i + 1 })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <span className="sc-code">{text(part.text)}</span>
            </label>
            {solved && (
              <span className={part.sign ? "sd-bad" : "sd-ok"}>
                {text(part.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Five warning signs: a look-alike sender, a deadline, a link to another domain asking for a password, pressure from the director and being told not to check.",
          )}
        </p>
      )}
    </div>
  );
}
