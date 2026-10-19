"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  BookOpen,
  KeyRound,
  Lightbulb,
  Lock,
  LockOpen,
  Sparkles,
} from "lucide-react";
import { useT } from "../playground/network-lab/use-t";
import {
  GAMES,
  missionKey,
  stageOf,
  stageOpen,
  type Mission,
} from "@/lib/kids/games";
import {
  CHESTS,
  cipherSolved,
  parseCipher,
  runCipher,
} from "@/lib/kids/cipher";
import { kidsLevel } from "@/lib/kids/progress";
import { saveKidsAction } from "@/app/[lang]/kids/actions";
import { CodeEditor } from "./code-editor";
import { PuzzleLevels } from "./puzzle-levels";
import "./kids.css";

const game = GAMES.shifr;
const chestOf = (m: Mission) =>
  m.check.kind === "cipher" ? CHESTS[m.check.chest] : CHESTS.c1;

// The cipher lab: each chest holds an encrypted clue. The child writes a
// decoding program and sees the text after every step as they type; a chest
// opens when the result is the clue, checked again on the server.
export function CipherLab({
  initialDone,
  initialXp,
}: {
  initialDone: string[];
  initialXp: number;
}) {
  const { t, text } = useT();
  const [done, setDone] = useState(initialDone);
  const [xp, setXp] = useState(initialXp);
  const known = useMemo(() => new Set(done), [done]);
  const missions = game.missions.map((m) => ({
    ...m,
    done: known.has(missionKey(game.id, m.id)),
    open: stageOpen(game, stageOf(m), known),
  }));
  const first = missions.find((m) => m.open && !m.done) ?? missions[0];
  const [selected, setSelected] = useState(first.id);
  const mission = missions.find((m) => m.id === selected) ?? first;
  const chest = chestOf(mission);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [hint, setHint] = useState(false);
  const [tried, setTried] = useState<"wrong" | null>(null);
  const [, startSaving] = useTransition();
  const draft = drafts[selected] ?? "";
  // Cheap enough to redo on every keystroke.
  const program = parseCipher(draft);
  const trace = runCipher(program.steps, chest.cipher);
  const lvl = kidsLevel(xp);

  function choose(id: string) {
    setSelected(id);
    setHint(false);
    setTried(null);
  }

  function open() {
    if (!cipherSolved(draft, chest) || !mission.open) {
      setTried("wrong");
      return;
    }
    setTried(null);
    const key = missionKey(game.id, mission.id);
    if (known.has(key)) return;
    setDone((list) => [...new Set([...list, key])]);
    setXp((value) => value + mission.xp);
    startSaving(async () => {
      const saved = await saveKidsAction({
        game: game.id,
        mission: mission.id,
        code: draft,
      });
      if (saved.ok && saved.done) {
        setDone(saved.done);
        if (typeof saved.xp === "number") setXp(saved.xp);
      }
    });
  }

  const readable = trace.result === chest.plain;

  return (
    <div className="kids container">
      <div className="kids-lab-top">
        <Link className="kids-back" href="/kids">
          <ArrowLeft size={16} aria-hidden="true" /> {t("All games")}
        </Link>
        <p className="kids-level-chip">
          <Sparkles size={16} aria-hidden="true" /> {text(lvl.level.title)} ·{" "}
          {xp} XP
        </p>
      </div>
      <header className="kids-lab-head">
        <h1>{text(game.title)}</h1>
        <p>{text(game.tagline)}</p>
      </header>

      <ol className="kids-chests" aria-label={t("Treasure map")}>
        {missions.map((m, i) => (
          <li
            key={m.id}
            className={`${m.done ? "done" : ""} ${m.id === selected ? "now" : ""}`}
          >
            {m.done ? (
              <LockOpen size={18} aria-hidden="true" />
            ) : (
              <Lock size={18} aria-hidden="true" />
            )}
            <span className="visually-hidden">
              {text(m.title)}: {m.done ? t("Done") : t("Locked")}
            </span>
            <span aria-hidden="true">{i + 1}</span>
          </li>
        ))}
      </ol>

      <div className="kids-lab">
        <section className="kids-stage" aria-labelledby="chest-title">
          <div className="kids-maze-head">
            <h2 id="chest-title">
              <KeyRound size={18} aria-hidden="true" /> {text(mission.title)}
            </h2>
            <p>{text(mission.task)}</p>
          </div>
          <p className="kids-eyebrow">{t("Encrypted letter")}</p>
          <p className="kids-cipher-text">{chest.cipher}</p>
          {trace.after.length > 0 && (
            <ol className="kids-cipher-steps" aria-label={t("After each step")}>
              {trace.after.map((step, i) => (
                <li key={i}>
                  <span className="kids-muted">
                    {t("Line {line}", { line: step.line })}
                  </span>
                  <code>{step.text}</code>
                </li>
              ))}
            </ol>
          )}
          {trace.tries.length > 0 && (
            <div className="kids-cipher-tries">
              <p className="kids-eyebrow">{t("Every shift")}</p>
              <ol tabIndex={0} aria-label={t("Every shift")}>
                {trace.tries.map((row) => (
                  <li key={row.n}>
                    <span className="kids-muted">sur({row.n})</span>{" "}
                    <code>{row.text}</code>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <p
            className={`kids-maze-result ${readable ? "ok" : ""}`}
            role="status"
          >
            {readable
              ? t("It reads! Press “Open the chest”.")
              : tried
                ? t("Not yet: the result is not the clue. Check every step.")
                : t("Result: {text}", { text: trace.result })}
          </p>
        </section>

        <section className="kids-code" aria-labelledby="kids-code-title">
          <div className="kids-panel-head">
            <h2 id="kids-code-title">{t("Decoding program")}</h2>
            <span>
              {t("One step per line; the result changes as you type")}
            </span>
          </div>
          <CodeEditor
            label={t("Decoding program")}
            value={draft}
            onChange={(value) => {
              setDrafts((all) => ({ ...all, [selected]: value }));
              setTried(null);
            }}
            onRun={open}
            bad={new Set(program.problems.map((p) => p.line))}
          />
          {program.problems.length > 0 && (
            <ul className="kids-problems" role="status">
              {program.problems.slice(0, 4).map((p) => (
                <li key={`${p.line}-${p.message.en}`}>
                  <strong>{t("Line {line}", { line: p.line })}</strong>{" "}
                  {text(p.message)}
                </li>
              ))}
            </ul>
          )}
          <div className="kids-code-actions">
            <button
              type="button"
              className="kids-button"
              onClick={open}
              disabled={!mission.open}
            >
              <LockOpen size={18} aria-hidden="true" /> {t("Open the chest")}
            </button>
          </div>
          {hint ? (
            <p className="kids-hint">
              <Lightbulb size={16} aria-hidden="true" /> {text(mission.hint)}
            </p>
          ) : (
            <button
              type="button"
              className="kids-link"
              onClick={() => setHint(true)}
            >
              <Lightbulb size={16} aria-hidden="true" /> {t("Show a hint")}
            </button>
          )}
          <details className="kids-guide">
            <summary>
              <BookOpen size={16} aria-hidden="true" /> {t("Code guide")}
            </summary>
            <pre>{`sur(3)          // ${t("shift letters back")}
teskari()       // ${t("reverse the text")}
atbash()        // A↔Z, B↔Y …
kalit("KOD")    // ${t("undo a key cipher")}
sinab_kor()     // ${t("try every shift")}`}</pre>
          </details>
        </section>

        <PuzzleLevels
          game={game}
          missions={missions}
          known={known}
          selected={selected}
          onChoose={choose}
          stages={CIPHER_STAGES}
          lessons={CIPHER_LESSONS}
        />
      </div>
    </div>
  );
}

const CIPHER_STAGES = [
  { uz: "Sezar va ko‘zgu", en: "Caesar and mirror" },
  { uz: "Bir nechta qulf", en: "Several locks" },
  { uz: "Kalitli shifrlar", en: "Ciphers with a key" },
];

const CIPHER_LESSONS = [
  {
    uz: "Sezar shifrida atigi 25 xil kalit bor, siz ularning hammasini bir zumda sinab ko‘rdingiz. Buni “brute force” deyishadi. Shuning uchun haqiqiy shifrlarda kalitlar juda ko‘p.",
    en: "Caesar's cipher has only 25 keys, and you tried them all in a moment. That is called brute force, which is why real ciphers have a huge number of keys.",
  },
  {
    uz: "Bir nechta oddiy shifrni ustma-ust qo‘ysangiz ham, ular kuchli shifr bo‘lib qolmaydi. Tartibni bilgan odam ularni bitta-bitta ochadi.",
    en: "Stacking simple ciphers does not make a strong one: anyone who knows the order undoes them one by one.",
  },
  {
    uz: "Kalit so‘z bilan shifrlash ancha mustahkam, lekin kalit sir saqlanishi shart. Bugungi internet ham kalitlar bilan himoyalangan, faqat ular juda uzun!",
    en: "A key word makes a cipher much stronger, but the key has to stay secret. Today's internet is protected by keys too, only very long ones!",
  },
];
