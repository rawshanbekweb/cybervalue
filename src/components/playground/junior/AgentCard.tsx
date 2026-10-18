"use client";

import { useEffect, useId, useState } from "react";
import { Dices, Pencil, ShieldCheck, Sparkles } from "lucide-react";
import { useT } from "../network-lab/use-t";
import { RANKS, randomCodename, restoreCodename } from "@/lib/junior/rank";
import { useJuniorState } from "./state";

// The agent ID card shared by Junior and the Cipher room: a codename the
// student picks, XP from missions and cipher exercises, and a rank that
// celebrates each step up.
export function AgentCard() {
  const { t, text, locale } = useT();
  const inputId = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const {
    xp,
    index,
    rank,
    next,
    progress,
    missionCount: missions,
    missionTotal,
    exercises,
    exerciseTotal,
    streak,
    agent,
    setAgent,
  } = useJuniorState();
  const name = agent.name;
  const seenRank = agent.rank;

  // A new rank is announced for a few seconds, then remembered.
  const celebrating = index > seenRank;
  useEffect(() => {
    if (!celebrating) return;
    const id = window.setTimeout(
      () => setAgent({ ...agent, rank: index }),
      6000,
    );
    return () => window.clearTimeout(id);
  }, [celebrating, index, agent, setAgent]);

  const save = (value: string) => {
    setAgent({ ...agent, name: restoreCodename({ name: value }) });
    setEditing(false);
  };

  return (
    <section
      className="jr-agent"
      aria-label={t("Agent ID card")}
      data-rank={index}
    >
      <div className="jr-ring jr-agent-badge" aria-hidden="true">
        <ShieldCheck size={26} strokeWidth={1.6} />
        <span>{index + 1}</span>
      </div>
      <div className="jr-agent-body">
        <p className="jr-agent-eyebrow">{t("AGENT ID")}</p>
        {editing ? (
          <form
            className="jr-agent-edit"
            onSubmit={(event) => {
              event.preventDefault();
              save(draft);
            }}
          >
            <label htmlFor={inputId} className="visually-hidden">
              {t("Codename")}
            </label>
            <input
              id={inputId}
              className="jr-input jr-plain"
              value={draft}
              maxLength={24}
              placeholder={t("Your codename")}
              onChange={(event) => setDraft(event.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setDraft(randomCodename(locale, Math.random))}
            >
              <Dices size={15} aria-hidden="true" /> {t("Random")}
            </button>
            <button type="submit" className="button button-primary">
              {t("Save")}
            </button>
          </form>
        ) : (
          <p className="jr-agent-name">
            <strong>{name || t("No codename yet")}</strong>
            <button
              type="button"
              className="jr-linkbtn"
              onClick={() => {
                setDraft(name || randomCodename(locale, Math.random));
                setEditing(true);
              }}
            >
              <Pencil size={13} aria-hidden="true" />{" "}
              {name ? t("Change") : t("Pick a codename")}
            </button>
          </p>
        )}
        <p className="jr-agent-rank">
          {t("Rank:")} <strong>{text(rank.title)}</strong> · {xp} XP
        </p>
        <div
          className="jr-agent-bar"
          role="progressbar"
          aria-label={t("Progress to the next rank")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="jr-agent-meta">
          {next
            ? text({
                // Non-breaking spaces keep "yana 150 XP" on one line.
                uz: `Keyingi unvon «${next.title.uz}» — yana\u00a0${next.xp - xp}\u00a0XP`,
                en: `Next rank “${next.title.en}” — ${next.xp - xp}\u00a0XP to go`,
              })
            : t("Top rank! You are a legend.")}
          <br />
          {t(
            "Missions {missions}/{missionTotal} · Cipher exercises {exercises}/{exerciseTotal}",
            { missions, missionTotal, exercises, exerciseTotal },
          )}
          {streak > 0 && t(" · {streak}-day streak", { streak })}
        </p>
        <ol className="jr-agent-ladder" aria-label={t("Ranks")}>
          {RANKS.map((item, i) => (
            <li key={item.xp} className={i <= index ? "on" : undefined}>
              <span className="visually-hidden">
                {text(item.title)} ({item.xp} XP)
                {i <= index ? t(" — earned") : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>
      {celebrating && (
        <p className="jr-agent-toast" role="status">
          <Sparkles size={16} aria-hidden="true" />
          {text({
            uz: `Yangi unvon: ${rank.title.uz}!`,
            en: `New rank: ${rank.title.en}!`,
          })}
        </p>
      )}
    </section>
  );
}
