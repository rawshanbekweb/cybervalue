"use client";

import { useState } from "react";
import { Paperclip, ShieldCheck } from "lucide-react";
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
} from "@/lib/attachments/curriculum";
import { ATTACHMENTS, attachmentsRight } from "@/lib/attachments/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "../supplychain/supplychain.css";

// Academy Intermediate · Opening attachments safely: find the four files
// not to open.
export function Attachments() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("SOFTWARE · MODULE 5")}
      title={t("Opening attachments safely.")}
      subtitle={t("Expected? From whom? What kind of file?")}
      description={t(
        "Tell data files from runnable ones, see through double extensions and fake icons, refuse macros that ask to be enabled, judge eight attachments, spot password archives and disk images, open files read-only and rely on layers of defence.",
      )}
      badge={t("FILES / LAB")}
      icon={<Paperclip size={22} />}
      checkpoints={["attachments-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "attachments":
            return <AttachmentsWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Eight attachments; tick the ones not to open. */
function AttachmentsWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = attachmentsRight(picked);
  const toggle = (i: number, on: boolean) => {
    const next = on ? [...picked, i] : picked.filter((n) => n !== i);
    setPicked(next);
    onSolved(attachmentsRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {ATTACHMENTS.map((file, i) => (
          <li key={i} className="sc-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Don’t open {name}", { name: file.name })}
                checked={picked.includes(i)}
                onChange={(e) => toggle(i, e.target.checked)}
              />{" "}
              <code className="sc-code">{file.name}</code>
            </label>
            <span>{text(file.from)}</span>
            {solved && (
              <span className={file.risky ? "sd-bad" : "sd-ok"}>
                {text(file.why)}
              </span>
            )}
          </li>
        ))}
      </ol>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "Four not to open: a program hiding behind .pdf.exe, a macro document asking to be enabled, a password archive from a stranger and a shortcut inside a disk image.",
          )}
        </p>
      )}
    </div>
  );
}
