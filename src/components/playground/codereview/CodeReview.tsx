"use client";

import { useState } from "react";
import { GitPullRequest, ShieldCheck } from "lucide-react";
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
} from "@/lib/codereview/curriculum";
import {
  DIFF,
  FLAGGED,
  LEVEL_NAMES,
  LEVELS,
  RATED,
  ratingRight,
  reviewRight,
  type Level,
  type Ratings,
} from "@/lib/codereview/tools";
import "../http-basics/http-basics.css";
import "../crypto-basics/crypto-basics.css";
import "../securecode/securecode.css";
import "./codereview.css";

// Academy Intermediate · Secure code review: flag the problem lines of a
// pull request, then rate the findings.
export function CodeReview() {
  const { t } = useT();
  return (
    <AnimLab
      lessons={LESSONS}
      progressKey={PROGRESS_KEY}
      eyebrow={t("APPSEC · MODULE 5")}
      title={t("Secure code review.")}
      subtitle={t("A second pair of eyes on every change.")}
      description={t(
        "See what people find that tools miss, review with a short security checklist, flag four problems in a pull request, write comments an author can act on, rate findings by impact and likelihood and decide when to approve.",
      )}
      badge={t("REVIEW / LAB")}
      icon={<GitPullRequest size={22} />}
      checkpoints={["codereview-1"]}
      back={{ href: "/intermediate", label: "Academy Intermediate" }}
      renderWidget={(widget: Widget, props) => {
        switch (widget.type) {
          case "review":
            return <ReviewWidget {...props} />;
          case "rate":
            return <RateWidget {...props} />;
          default:
            return <CommonWidgetView widget={widget} {...props} />;
        }
      }}
    />
  );
}

/** A ten-line diff; tick the lines with a security problem. */
function ReviewWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [picked, setPicked] = useState<number[]>([]);
  const solved = reviewRight(picked);
  const toggle = (no: number, on: boolean) => {
    const next = on ? [...picked, no] : picked.filter((p) => p !== no);
    setPicked(next);
    onSolved(reviewRight(next));
  };
  return (
    <div className="nl-card cb-card">
      <p className="cb-out">
        <code>routes/orders.js</code>
      </p>
      <ol className="cr-diff">
        {DIFF.map((l) => (
          <li key={l.no} className="cr-line">
            <label>
              <input
                type="checkbox"
                aria-label={t("Line {no} has a problem", { no: l.no })}
                checked={picked.includes(l.no)}
                onChange={(e) => toggle(l.no, e.target.checked)}
              />
              <span className="sc-no">{l.no}</span>
              <code>+ {l.code}</code>
            </label>
            {solved && l.issue && (
              <span className="sd-ok">{text(l.issue)}</span>
            )}
          </li>
        ))}
      </ol>
      <p className="cb-label">{t("Lines ticked: {n}", { n: picked.length })}</p>
      {solved && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "{n} problems found: a missing owner check, a year-long session, CORS open to every site and an = that makes everyone admin.",
            { n: FLAGGED.length },
          )}
        </p>
      )}
    </div>
  );
}

/** Four findings; give each a risk level. */
function RateWidget({ onSolved }: WidgetProps) {
  const { t, text } = useT();
  const [ratings, setRatings] = useState<Ratings>({});
  const right = RATED.filter((f) => ratings[f.id] === f.level).length;
  return (
    <div className="nl-card cb-card">
      <ol className="sc-lines">
        {RATED.map((f) => {
          const r = ratings[f.id];
          return (
            <li key={f.id} className="sc-line">
              <label className="cb-field">
                {text(f.text)}
                <select
                  value={r ?? ""}
                  onChange={(e) => {
                    const next = {
                      ...ratings,
                      [f.id]: e.target.value as Level,
                    };
                    setRatings(next);
                    onSolved(ratingRight(next));
                  }}
                >
                  <option value="">{t("Choose a level")}</option>
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {text(LEVEL_NAMES[level])}
                    </option>
                  ))}
                </select>
              </label>
              {r && (
                <span className={r === f.level ? "sd-ok" : "sd-bad"}>
                  {r === f.level ? text(f.why) : t("Weigh it again")}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="cb-label">
        {t("Right calls: {n} of {total}", { n: right, total: RATED.length })}
      </p>
      {ratingRight(ratings) && (
        <p className="nl-pass" aria-live="polite">
          <ShieldCheck size={15} aria-hidden="true" />{" "}
          {t(
            "One of each level: fix the role check today, the owner check next, then the session length; the header can wait for a ticket.",
          )}
        </p>
      )}
    </div>
  );
}
