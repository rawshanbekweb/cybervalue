"use client";

import { useSyncExternalStore } from "react";
import {
  CASE_MISSION_IDS,
  MISSION_IDS,
  type MissionId,
} from "@/lib/junior/content";
import { bestStreak, type MissionEvidence } from "@/lib/junior/verify";
import type { Progress } from "@/lib/junior/logic";
import { TOTAL_EXERCISES, type CipherId } from "@/lib/junior/cipher-content";
import type { Events } from "@/lib/junior/badges";
import { dayIndex, streak } from "@/lib/junior/daily";
import { rankFor } from "@/lib/junior/rank";
import {
  exercisesOf,
  restoreJuniorProgress,
  xpOf,
} from "@/lib/junior/progress";
import type { JuniorProgress } from "@/lib/junior/progress";
import { useJuniorStore } from "./store";

const never = () => () => {};

/** Today's puzzle day, or null on the server and during hydration. */
export function useToday() {
  return useSyncExternalStore(
    never,
    () => dayIndex(Date.now()),
    () => null,
  );
}

const EMPTY = restoreJuniorProgress({});

// Everything Junior knows about the signed-in member, derived in one place so
// every panel agrees. Outside the academy (a friend opening a secret link)
// the state is empty and changes go nowhere.
export function useJuniorState() {
  const store = useJuniorStore();
  const today = useToday();
  const progress = store?.progress ?? EMPTY;
  const set = store?.set ?? (() => {});
  const xp = xpOf(progress);

  return {
    signedIn: Boolean(store),
    member: store?.member ?? null,
    unsaved: store?.unsaved ?? false,
    missions: progress.missions,
    /** A finished mission, with the answers that solve it. */
    completeMission: (id: MissionId, evidence: MissionEvidence) =>
      set(
        "missions",
        { ...progress.missions, [id]: true },
        { missions: { [id]: evidence } },
      ),
    resetMissions: () => set("missions", {} as Progress),
    ciphers: progress.ciphers,
    /** A solved homework exercise, with its answer. */
    solveExercise: (cipher: CipherId, index: number, answer: string) => {
      const solved = progress.ciphers[cipher] ?? [];
      if (solved.includes(index)) return;
      set(
        "ciphers",
        { ...progress.ciphers, [cipher]: [...solved, index] },
        { answers: { [cipher]: { [index]: answer } } },
      );
    },
    story: progress.story,
    solveStory: () => set("story", true),
    events: progress.events,
    addEvent: (patch: Events) =>
      set("events", { ...progress.events, ...patch }),
    days: progress.daily,
    today,
    streak: today === null ? 0 : streak(progress.daily, today),
    solveDay: (day: number, answer: string) => {
      if (!progress.daily.includes(day))
        set("daily", [...progress.daily, day], { daily: answer });
    },
    bestStreak: bestStreak(progress.daily),
    agent: progress.agent,
    setAgent: (value: JuniorProgress["agent"]) => set("agent", value),
    finishTour: () => set("agent", { ...progress.agent, tour: true }),
    missionCount: Object.keys(progress.missions).length,
    missionTotal: MISSION_IDS.length,
    /** The Cyber HQ case's missions, which the case and certificate need. */
    caseCount: CASE_MISSION_IDS.filter((id) => progress.missions[id]).length,
    caseTotal: CASE_MISSION_IDS.length,
    exercises: exercisesOf(progress),
    exerciseTotal: TOTAL_EXERCISES,
    xp,
    ...rankFor(xp),
  };
}
