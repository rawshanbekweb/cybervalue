"use client";

import Link from "next/link";
import { ArrowRight, Award, Check, Compass } from "lucide-react";
import { useT } from "../network-lab/use-t";
import { MISSIONS, type MissionId } from "@/lib/junior/content";
import { CaseFile } from "./campaign";
import { Narrator } from "./Narrator";
import { useJuniorState } from "./state";
import {
  CipherMission,
  CtfMission,
  EthicsMission,
  FootprintMission,
  PasswordMission,
  PhishingMission,
} from "./missions";
import { useHashLessonId } from "../useHashLessonId";
import "./junior.css";

const PANELS: Record<
  MissionId,
  (props: { done: boolean; onComplete: () => void }) => React.ReactNode
> = {
  password: PasswordMission,
  phishing: PhishingMission,
  cipher: CipherMission,
  footprint: FootprintMission,
  ctf: CtfMission,
  ethics: EthicsMission,
};

const NEXT_STEPS = [
  {
    href: "/junior/ciphers",
    uz: "Shifrlar xonasi",
    en: "The Cipher Room",
    noteUz: "10 ta tarixiy shifr, vizual tushuntirish va uy vazifalari.",
    noteEn: "10 historic ciphers, visual explanations and homework.",
  },
  {
    href: "/akademiya/html-basics",
    uz: "HTML asoslari",
    en: "HTML foundations",
    noteUz: "Saytlar qanday qurilishini o‘rganing.",
    noteEn: "Learn how websites are built.",
  },
  {
    href: "/akademiya/linux-basics",
    uz: "Linux laboratoriyasi",
    noteUz: "Brauzerdagi terminalda buyruqlarni sinang.",
    en: "Linux lab",
    noteEn: "Try commands in a browser terminal.",
  },
  {
    href: "/akademiya/network-basics",
    uz: "IP manzillar laboratoriyasi",
    noteUz: "Internet qanday ulanishini ko‘ring.",
    en: "IP addressing lab",
    noteEn: "See how the internet connects.",
  },
  {
    href: "/akademiya/ctf",
    uz: "Hikoyali CTF",
    noteUz: "Haqiqiy CTF topshiriqlariga o‘ting.",
    en: "Story CTF",
    noteEn: "Move on to real CTF challenges.",
  },
] as const;

export function JuniorAcademy() {
  const { t, text } = useT();
  const [id, setId] = useHashLessonId(MISSIONS.length, 1, "mission");
  const {
    missions: progress,
    setMissions: setProgress,
    missionCount: count,
  } = useJuniorState();
  const all = count === MISSIONS.length;
  const mission = MISSIONS[id - 1];
  const Panel = PANELS[mission.id];
  const open = (next: number) => {
    setId(next);
    document
      .getElementById("jr-mission")
      ?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const complete = (missionId: MissionId) =>
    setProgress({ ...progress, [missionId]: true });
  return (
    <>
      <header className="jr-hero jr-page-head">
        <span className="eyebrow">
          <span className="status-dot" /> {t("LEVEL 1 · FIRST STEP")}
        </span>
        <h1>
          {t("Six missions.")} <span>{t("One mystery to solve.")}</span>
        </h1>
        <p>
          {t(
            "Each mission teaches one key idea about passwords, scams, ciphers or your online trail — and gives you one piece of evidence for the Cyber HQ case. No coding needed.",
          )}
        </p>
        <div className="jr-progress" role="status">
          <div className="jr-bar" aria-hidden="true">
            <span style={{ width: `${(count / MISSIONS.length) * 100}%` }} />
          </div>
          <span>
            {t("{count} / {length} missions complete", {
              count,
              length: MISSIONS.length,
            })}
          </span>
        </div>
      </header>

      <nav className="jr-nav" aria-label={t("Missions")}>
        {MISSIONS.map((item) => {
          const finished = Boolean(progress[item.id]);
          return (
            <button
              key={item.id}
              type="button"
              className={`jr-tab${item.number === id ? " on" : ""}${finished ? " done" : ""}`}
              aria-current={item.number === id ? "step" : undefined}
              onClick={() => open(item.number)}
            >
              <span className="jr-num">
                {finished ? (
                  <Check size={14} aria-hidden="true" />
                ) : (
                  item.number
                )}
              </span>
              <span>
                {text(item.title)}
                {finished && (
                  <span className="visually-hidden"> {t("(complete)")}</span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      <section
        id="jr-mission"
        className="jr-mission"
        aria-labelledby="jr-mission-title"
        key={mission.id}
      >
        <header>
          <span className="eyebrow">
            {t("MISSION {number}", { number: mission.number })} ·{" "}
            {t("{minutes} min", { minutes: mission.minutes })}
          </span>
          <h2 id="jr-mission-title">{text(mission.title)}</h2>
          <p className="jr-hook">{text(mission.hook)}</p>
          <p className="jr-goal">
            <Compass size={15} aria-hidden="true" />
            <span>
              <strong>{t("Goal:")}</strong> {text(mission.goal)}
            </span>
          </p>
          <Narrator
            text={`${text(mission.title)}. ${text(mission.hook)} ${t("Goal:")} ${text(mission.goal)}`}
          />
        </header>
        <Panel
          done={Boolean(progress[mission.id])}
          onComplete={() => complete(mission.id)}
        />
        {id < MISSIONS.length && (
          <button
            type="button"
            className="jr-next"
            onClick={() => open(id + 1)}
          >
            {t("Next mission")}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        )}
      </section>

      <CaseFile />

      {all ? (
        <section className="jr-finish" aria-labelledby="jr-finish-title">
          <Award size={34} aria-hidden="true" />
          <h2 id="jr-finish-title">{t("Congratulations, cyber recruit!")}</h2>
          <p>
            {t(
              "You finished all 6 Cybervalue Academy Junior missions. Pick your next step:",
            )}
          </p>
          <ul className="jr-steps">
            {NEXT_STEPS.map((step) => (
              <li key={step.href}>
                <Link href={step.href}>
                  <strong>{text({ uz: step.uz, en: step.en })}</strong>
                  <span>{text({ uz: step.noteUz, en: step.noteEn })}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="jr-linkbtn"
            onClick={() => setProgress({})}
          >
            {t("Restart the missions")}
          </button>
        </section>
      ) : null}
      {!all ? (
        <p className="jr-foot">
          {t(
            "Finish every mission to unlock your next steps. Your progress is saved to your account, so you can carry on from any device.",
          )}
        </p>
      ) : null}
    </>
  );
}
