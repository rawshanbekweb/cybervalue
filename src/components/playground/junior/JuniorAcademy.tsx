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
    href: "/playground/junior/ciphers",
    uz: "Shifrlar xonasi",
    en: "The Cipher Room",
    noteUz: "10 ta tarixiy shifr, vizual tushuntirish va uy vazifalari.",
    noteEn: "10 historic ciphers, visual explanations and homework.",
  },
  {
    href: "/playground/html-basics",
    uz: "HTML asoslari",
    en: "HTML foundations",
    noteUz: "Saytlar qanday qurilishini o‘rganing.",
    noteEn: "Learn how websites are built.",
  },
  {
    href: "/playground/linux-basics",
    uz: "Linux laboratoriyasi",
    noteUz: "Brauzerdagi terminalda buyruqlarni sinang.",
    en: "Linux lab",
    noteEn: "Try commands in a browser terminal.",
  },
  {
    href: "/playground/network-basics",
    uz: "IP manzillar laboratoriyasi",
    noteUz: "Internet qanday ulanishini ko‘ring.",
    en: "IP addressing lab",
    noteEn: "See how the internet connects.",
  },
  {
    href: "/playground/ctf",
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
          <span className="status-dot" />{" "}
          {t("1-DARAJA · BIRINCHI QADAM", "LEVEL 1 · FIRST STEP")}
        </span>
        <h1>
          {t("Oltita missiya.", "Six missions.")}{" "}
          <span>{t("Bitta sirli ish.", "One mystery to solve.")}</span>
        </h1>
        <p>
          {t(
            "Har bir missiyada parollar, aldovchilar, shifrlar va internetdagi izlar haqida bitta muhim narsani o‘rganasiz — va Kiber-shtab ishi uchun bitta dalil topasiz. Dasturlashni bilish shart emas.",
            "Each mission teaches one key idea about passwords, scams, ciphers or your online trail — and gives you one piece of evidence for the Cyber HQ case. No coding needed.",
          )}
        </p>
        <div className="jr-progress" role="status">
          <div className="jr-bar" aria-hidden="true">
            <span style={{ width: `${(count / MISSIONS.length) * 100}%` }} />
          </div>
          <span>
            {t(
              `${count} / ${MISSIONS.length} missiya bajarildi`,
              `${count} / ${MISSIONS.length} missions complete`,
            )}
          </span>
        </div>
      </header>

      <nav className="jr-nav" aria-label={t("Missiyalar", "Missions")}>
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
                  <span className="visually-hidden">
                    {" "}
                    {t("(bajarildi)", "(complete)")}
                  </span>
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
            {t(`MISSIYA ${mission.number}`, `MISSION ${mission.number}`)} ·{" "}
            {t(`${mission.minutes} daqiqa`, `${mission.minutes} min`)}
          </span>
          <h2 id="jr-mission-title">{text(mission.title)}</h2>
          <p className="jr-hook">{text(mission.hook)}</p>
          <p className="jr-goal">
            <Compass size={15} aria-hidden="true" />
            <span>
              <strong>{t("Maqsad:", "Goal:")}</strong> {text(mission.goal)}
            </span>
          </p>
          <Narrator
            text={`${text(mission.title)}. ${text(mission.hook)} ${t("Maqsad:", "Goal:")} ${text(mission.goal)}`}
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
            {t("Keyingi missiya", "Next mission")}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        )}
      </section>

      <CaseFile />

      {all ? (
        <section className="jr-finish" aria-labelledby="jr-finish-title">
          <Award size={34} aria-hidden="true" />
          <h2 id="jr-finish-title">
            {t(
              "Tabriklaymiz, kiber-nomzod!",
              "Congratulations, cyber recruit!",
            )}
          </h2>
          <p>
            {t(
              "Siz Cybervalue Academy Junior ning barcha 6 missiyasini bajardingiz. Endi keyingi qadamni tanlang:",
              "You finished all 6 Cybervalue Academy Junior missions. Pick your next step:",
            )}
          </p>
          <ul className="jr-steps">
            {NEXT_STEPS.map((step) => (
              <li key={step.href}>
                <Link href={step.href}>
                  <strong>{t(step.uz, step.en)}</strong>
                  <span>{t(step.noteUz, step.noteEn)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="jr-linkbtn"
            onClick={() => setProgress({})}
          >
            {t("Missiyalarni qaytadan boshlash", "Restart the missions")}
          </button>
        </section>
      ) : null}
      {!all ? (
        <p className="jr-foot">
          {t(
            "Barcha missiyalarni bajargach, keyingi qadamlar ochiladi. Natijangiz shu brauzerda saqlanadi.",
            "Finish every mission to unlock your next steps. Your progress is saved in this browser.",
          )}
        </p>
      ) : null}
    </>
  );
}
