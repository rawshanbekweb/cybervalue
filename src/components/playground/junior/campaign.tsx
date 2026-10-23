"use client";

import { useId, useState } from "react";
import {
  BookMarked,
  CalendarDays,
  ChartColumn,
  Cog,
  Crown,
  Fish,
  Flame,
  GraduationCap,
  KeyRound,
  Mail,
  RadioTower,
  Rocket,
  ScanSearch,
  CheckCircle2,
  FileSearch,
  Lock,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  XCircle,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import { CASE_MISSION_IDS, MISSIONS } from "@/lib/junior/content";
import { EVIDENCE, STORY_INTRO, SUSPECTS } from "@/lib/junior/story";
import { BADGES, type BadgeIcon } from "@/lib/junior/badges";
import { CIPHERS } from "@/lib/junior/cipher-content";
import { puzzleFor } from "@/lib/junior/daily";
import { sameAnswer } from "@/lib/junior/ciphers";
import { useJuniorState } from "./state";
import { Narrator } from "./Narrator";

// Story campaign --------------------------------------------------------------

export function CaseFile() {
  const { t, text } = useT();
  const { missions, caseCount, caseTotal, story, solveStory } =
    useJuniorState();
  const [accused, setAccused] = useState<string | null>(null);
  const ready = caseCount === caseTotal;
  const wrong = accused
    ? SUSPECTS.find((s) => s.id === accused && !s.culprit)
    : undefined;
  const culprit = SUSPECTS.find((s) => s.culprit)!;
  return (
    <section className="jr-case" aria-labelledby="jr-case-title">
      <div className="jr-case-head">
        <ShieldAlert size={22} aria-hidden="true" />
        <div>
          <h2 id="jr-case-title">{t("The Cyber HQ case")}</h2>
          <p>{text(STORY_INTRO)}</p>
          <Narrator text={text(STORY_INTRO)} />
        </div>
      </div>
      <ol className="jr-evidence" aria-label={t("Evidence")}>
        {CASE_MISSION_IDS.map((id) => {
          const mission = MISSIONS.find((m) => m.id === id)!;
          const found = Boolean(missions[id]);
          return (
            <li key={id} className={found ? "found" : undefined}>
              <span className="jr-evidence-num" aria-hidden="true">
                {found ? <FileSearch size={14} /> : <Lock size={13} />}
              </span>
              <span>
                <strong>
                  {t("Evidence {number}", { number: mission.number })}
                </strong>{" "}
                {found
                  ? text(EVIDENCE[id])
                  : text({
                      uz: `«${mission.title.uz}» missiyasini bajaring.`,
                      en: `Finish “${mission.title.en}”.`,
                    })}
              </span>
            </li>
          );
        })}
      </ol>

      {story ? (
        <p className="jr-verdict jr-ok jr-case-solved" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>
            <strong>{t("Case closed.")}</strong> {text(culprit.verdict)}
          </span>
        </p>
      ) : ready ? (
        <div className="jr-suspects">
          <h3>{t("Who is the attacker?")}</h3>
          <p className="jr-note">
            {t(
              "Compare every piece of evidence with the facts about each suspect. One mistake ruins the case!",
            )}
          </p>
          <ul>
            {SUSPECTS.map((suspect) => (
              <li key={suspect.id}>
                <span className="jr-ring jr-suspect-face" aria-hidden="true">
                  {suspect.handle
                    .split("_")
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <strong>{text(suspect.name)}</strong>
                <code className="jr-suspect-handle">@{suspect.handle}</code>
                <ul>
                  {suspect.facts.map((fact, i) => (
                    <li key={i}>{text(fact)}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setAccused(suspect.id);
                    if (suspect.culprit) solveStory();
                  }}
                >
                  {t("It’s them!")}
                </button>
              </li>
            ))}
          </ul>
          {wrong && (
            <p className="jr-verdict jr-bad" role="status">
              <XCircle size={16} aria-hidden="true" />
              <span>{text(wrong.verdict)}</span>
            </p>
          )}
        </div>
      ) : (
        <p className="jr-note">
          {t(
            "Collect all the evidence ({missionCount}/{missionTotal}) — then you can unmask the attacker.",
            { missionCount: caseCount, missionTotal: caseTotal },
          )}
        </p>
      )}
    </section>
  );
}

// Certificate ------------------------------------------------------------------

const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

export function Certificate() {
  const { t, text, locale } = useT();
  const { story, caseCount, caseTotal, rank, xp, agent } = useJuniorState();
  const [name, setName] = useState<string | null>(null);
  const inputId = useId();
  if (!story || caseCount < caseTotal) return null;
  const shown = name ?? agent.name;
  // Browsers lack Uzbek month names, so the Uzbek date is built by hand.
  const now = new Date();
  const date =
    locale === "uz"
      ? `${now.getDate()}-${UZ_MONTHS[now.getMonth()]}, ${now.getFullYear()}-yil`
      : new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now);
  return (
    <section className="jr-certwrap" aria-labelledby="jr-cert-title">
      <h2 id="jr-cert-title">
        <Trophy size={20} aria-hidden="true" />{" "}
        {t("Your certificate is ready!")}
      </h2>
      <div className="jr-actions">
        <label htmlFor={inputId} className="jr-label">
          {t("Name on the certificate:")}
        </label>
        <input
          id={inputId}
          className="jr-input jr-plain jr-cert-input"
          value={shown}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="button"
          className="button button-primary"
          onClick={() => window.print()}
        >
          <Printer size={15} aria-hidden="true" /> {t("Print")}
        </button>
      </div>
      <div className="jr-cert">
        <p className="jr-cert-brand">CYBERVALUE ACADEMY · JUNIOR</p>
        <p className="jr-cert-kicker">{t("CERTIFICATE")}</p>
        <p className="jr-cert-name">{shown || "—"}</p>
        <p>
          {t(
            "completed all 6 Cybervalue Academy Junior missions and closed the Cyber HQ case.",
          )}
        </p>
        <p className="jr-cert-rank">
          {t("Rank:")} <strong>{text(rank.title)}</strong> · {xp} XP
        </p>
        <p className="jr-cert-date">{date}</p>
      </div>
    </section>
  );
}

// Badges -------------------------------------------------------------------------

const GLYPHS: Record<BadgeIcon, typeof Rocket> = {
  rocket: Rocket,
  fish: Fish,
  search: ScanSearch,
  cap: GraduationCap,
  scroll: BookMarked,
  chart: ChartColumn,
  cog: Cog,
  radio: RadioTower,
  mail: Mail,
  flame: Flame,
  key: KeyRound,
  crown: Crown,
  shield: ShieldCheck,
};

function BadgeGlyph({ icon }: { icon: BadgeIcon }) {
  const Glyph = GLYPHS[icon];
  return <Glyph size={20} strokeWidth={1.6} />;
}

export function Badges() {
  const { t, text } = useT();
  const state = useJuniorState();
  const earned = BADGES.filter((badge) =>
    badge.earned({
      missions: state.missionCount,
      missionTotal: state.missionTotal,
      done: state.missions,
      phishing: Boolean(state.missions.phishing),
      ciphers: state.ciphers,
      story: state.story,
      events: state.events,
      streak: state.streak,
      rank: state.index,
    }),
  ).map((badge) => badge.id);
  return (
    <section className="jr-badges" aria-labelledby="jr-badges-title">
      <h2 id="jr-badges-title">
        {t("Achievements")}{" "}
        <span className="jr-badges-count">
          {earned.length}/{BADGES.length}
        </span>
      </h2>
      <ul>
        {BADGES.map((badge) => {
          const on = earned.includes(badge.id);
          return (
            <li key={badge.id} className={on ? "on" : undefined}>
              <span className="jr-ring jr-badge-icon" aria-hidden="true">
                <BadgeGlyph icon={badge.icon} />
                {!on && (
                  <span className="jr-badge-lock">
                    <Lock size={10} />
                  </span>
                )}
              </span>
              <strong>{text(badge.title)}</strong>
              <small>{text(badge.how)}</small>
              <span className="visually-hidden">
                {on ? t("Earned") : t("Not yet earned")}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Daily puzzle --------------------------------------------------------------------

export function DailyPuzzle() {
  const { t, text, locale } = useT();
  const { today, days, streak, bestStreak, solveDay } = useJuniorState();
  const inputId = useId();
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  // Reserves the card's height until the date is known, so the exercises
  // below do not jump when it appears.
  if (today === null)
    return <section className="jr-daily jr-daily-wait" aria-busy="true" />;
  const puzzle = puzzleFor(today, locale);
  const solved = days.includes(today);
  const ok = sameAnswer(puzzle.format, answer, puzzle.answer);
  const cipher = CIPHERS.find((c) => c.id === puzzle.kind)!;
  return (
    <section className="jr-daily" aria-labelledby="jr-daily-title">
      <h2 id="jr-daily-title">
        <CalendarDays size={18} aria-hidden="true" /> {t("Daily puzzle")}
        {streak > 0 && (
          <span className="jr-daily-streak">
            <Flame size={13} aria-hidden="true" />{" "}
            {t("{streak}-day streak", { streak })}
            {bestStreak > streak &&
              ` · ${t("best {best}", { best: bestStreak })}`}
          </span>
        )}
      </h2>
      <p className="jr-note">
        {t(
          "A new encrypted saying or safety tip every day. Solve it for +20 XP; days in a row keep the fire burning!",
        )}
      </p>
      <p className="jr-daily-meta">
        <strong>{text(cipher.title).split(" — ")[0]}</strong>
        {puzzle.key && (
          <span className="cr-ex-key">
            {t("key")}: <b>{puzzle.key}</b>
          </span>
        )}
        <a href={`/junior/ciphers#cipher/${cipher.number}`}>
          {t("Open the tool ↗")}
        </a>
      </p>
      <code className="jr-code">{puzzle.given}</code>
      {solved ? (
        <p className="jr-verdict jr-ok" role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>
            {t("Today’s puzzle is solved: “{answer}”. A new one tomorrow!", {
              answer: puzzle.answer,
            })}
          </span>
        </p>
      ) : (
        <>
          <label htmlFor={inputId} className="jr-label">
            {t("The decrypted message")}
          </label>
          <div className="jr-row">
            <input
              id={inputId}
              className="jr-input jr-plain"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                setChecked(false);
              }}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="button button-secondary"
              disabled={!answer}
              onClick={() => {
                setChecked(true);
                if (ok) solveDay(today, answer);
              }}
            >
              {t("Check the puzzle")}
            </button>
          </div>
          {checked && !ok && (
            <p className="jr-verdict jr-bad" role="status">
              <XCircle size={16} aria-hidden="true" />
              <span>
                {t("Not yet. Put the key into the tool and try again.")}
              </span>
            </p>
          )}
        </>
      )}
    </section>
  );
}
