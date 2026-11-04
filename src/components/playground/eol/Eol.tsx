"use client";

import { useState } from "react";
import { CalendarX, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/eol/curriculum";
import { INVENTORY, inventoryRight } from "@/lib/eol/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · End-of-life software: find the four inventory items
// that no longer get security updates.
export function Eol() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("SOFTWARE · MODULE 4")}
      title={t("End-of-life software.")}
      subtitle={t("Know what you run, and when its fixes stop.")}
      description={t(
        "Learn what end of life means, keep a software inventory, find the four out-of-support items in a company’s list, read LTS and support dates, isolate what you can’t upgrade yet, plan upgrades and keep device firmware current.",
      )}
      badge={t("EOL / LAB")}
      icon={<CalendarX size={22} />}
      checkpoints={["eol-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "inventory":
            return <InventoryWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight inventory items; tick the ones out of support. */
function InventoryWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = inventoryRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(inventoryRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {INVENTORY.map((d, i) => (
          <li key={d.name} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("{name} is out of support", { name: d.name })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <code className="sc-code">{d.name}</code>
            </label>
            <span>
              {text(d.where)} · {text(d.support)}
            </span>
            {solved && (
              <span className={d.eol ? "sd-bad" : "sd-ok"}>{text(d.why)}</span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four are out of support: Windows 7 at reception, PHP 7.4 on the website, the office router’s firmware and Office 2013 in accounting.",
          )}
        </p>
      )}
    </div>
  );
}
