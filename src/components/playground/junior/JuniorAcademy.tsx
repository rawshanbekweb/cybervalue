"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Award, Check, Compass } from "lucide-react";
import { useLocalStorageState } from "../useLocalStorageState";
import { useT } from "../network-lab/use-t";
import { MISSIONS, MISSION_IDS, type MissionId } from "@/lib/junior/content";
import { PROGRESS_KEY, restoreProgress } from "@/lib/junior/logic";
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
  const [raw, setProgress] = useLocalStorageState<unknown>(PROGRESS_KEY, {});
  const progress = restoreProgress(raw, MISSION_IDS);
  const count = Object.keys(progress).length;
  const all = count === MISSIONS.length;
  const mission = MISSIONS[id - 1];
  const Panel = PANELS[mission.id];
  const complete = (missionId: MissionId) =>
    setProgress({ ...progress, [missionId]: true });
  return (
    <div className="junior container page-content">
      <Link className="jr-back" href="/playground">
        <ArrowLeft size={15} aria-hidden="true" />{" "}
        {t("Playground", "Playground")}
      </Link>
      <header className="jr-hero">
        <span className="eyebrow">
          <span className="status-dot" />{" "}
          {t("1-DARAJA · BIRINCHI QADAM", "LEVEL 1 · FIRST STEP")}
        </span>
        <h1>Cybervalue Academy Junior</h1>
        <p>
          {t(
            "Kiberxavfsizlik — bu internetdagi himoyachilar kasbi. Bu yerda siz 6 ta qisqa missiyada parollarni sinaysiz, aldovchilarni fosh qilasiz, shifrlarni ochasiz va birinchi CTF bayrog‘ingizni topasiz. Dasturlashni bilish shart emas.",
            "Cybersecurity is the craft of defending people on the internet. In 6 short missions you will test passwords, expose scammers, break ciphers and capture your first CTF flag. No coding needed.",
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
              onClick={() => setId(item.number)}
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
                  <span className="sr-only">
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
        </header>
        <Panel
          done={Boolean(progress[mission.id])}
          onComplete={() => complete(mission.id)}
        />
        {id < MISSIONS.length && (
          <button
            type="button"
            className="jr-next"
            onClick={() => setId(id + 1)}
          >
            {t("Keyingi missiya", "Next mission")}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        )}
      </section>

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
            {t("Boshidan boshlash", "Start over")}
          </button>
        </section>
      ) : (
        <p className="jr-foot">
          {t(
            "Barcha missiyalarni bajargach, keyingi qadamlar ochiladi. Natijangiz shu brauzerda saqlanadi.",
            "Finish every mission to unlock your next steps. Your progress is saved in this browser.",
          )}
        </p>
      )}
    </div>
  );
}
