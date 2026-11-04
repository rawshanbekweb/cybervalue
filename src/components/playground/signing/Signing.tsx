"use client";

import { useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/signing/curriculum";
import { DOWNLOADS, downloadsRight } from "@/lib/signing/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Signed software and updates: find the four
// downloads that should not be installed.
export function Signing() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("SOFTWARE · MODULE 2")}
      title={t("Signed software and updates.")}
      subtitle={t("An official source, a matching hash, the expected signer.")}
      description={t(
        "Learn why origin and integrity matter, check a file’s SHA-256 hash, read a code signature and its signer, judge eight downloads and updates, see how safe updaters work, and why signing alone can’t stop a compromised supplier.",
      )}
      badge={t("SIGNING / LAB")}
      icon={<BadgeCheck size={22} />}
      checkpoints={["signing-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "downloads":
            return <DownloadsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight downloads; tick the ones not to install. */
function DownloadsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = downloadsRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(downloadsRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {DOWNLOADS.map((d, i) => (
          <li key={d.name} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Don’t install {name}", { name: d.name })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <code className="sc-code">{d.name}</code>
            </label>
            <span>
              {text(d.source)} · {text(d.check)}
            </span>
            {solved && (
              <span className={d.unsafe ? "sd-bad" : "sd-ok"}>
                {text(d.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four not to install: an unsigned email attachment, a repackaged installer signed by someone else, a file whose hash doesn’t match and a fake browser update.",
          )}
        </p>
      )}
    </div>
  );
}
