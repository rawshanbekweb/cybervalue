"use client";

import { useState } from "react";
import { ScrollText, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/hostlogs/curriculum";
import { EVENTS, eventsRight } from "@/lib/hostlogs/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Host logging and monitoring: find the four log
// events that need investigating.
export function HostLogs() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("SYSTEM · MODULE 3")}
      title={t("Host logging and monitoring.")}
      subtitle={t("Log what matters, ship it off the host, alert on the rare.")}
      description={t(
        "Learn where Linux and Windows keep their logs, triage eight events from a server, decide what to log and what never to, ship logs to a central store with one clock, write alerts that matter and watch important files for changes.",
      )}
      badge={t("LOGS / LAB")}
      icon={<ScrollText size={22} />}
      checkpoints={["hostlogs-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "events":
            return <EventsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight log events; tick the ones to investigate. */
function EventsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = eventsRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(eventsRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {EVENTS.map((event, i) => (
          <li key={i} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Event {n} needs investigating", { n: i + 1 })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <code className="sc-code">{event.line}</code>
            </label>
            {solved && (
              <span className={event.suspicious ? "sd-bad" : "sd-ok"}>
                {text(event.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four to investigate: a password-guessing burst, a new root account at night, curl writing to /etc/passwd and a disabled account signing in.",
          )}
        </p>
      )}
    </div>
  );
}
