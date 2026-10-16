"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ClipboardCheck,
  Lightbulb,
  Network,
  Shuffle,
} from "lucide-react";
import { useHashLessonId } from "../useHashLessonId";
import { useLocalStorageState } from "../useLocalStorageState";
import {
  LESSONS,
  PROGRESS_KEY,
  restoreProgress,
  type Lesson,
  type Widget,
} from "@/lib/network/curriculum";
import { useT } from "./use-t";
import { DhcpWidget, DnsWidget, NatWidget } from "./origins";
import {
  Ipv6Widget,
  PortsWidget,
  SubnettingWidget,
  TracerouteWidget,
} from "./deeper";
import { HttpWidget, PageLoadWidget } from "./web";
import { nextExercise, random } from "@/lib/network/practice";
import { ClassifyWidget, IpconfigWidget } from "./addresses";
import { BitsWidget, CompareWidget, MaskWidget, RangeWidget } from "./basics";
import { SubnetCalculator } from "./calculator";
import { NetworkWidget } from "./simulator";
import { Checkpoints } from "../checkpoint/Checkpoints";
import "./network-lab.css";

export function NetworkLab() {
  const { t, text } = useT();
  const [id, setId] = useHashLessonId(LESSONS.length);
  const [calculator, setCalculator] = useState(false);
  const [raw, setProgress] = useLocalStorageState<unknown>(PROGRESS_KEY, {});
  const progress = restoreProgress(raw);
  const done = Object.keys(progress).length;
  const lesson = LESSONS[id - 1];
  return (
    <div className="network-lab">
      <Link className="nl-back" href="/akademiya">
        <ArrowLeft size={15} /> {t("Akademiya", "Academy")}
      </Link>
      <header className="nl-hero">
        <div>
          <span className="eyebrow">
            <span className="status-dot" />{" "}
            {t("AMALIY TARMOQ KURSI", "HANDS-ON NETWORKING COURSE")}
          </span>
          <h1>
            {t("IP, mask va gateway.", "IP, mask and gateway.")}
            <br />
            <span>
              {t("Ko‘rib, bosib, tushunib.", "See it, click it, get it.")}
            </span>
          </h1>
          <p>
            {t(
              "Bitlarni o‘z qo‘lingiz bilan yoqing, maskni suring, kompyuterni sozlab ping yuboring va paket qayerda to‘xtaganini ko‘ring.",
              "Flip the bits yourself, slide the mask, configure a computer, send a ping and watch where the packet stops.",
            )}
          </p>
        </div>
        <div className="nl-course-card">
          <div>
            <Network size={22} />
            <strong>NETWORK / LAB</strong>
            <span className="nl-live">{t("Brauzerda", "In your browser")}</span>
          </div>
          <p>
            {LESSONS.length} {t("amaliy dars", "practical lessons")}{" "}
            <span>·</span> {t("subnet kalkulyator", "subnet calculator")}
          </p>
          <label htmlFor="nl-progress">
            {t("O‘zlashtirish", "Your progress")}{" "}
            <strong>
              {done}/{LESSONS.length}
            </strong>
          </label>
          <progress id="nl-progress" value={done} max={LESSONS.length} />
          <small>
            {t(
              "Natijalar shu brauzerda saqlanadi. Qurilmalar orasida sinxronlanmaydi.",
              "Progress is saved in this browser and does not sync across devices.",
            )}
          </small>
        </div>
      </header>
      <div className="nl-layout">
        <aside className="nl-sidebar">
          <div className="nl-sidebar-title">
            <BookOpen size={16} />
            <h2>{t("O‘quv yo‘li", "Learning path")}</h2>
          </div>
          <nav aria-label={t("Tarmoq darslari", "Networking lessons")}>
            {LESSONS.map((item, index) => (
              <div key={item.id}>
                {(index === 0 ||
                  item.group.en !== LESSONS[index - 1].group.en) && (
                  <h3>{text(item.group)}</h3>
                )}
                <a
                  href={`#lesson/${item.id}`}
                  className={!calculator && item.id === id ? "active" : ""}
                  aria-current={
                    !calculator && item.id === id ? "step" : undefined
                  }
                  onClick={() => setCalculator(false)}
                >
                  <span className={progress[item.id] ? "nl-done" : "nl-number"}>
                    {progress[item.id] ? (
                      <Check
                        size={14}
                        aria-label={t("Bajarilgan", "Completed")}
                      />
                    ) : (
                      String(item.id).padStart(2, "0")
                    )}
                  </span>
                  <span>{text(item.title)}</span>
                </a>
              </div>
            ))}
          </nav>
          <button
            className={`nl-tool ${calculator ? "active" : ""}`}
            onClick={() => setCalculator(true)}
          >
            <Calculator size={17} />
            {t("Subnet kalkulyator", "Subnet calculator")}
            <ArrowRight size={15} />
          </button>
          <a className="nl-tool" href="#checkpoints">
            <ClipboardCheck size={17} />
            {t("Nazorat testlari", "Checkpoints")}
            <ArrowRight size={15} />
          </a>
        </aside>
        {calculator ? (
          <SubnetCalculator />
        ) : (
          <Workspace
            key={lesson.id}
            lesson={lesson}
            completed={!!progress[lesson.id]}
            onComplete={() => setProgress({ ...progress, [lesson.id]: true })}
            onNext={() => setId(Math.min(lesson.id + 1, LESSONS.length))}
          />
        )}
      </div>
      <Checkpoints ids={["network-1", "network-2"]} />
    </div>
  );
}

function Workspace({
  lesson,
  completed,
  onComplete,
  onNext,
}: {
  lesson: Lesson;
  completed: boolean;
  onComplete: () => void;
  onNext: () => void;
}) {
  const { t, text } = useT();
  const [widget, setWidget] = useState(lesson.widget);
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<"pass" | "fail" | null>(null);
  // Examples solved in this visit; each example counts once.
  const [score, setScore] = useState({ count: 0, counted: -1 });
  const report = (next: boolean) => {
    setSolved(next);
    setFeedback(null);
  };
  const check = () => {
    setFeedback(solved ? "pass" : "fail");
    if (!solved) return;
    onComplete();
    if (score.counted !== round)
      setScore({ count: score.count + 1, counted: round });
  };
  const practice = nextExercise(lesson.widget, random(0)) !== null;
  const newExample = () => {
    // Seeded so a generated exercise could be replayed; any seed will do here.
    const next = nextExercise(widget, random(Date.now() >>> 0));
    if (!next) return;
    setWidget(next);
    setRound(round + 1);
    setSolved(false);
    setFeedback(null);
  };
  const last = lesson.id === LESSONS.length;
  return (
    <div className="nl-workspace">
      <header className="nl-lesson-header">
        <div>
          <span className="eyebrow">
            {t("DARS", "LESSON")} {String(lesson.id).padStart(2, "0")} /{" "}
            {LESSONS.length} · {lesson.minutes} {t("daqiqa", "min")}
          </span>
          <h2>{text(lesson.title)}</h2>
        </div>
        {completed && (
          <span className="nl-complete-badge">
            <Check size={15} />
            {t("Bajarilgan", "Completed")}
          </span>
        )}
      </header>
      <div className="nl-grid">
        <section
          className="nl-instructions"
          aria-label={t("Dars va topshiriq", "Lesson and task")}
        >
          <p className="nl-intro">{text(lesson.intro)}</p>
          <p className="nl-analogy">
            <Lightbulb size={16} aria-hidden="true" />
            <span>{text(lesson.analogy)}</span>
          </p>
          <details className="nl-theory" open>
            <summary>
              <BookOpen size={16} />
              {t("Avval tushunib oling", "Understand first")}
            </summary>
            <div>
              {lesson.theory.map((paragraph, i) => (
                <p key={i}>{text(paragraph)}</p>
              ))}
              {lesson.widget.type === "classify" && (
                <p>
                  {/* A standalone HTML document needs a full navigation, not the Next router. */}
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  <a
                    className="nl-link"
                    href="/lessons/private-ipv4/index.html"
                  >
                    {t(
                      "Batafsil: Private IPv4 diapazonlari darsi",
                      "More: the private IPv4 ranges lesson",
                    )}
                  </a>
                </p>
              )}
            </div>
          </details>
          <div className="nl-task">
            <span className="eyebrow">{t("TOPSHIRIQ", "TASK")}</span>
            <p>{text(lesson.task)}</p>
            <details className="nl-hint">
              <summary>{t("Yordam kerakmi?", "Need a hint?")}</summary>
              <p>{text(lesson.hint)}</p>
            </details>
            <div className="nl-task-actions">
              <button className="nl-primary nl-check" onClick={check}>
                <Check size={16} />
                {t("Tekshirish", "Check")}
              </button>
              {practice && (
                <button className="nl-ghost" onClick={newExample}>
                  <Shuffle size={15} />
                  {t("Yangi misol", "New example")}
                </button>
              )}
            </div>
            {practice && score.count > 0 && (
              <p className="nl-score">
                {t(
                  `Yechilgan misollar: ${score.count}`,
                  `Examples solved: ${score.count}`,
                )}
              </p>
            )}
            <div aria-live="polite">
              {feedback === "pass" && (
                <p className="nl-pass">
                  {t("To‘g‘ri! Dars bajarildi.", "Correct! Lesson completed.")}
                  {practice &&
                    ` ${t("Yana mashq qilish uchun “Yangi misol”ni bosing.", "Press “New example” to practise more.")}`}
                </p>
              )}
              {feedback === "fail" && (
                <p className="nl-fail">
                  {t(
                    "Hali emas. Vizualga qarang va yordamni oching.",
                    "Not yet. Look at the visual and open the hint.",
                  )}
                </p>
              )}
            </div>
            {(completed || feedback === "pass") && !last && (
              <button className="nl-next" onClick={onNext}>
                {t("Keyingi dars", "Next lesson")}
                <ArrowRight size={16} />
              </button>
            )}
            {(completed || feedback === "pass") && last && (
              <p className="nl-finish">
                {t(
                  "Barcha darslar tugadi. Endi subnet kalkulyatorida o‘z tarmog‘ingizni hisoblab ko‘ring.",
                  "All lessons done. Try your own network in the subnet calculator.",
                )}
              </p>
            )}
          </div>
        </section>
        <section
          className="nl-visual"
          aria-label={t("Interaktiv mashq", "Interactive exercise")}
        >
          <WidgetView
            key={round}
            widget={widget}
            checked={feedback !== null}
            onSolved={report}
          />
        </section>
      </div>
    </div>
  );
}

function WidgetView({
  widget,
  checked,
  onSolved,
}: {
  widget: Widget;
  checked: boolean;
  onSolved: (solved: boolean) => void;
}) {
  switch (widget.type) {
    case "bits":
      return <BitsWidget target={widget.target} onSolved={onSolved} />;
    case "mask":
      return <MaskWidget {...widget} onSolved={onSolved} />;
    case "range":
      return <RangeWidget {...widget} onSolved={onSolved} />;
    case "compare":
      return <CompareWidget {...widget} onSolved={onSolved} />;
    case "network":
      return <NetworkWidget start={widget.start} onSolved={onSolved} />;
    case "classify":
      return (
        <ClassifyWidget
          addresses={widget.addresses}
          checked={checked}
          onSolved={onSolved}
        />
      );
    case "ipconfig":
      return <IpconfigWidget {...widget} onSolved={onSolved} />;
    case "dhcp":
      return <DhcpWidget start={widget.start} onSolved={onSolved} />;
    case "dns":
      return <DnsWidget ask={widget.ask} onSolved={onSolved} />;
    case "nat":
      return <NatWidget {...widget} onSolved={onSolved} />;
    case "subnetting":
      return <SubnettingWidget {...widget} onSolved={onSolved} />;
    case "traceroute":
      return <TracerouteWidget onSolved={onSolved} />;
    case "ports":
      return <PortsWidget onSolved={onSolved} />;
    case "ipv6":
      return <Ipv6Widget address={widget.address} onSolved={onSolved} />;
    case "pageload":
      return (
        <PageLoadWidget questions={widget.questions} onSolved={onSolved} />
      );
    case "http":
      return <HttpWidget onSolved={onSolved} />;
  }
}
