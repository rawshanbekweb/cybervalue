"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, FileText, Skull, X } from "lucide-react";
import { useT } from "../network-lab/use-t";
import {
  AnimLab,
  CommonWidgetView,
  type WidgetProps,
} from "../anim-lab/AnimLab";
import { LESSONS, PROGRESS_KEY, type Widget } from "@/lib/report/curriculum";
import {
  DRAFT,
  findingSolved,
  outlineSolved,
  PARTS,
  PIECES,
  SECTIONS,
  type Part,
} from "@/lib/report/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../untrusted-input/untrusted-input.css";
import "../browser-risks/browser-risks.css";
import "../access-control/access-control.css";
import "../firewall/firewall.css";
import "../evidence/evidence.css";
import "../response/response.css";
import "./report.css";

// Academy Intermediate · Writing the report: the order of sections and one
// finding that holds up.
export function Report() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("DIGITAL FORENSICS · MODULE 5")}
      title={t("Writing the report.")}
      subtitle={t("An investigation nobody can follow didn’t happen.")}
      description={t(
        "Give every reader the section they need, put a report in order, tell fact from opinion, build a finding with evidence and impact but no guesses or secrets, write recommendations people can act on, and hand the report over safely.",
      )}
      badge={t("REPORT / LAB")}
      icon={<FileText size={22} />}
      checkpoints={["report-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "outline":
            return <OutlineWidget {...props} />;
          case "finding":
            return <FindingWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** Reorder the draft's sections. */
function OutlineWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [order, setOrder] = useState(DRAFT);
  const solved = outlineSolved(order);
  const move = (i: number, by: -1 | 1) => {
    const next = [...order];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    setOrder(next);
    onSolved(outlineSolved(next));
  };
  return (
    <div className="nl-card cb-card">
      <ol className="fw-rules" aria-label={t("Sections of the report")}>
        {order.map((id, i) => {
          const s = SECTIONS.find((x) => x.id === id)!;
          return (
            <li key={id} className="fw-rule ir-item">
              <span className="fw-id">{i + 1}</span>
              <span className="ir-what">
                <strong>{text(s.title)}</strong>
                <small>{text(s.what)}</small>
              </span>
              <span className="fw-move">
                <button
                  type="button"
                  disabled={i === 0}
                  aria-label={t("Move section {n} up", { n: i + 1 })}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={i === order.length - 1}
                  aria-label={t("Move section {n} down", { n: i + 1 })}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <p className={solved ? "nl-pass" : "nl-fail"} aria-live="polite">
        {solved ? (
          <>
            <Check size={15} aria-hidden="true" />{" "}
            {t("The answer first, the reference material last.")}
          </>
        ) : (
          <>
            <X size={15} aria-hidden="true" />{" "}
            {t("A reader who stops early would miss the main point.")}
          </>
        )}
      </p>
    </div>
  );
}

/** Pick the pieces of one finding and read it back. */
function FindingWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<Part[]>([]);
  const label: Record<Part, string> = {
    what: t("What happened, with the time in UTC"),
    evidence: t("Where the evidence is"),
    impact: t("The impact in plain words"),
    fix: t("A recommendation with an owner and a date"),
    guess: t("Who the attacker probably is"),
    secret: t("The password the attacker guessed"),
  };
  const shown = PARTS.filter((p) => picked.includes(p));
  return (
    <div className="nl-card cb-card">
      <fieldset className="ev-steps">
        <legend>{t("Finding F-01: what goes in?")}</legend>
        {PARTS.map((p) => (
          <label key={p} className="ui-switch">
            <input
              type="checkbox"
              checked={picked.includes(p)}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...picked, p]
                  : picked.filter((x) => x !== p);
                setPicked(next);
                onSolved(findingSolved(next));
              }}
            />
            {label[p]}
          </label>
        ))}
      </fieldset>
      <article className="rp-finding" aria-live="polite">
        <h4>{t("F-01 · Root login with a guessed password")}</h4>
        {shown.length === 0 ? (
          <p className="rp-empty">{t("(empty so far)")}</p>
        ) : (
          shown.map((p) => (
            <p key={p} className={PIECES[p].good ? "" : "rp-bad"}>
              <span className="rp-text">{text(PIECES[p].text)}</span>
              <small>
                {PIECES[p].good ? (
                  <Check size={13} aria-hidden="true" />
                ) : (
                  <Skull size={13} aria-hidden="true" />
                )}{" "}
                {text(PIECES[p].why)}
              </small>
            </p>
          ))
        )}
      </article>
      <p className={findingSolved(picked) ? "nl-pass" : "cb-out"}>
        {findingSolved(picked)
          ? t("Checkable, clear and safe to pass around.")
          : t("Not yet: something is missing, or something should come out.")}
      </p>
    </div>
  );
}
