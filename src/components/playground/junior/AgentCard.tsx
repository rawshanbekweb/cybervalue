"use client";

import { useEffect, useId, useState } from "react";
import { Dices, Pencil, ShieldCheck, Sparkles } from "lucide-react";
import { useLocalStorageState } from "../useLocalStorageState";
import { useT } from "../network-lab/use-t";
import {
  AGENT_KEY,
  EXERCISE_XP,
  MISSION_XP,
  RANKS,
  randomCodename,
  rankFor,
  restoreCodename,
} from "@/lib/junior/rank";

type Stored = { name?: unknown; rank?: unknown };

// The agent ID card shared by Junior and the Cipher room: a codename the
// student picks, XP from missions and cipher exercises, and a rank that
// celebrates each step up.
export function AgentCard({
  missions,
  missionTotal,
  exercises,
  exerciseTotal,
}: {
  missions: number;
  missionTotal: number;
  exercises: number;
  exerciseTotal: number;
}) {
  const { t, text, locale } = useT();
  const inputId = useId();
  const [raw, setRaw] = useLocalStorageState<Stored>(AGENT_KEY, {});
  const name = restoreCodename(raw);
  const seenRank =
    typeof raw.rank === "number" && Number.isInteger(raw.rank) ? raw.rank : 0;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const xp = missions * MISSION_XP + exercises * EXERCISE_XP;
  const { index, rank, next, progress } = rankFor(xp);

  // A new rank is announced for a few seconds, then remembered.
  const celebrating = index > seenRank;
  useEffect(() => {
    if (!celebrating) return;
    const id = window.setTimeout(() => setRaw({ ...raw, rank: index }), 6000);
    return () => window.clearTimeout(id);
  }, [celebrating, index, raw, setRaw]);

  const save = (value: string) => {
    setRaw({ ...raw, name: restoreCodename({ name: value }) });
    setEditing(false);
  };

  return (
    <section
      className="jr-agent"
      aria-label={t("Agent guvohnomasi", "Agent ID card")}
      data-rank={index}
    >
      <div className="jr-agent-badge" aria-hidden="true">
        <ShieldCheck size={30} />
        <span>{index + 1}</span>
      </div>
      <div className="jr-agent-body">
        <p className="jr-agent-eyebrow">
          {t("AGENT GUVOHNOMASI", "AGENT ID")} · CYBERVALUE
        </p>
        {editing ? (
          <form
            className="jr-agent-edit"
            onSubmit={(event) => {
              event.preventDefault();
              save(draft);
            }}
          >
            <label htmlFor={inputId} className="sr-only">
              {t("Taxallus", "Codename")}
            </label>
            <input
              id={inputId}
              className="jr-input"
              value={draft}
              maxLength={24}
              placeholder={t("Taxallusingiz", "Your codename")}
              onChange={(event) => setDraft(event.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setDraft(randomCodename(locale, Math.random))}
            >
              <Dices size={15} aria-hidden="true" /> {t("Tasodifiy", "Random")}
            </button>
            <button type="submit" className="button button-primary">
              {t("Saqlash", "Save")}
            </button>
          </form>
        ) : (
          <p className="jr-agent-name">
            <strong>
              {name || t("Taxallus tanlanmagan", "No codename yet")}
            </strong>
            <button
              type="button"
              className="jr-linkbtn"
              onClick={() => {
                setDraft(name || randomCodename(locale, Math.random));
                setEditing(true);
              }}
            >
              <Pencil size={13} aria-hidden="true" />{" "}
              {name
                ? t("O‘zgartirish", "Change")
                : t("Taxallus tanlash", "Pick a codename")}
            </button>
          </p>
        )}
        <p className="jr-agent-rank">
          {t("Unvon:", "Rank:")} <strong>{text(rank.title)}</strong> · {xp} XP
        </p>
        <div
          className="jr-agent-bar"
          role="progressbar"
          aria-label={t("Keyingi unvongacha", "Progress to the next rank")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="jr-agent-meta">
          {next
            ? t(
                `Keyingi unvon «${next.title.uz}» — yana ${next.xp - xp} XP`,
                `Next rank “${next.title.en}” — ${next.xp - xp} XP to go`,
              )
            : t(
                "Eng yuqori unvon! Siz afsonasiz.",
                "Top rank! You are a legend.",
              )}
          <br />
          {t(
            `Missiyalar ${missions}/${missionTotal} · Shifr mashqlari ${exercises}/${exerciseTotal}`,
            `Missions ${missions}/${missionTotal} · Cipher exercises ${exercises}/${exerciseTotal}`,
          )}
        </p>
        <ol className="jr-agent-ladder" aria-label={t("Unvonlar", "Ranks")}>
          {RANKS.map((item, i) => (
            <li key={item.xp} className={i <= index ? "on" : undefined}>
              <span className="sr-only">
                {text(item.title)} ({item.xp} XP)
                {i <= index ? t(" — olingan", " — earned") : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>
      {celebrating && (
        <p className="jr-agent-toast" role="status">
          <Sparkles size={16} aria-hidden="true" />
          {t(`Yangi unvon: ${rank.title.uz}!`, `New rank: ${rank.title.en}!`)}
        </p>
      )}
    </section>
  );
}
