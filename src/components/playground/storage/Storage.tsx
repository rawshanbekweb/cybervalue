"use client";

import { useState } from "react";
import { Database, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/storage/curriculum";
import { BUCKETS, bucketsRight } from "@/lib/storage/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Storage and secrets: find the three buckets that
// expose data they shouldn't.
export function Storage() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("CLOUD · MODULE 3")}
      title={t("Storage and secrets.")}
      subtitle={t("Private by default, encrypted, rotated and restorable.")}
      description={t(
        "Learn how object storage works, find the buckets that leak data, encrypt at rest and in transit, keep secrets out of code and in a secrets manager, rotate keys, and keep versioned backups somewhere else.",
      )}
      badge={t("STORAGE / LAB")}
      icon={<Database size={22} />}
      checkpoints={["storage-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "buckets":
            return <BucketsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Five buckets; tick the ones leaking data. */
function BucketsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<string[]>([]);
  const solved = bucketsRight(picked);
  const toggle = (name: string, on: boolean) => {
    const next = on ? [...picked, name] : picked.filter((n) => n !== name);
    setPicked(next);
    onSolved(bucketsRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {BUCKETS.map((b) => (
          <li key={b.name} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("{name} is leaking data", { name: b.name })}
                checked={picked.includes(b.name)}
                onChange={(e) => toggle(b.name, e.target.checked)}
              />{" "}
              <code className="sc-code">{b.name}</code>
            </label>
            <span>
              {text(b.holds)} · <code>{b.access}</code>
            </span>
            {solved && (
              <span className={b.risky ? "sd-bad" : "sd-ok"}>
                {text(b.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Three buckets leak data: the backups, the logs and the dev export. The website assets are meant to be public.",
          )}
        </p>
      )}
    </div>
  );
}
