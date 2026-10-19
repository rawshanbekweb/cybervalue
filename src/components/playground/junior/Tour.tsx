"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "../network-lab/use-t";
import { useJuniorState } from "./state";

// The first-visit tour: four short steps on how the academy works, shown once
// per member and remembered on their account.
const STEPS = [
  {
    title: "Missions in three steps",
    body: "Six missions teach the basics, reading clues and thinking like a pro. Finish both missions of a step to open the next one.",
    href: "/junior",
  },
  {
    title: "The Cipher Room",
    body: "Ten historic ciphers with a workbench to try each one. Read the story, then encrypt and decrypt yourself.",
    href: "/junior/ciphers",
  },
  {
    title: "Homework and the daily puzzle",
    body: "Exercises earn XP and open harder cipher levels. A new puzzle waits every day; solve it on consecutive days to build a streak.",
    href: "/junior/homework",
  },
  {
    title: "Your agent card",
    body: "XP raises your rank and earns badges. Pick a codename: classmates see it instead of your name.",
    href: "/junior/achievements",
  },
] as const;

export function JuniorTour() {
  const { t } = useT();
  const { agent, finishTour } = useJuniorState();
  const [step, setStep] = useState(0);
  if (agent.tour) return null;
  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  return (
    <section className="jr-tour" aria-labelledby="jr-tour-title">
      <span className="eyebrow">
        {t("Step {n} of {total}", { n: step + 1, total: STEPS.length })}
      </span>
      <h2 id="jr-tour-title">{t(current.title)}</h2>
      <p>{t(current.body)}</p>
      <div className="jr-tour-actions">
        {last ? (
          <button
            type="button"
            className="button button-primary"
            onClick={finishTour}
          >
            {t("Start")}
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary"
            onClick={() => setStep(step + 1)}
          >
            {t("Next")}
          </button>
        )}
        {current.href !== "/junior" && (
          <Link href={current.href} className="jr-linkbtn">
            {t("Open")}
          </Link>
        )}
        {!last && (
          <button type="button" className="jr-linkbtn" onClick={finishTour}>
            {t("Skip the tour")}
          </button>
        )}
      </div>
    </section>
  );
}
