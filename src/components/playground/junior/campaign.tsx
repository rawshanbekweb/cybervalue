"use client";

import { useId, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileSearch,
  Lock,
  Printer,
  ShieldAlert,
  Trophy,
  XCircle,
} from "lucide-react";
import { useT } from "../network-lab/use-t";
import { MISSIONS } from "@/lib/junior/content";
import { EVIDENCE, STORY_INTRO, SUSPECTS } from "@/lib/junior/story";
import { BADGES } from "@/lib/junior/badges";
import { CIPHERS } from "@/lib/junior/cipher-content";
import { puzzleFor } from "@/lib/junior/daily";
import { sameAnswer } from "@/lib/junior/ciphers";
import { AGENT_KEY, restoreCodename } from "@/lib/junior/rank";
import { useLocalStorageState } from "../useLocalStorageState";
import { useJuniorState } from "./state";
import { Narrator } from "./Narrator";

// Story campaign --------------------------------------------------------------

export function CaseFile() {
  const { t, text } = useT();
  const { missions, missionCount, missionTotal, story, solveStory } =
    useJuniorState();
  const [accused, setAccused] = useState<string | null>(null);
  const ready = missionCount === missionTotal;
  const wrong = accused
    ? SUSPECTS.find((s) => s.id === accused && !s.culprit)
    : undefined;
  const culprit = SUSPECTS.find((s) => s.culprit)!;
  return (
    <section className="jr-case" aria-labelledby="jr-case-title">
      <div className="jr-case-head">
        <ShieldAlert size={22} aria-hidden="true" />
        <div>
          <h2 id="jr-case-title">
            {t("Kiber-shtab ishi", "The Cyber HQ case")}
          </h2>
          <p>{text(STORY_INTRO)}</p>
          <Narrator text={text(STORY_INTRO)} />
        </div>
      </div>
      <ol className="jr-evidence" aria-label={t("Dalillar", "Evidence")}>
        {MISSIONS.map((mission) => {
          const found = Boolean(missions[mission.id]);
          return (
            <li key={mission.id} className={found ? "found" : undefined}>
              <span className="jr-evidence-num" aria-hidden="true">
                {found ? <FileSearch size={14} /> : <Lock size={13} />}
              </span>
              <span>
                <strong>
                  {t(`Dalil ${mission.number}`, `Evidence ${mission.number}`)}
                </strong>{" "}
                {found
                  ? text(EVIDENCE[mission.id])
                  : t(
                      `«${mission.title.uz}» missiyasini bajaring.`,
                      `Finish “${mission.title.en}”.`,
                    )}
              </span>
            </li>
          );
        })}
      </ol>

      {story ? (
        <p className="jr-verdict jr-ok jr-case-solved" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>
            <strong>{t("Ish yopildi.", "Case closed.")}</strong>{" "}
            {text(culprit.verdict)}
          </span>
        </p>
      ) : ready ? (
        <div className="jr-suspects">
          <h3>{t("Hujumchi kim?", "Who is the attacker?")}</h3>
          <p className="jr-note">
            {t(
              "Har bir dalilni gumonlanuvchilar haqidagi faktlar bilan solishtiring. Bitta xato — butun ishni buzadi!",
              "Compare every piece of evidence with the facts about each suspect. One mistake ruins the case!",
            )}
          </p>
          <ul>
            {SUSPECTS.map((suspect) => (
              <li key={suspect.id}>
                <span className="jr-suspect-face" aria-hidden="true">
                  {suspect.emoji}
                </span>
                <strong>{text(suspect.name)}</strong>
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
                  {t("Aynan u!", "It’s them!")}
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
            `Barcha dalillarni to‘plang (${missionCount}/${missionTotal}) — shundan keyin hujumchini fosh qilasiz.`,
            `Collect all the evidence (${missionCount}/${missionTotal}) — then you can unmask the attacker.`,
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
  const { story, missionCount, missionTotal, rank, xp } = useJuniorState();
  const [agent] = useLocalStorageState<unknown>(AGENT_KEY, {});
  const [name, setName] = useState<string | null>(null);
  const inputId = useId();
  if (!story || missionCount < missionTotal) return null;
  const shown = name ?? restoreCodename(agent);
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
        {t("Sertifikatingiz tayyor!", "Your certificate is ready!")}
      </h2>
      <div className="jr-actions">
        <label htmlFor={inputId} className="jr-label">
          {t("Sertifikatdagi ism:", "Name on the certificate:")}
        </label>
        <input
          id={inputId}
          className="jr-input jr-cert-input"
          value={shown}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="button"
          className="button button-primary"
          onClick={() => window.print()}
        >
          <Printer size={15} aria-hidden="true" /> {t("Chop etish", "Print")}
        </button>
      </div>
      <div className="jr-cert">
        <p className="jr-cert-brand">CYBERVALUE ACADEMY · JUNIOR</p>
        <p className="jr-cert-kicker">{t("SERTIFIKAT", "CERTIFICATE")}</p>
        <p className="jr-cert-name">{shown || "—"}</p>
        <p>
          {t(
            "Cybervalue Academy Junior ning barcha 6 missiyasini bajarib, Kiber-shtab ishini muvaffaqiyatli yopdi.",
            "completed all 6 Cybervalue Academy Junior missions and closed the Cyber HQ case.",
          )}
        </p>
        <p className="jr-cert-rank">
          {t("Unvon:", "Rank:")} <strong>{text(rank.title)}</strong> · {xp} XP
        </p>
        <p className="jr-cert-date">{date}</p>
      </div>
    </section>
  );
}

// Badges -------------------------------------------------------------------------

export function Badges() {
  const { t, text } = useT();
  const state = useJuniorState();
  const earned = BADGES.filter((badge) =>
    badge.earned({
      missions: state.missionCount,
      missionTotal: state.missionTotal,
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
        {t("Yutuqlar", "Achievements")}{" "}
        <span className="jr-badges-count">
          {earned.length}/{BADGES.length}
        </span>
      </h2>
      <ul>
        {BADGES.map((badge) => {
          const on = earned.includes(badge.id);
          return (
            <li key={badge.id} className={on ? "on" : undefined}>
              <span className="jr-badge-icon" aria-hidden="true">
                {on ? badge.emoji : <Lock size={16} />}
              </span>
              <strong>{text(badge.title)}</strong>
              <small>{text(badge.how)}</small>
              <span className="sr-only">
                {on
                  ? t("Olingan", "Earned")
                  : t("Hali olinmagan", "Not yet earned")}
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
  const { today, days, streak, solveDay } = useJuniorState();
  const inputId = useId();
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  if (today === null) return <section className="jr-daily" aria-busy="true" />;
  const puzzle = puzzleFor(today, locale);
  const solved = days.includes(today);
  const ok = sameAnswer(puzzle.format, answer, puzzle.answer);
  const cipher = CIPHERS.find((c) => c.id === puzzle.kind)!;
  return (
    <section className="jr-daily" aria-labelledby="jr-daily-title">
      <h2 id="jr-daily-title">
        <CalendarDays size={18} aria-hidden="true" />{" "}
        {t("Kunlik topishmoq", "Daily puzzle")}
        <span className="jr-daily-streak">
          🔥 {t(`${streak} kun ketma-ket`, `${streak}-day streak`)}
        </span>
      </h2>
      <p className="jr-note">
        {t(
          "Har kuni yangi shifrlangan maqol yoki xavfsizlik maslahati. Yechsangiz +20 XP, ketma-ket kunlar olov yoqadi!",
          "A new encrypted saying or safety tip every day. Solve it for +20 XP; days in a row keep the fire burning!",
        )}
      </p>
      <p className="jr-daily-meta">
        <strong>{text(cipher.title).split(" — ")[0]}</strong>
        {puzzle.key && (
          <span className="cr-ex-key">
            {t("kalit", "key")}: <b>{puzzle.key}</b>
          </span>
        )}
        <a href={`/playground/junior/ciphers#cipher/${cipher.number}`}>
          {t("Asbobni ochish ↗", "Open the tool ↗")}
        </a>
      </p>
      <code className="jr-code">{puzzle.given}</code>
      {solved ? (
        <p className="jr-verdict jr-ok" role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>
            {t(
              `Bugungi topishmoq yechildi: «${puzzle.answer}». Ertaga yangisi!`,
              `Today’s puzzle is solved: “${puzzle.answer}”. A new one tomorrow!`,
            )}
          </span>
        </p>
      ) : (
        <>
          <label htmlFor={inputId} className="jr-label">
            {t("Ochilgan xabar", "The decrypted message")}
          </label>
          <div className="jr-row">
            <input
              id={inputId}
              className="jr-input"
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
                if (ok) solveDay(today);
              }}
            >
              {t("Topishmoqni tekshirish", "Check the puzzle")}
            </button>
          </div>
          {checked && !ok && (
            <p className="jr-verdict jr-bad" role="status">
              <XCircle size={16} aria-hidden="true" />
              <span>
                {t(
                  "Hali emas. Kalitni asbobga kiriting va qayta urining.",
                  "Not yet. Put the key into the tool and try again.",
                )}
              </span>
            </p>
          )}
        </>
      )}
    </section>
  );
}
