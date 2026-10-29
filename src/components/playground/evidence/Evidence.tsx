"use client";

import { useState } from "react";
import { Check, FingerprintPattern, ShieldCheck, Skull, X } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/evidence/curriculum";
import {
  ACQUIRED,
  admissible,
  brokenLink,
  COPIES,
  CUSTODY,
  intact,
  problems,
  STEPS,
  type Acquisition,
  type Step,
} from "@/lib/evidence/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "./evidence.css";

// Academy Intermediate · Handling evidence: a sound acquisition, copies
// checked against the report's hash, and the chain of custody.
export function Evidence() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("DIGITAL FORENSICS · MODULE 1")}
      title={t("Handling evidence.")}
      subtitle={t("If you can’t prove it didn’t change, it didn’t happen.")}
      description={t(
        "Collect the most volatile evidence first, take a disk image that stands up in court, check copies against the acquisition hash, and find the gap in a chain of custody.",
      )}
      badge={t("DFIR / LAB")}
      icon={<FingerprintPattern size={22} />}
      checkpoints={["evidence-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "acquire":
            return <AcquireWidget {...props} />;
          case "hashes":
            return <HashesWidget {...props} />;
          case "custody":
            return <CustodyWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

function Mark({ ok }: { ok: boolean }) {
  const { t } = useT();
  return ok ? (
    <Check size={14} aria-label={t("As it should be")} />
  ) : (
    <X size={14} aria-label={t("Not as it should be")} />
  );
}

/** The five steps of an acquisition, and what goes wrong without each. */
function AcquireWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [a, setA] = useState<Acquisition>({
    blocker: false,
    hashSource: false,
    bitImage: false,
    hashImage: false,
    workCopy: false,
  });
  const label: Record<Step, string> = {
    blocker: t("Connect the disk through a write blocker"),
    hashSource: t("Hash the original disk (SHA-256)"),
    bitImage: t("Make a bit-for-bit image (dd), not a file copy"),
    hashImage: t("Hash the image and compare it with the original"),
    workCopy: t("Analyse a copy of the image; seal the master"),
  };
  const found = problems(a);
  return (
    <div className="nl-card cb-card">
      <fieldset className="ev-steps">
        <legend>{t("Steps of the acquisition")}</legend>
        {STEPS.map((s) => (
          <label key={s} className="ui-switch">
            <input
              type="checkbox"
              checked={a[s]}
              onChange={(e) => {
                const next = { ...a, [s]: e.target.checked };
                setA(next);
                onSolved(admissible(next));
              }}
            />
            {label[s]}
          </label>
        ))}
      </fieldset>
      <div
        aria-live="polite"
        className={`ac-reply ${found.length === 0 ? "ok" : "bad"}`}
      >
        {found.length === 0 ? (
          <p className="nl-pass">
            <ShieldCheck size={15} aria-hidden="true" />{" "}
            {t(
              "Hashes match and the master is untouched: the image stands up.",
            )}
          </p>
        ) : (
          <>
            <strong>{t("What the other side will ask about:")}</strong>
            <ul className="ev-problems">
              {found.map((p) => (
                <li key={p.step}>{text(p.why)}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/** Mark each copy intact or altered against the report. */
function HashesWidget({ onSolved }: WidgetProps) {
  const { t } = useT();
  const [marks, setMarks] = useState<Record<string, "ok" | "bad" | undefined>>(
    {},
  );
  const mark = (name: string, m: "ok" | "bad") => {
    const next = { ...marks, [name]: m };
    setMarks(next);
    onSolved(COPIES.every((c) => next[c.name] === (intact(c) ? "ok" : "bad")));
  };
  return (
    <div className="nl-card cb-card">
      <p className="cb-label">{t("SHA-256 in the acquisition report")}</p>
      <code className="ev-hash">{ACQUIRED}</code>
      {COPIES.map((c) => {
        const given = marks[c.name];
        const right = given === (intact(c) ? "ok" : "bad");
        return (
          <fieldset key={c.name} className="ev-copy">
            <legend>
              <code>{c.name}</code>
            </legend>
            <code className="ev-hash">{c.hash}</code>
            <div className="br-modes">
              {(["ok", "bad"] as const).map((m) => (
                <label key={m} className={`br-mode${given === m ? " on" : ""}`}>
                  <input
                    type="radio"
                    name={`ev-${c.name}`}
                    checked={given === m}
                    onChange={() => mark(c.name, m)}
                  />
                  {m === "ok" ? t("Intact") : t("Altered")}
                </label>
              ))}
              {given && <Mark ok={right} />}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

/** Click the entry where the chain of custody breaks. */
function CustodyWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<string | null>(null);
  const broken = brokenLink(CUSTODY);
  return (
    <div className="nl-card cb-card">
      <fieldset className="ev-custody">
        <legend>{t("Custody log, laptop in bag no. 0417")}</legend>
        {CUSTODY.map((e) => (
          <label
            key={e.id}
            className={`ev-entry${picked === e.id ? " on" : ""}`}
          >
            <input
              type="radio"
              name="ev-custody"
              checked={picked === e.id}
              onChange={() => {
                setPicked(e.id);
                onSolved(e.id === broken);
              }}
            />
            <span>
              <strong>{e.when}</strong> · {text(e.from)} → {text(e.to)}
              <small>{text(e.note)}</small>
            </span>
          </label>
        ))}
      </fieldset>
      {picked && (
        <p
          className={picked === broken ? "nl-pass" : "nl-fail"}
          aria-live="polite"
        >
          {picked === broken ? (
            <>
              <ShieldCheck size={15} aria-hidden="true" />{" "}
              {t(
                "Right: the locker gave it to nobody on record, yet Sgt. Aliyeva hands it over. Two days are unaccounted for.",
              )}
            </>
          ) : (
            <>
              <Skull size={15} aria-hidden="true" />{" "}
              {t(
                "This hand-over starts where the one before ended. Look further.",
              )}
            </>
          )}
        </p>
      )}
    </div>
  );
}
