"use client";

import { useSyncExternalStore } from "react";
import { MISSION_IDS } from "@/lib/junior/content";
import type { Progress } from "@/lib/junior/logic";
import {
  TOTAL_EXERCISES,
  type CipherProgress,
} from "@/lib/junior/cipher-content";
import type { Events } from "@/lib/junior/badges";
import { dayIndex, streak } from "@/lib/junior/daily";
import { rankFor } from "@/lib/junior/rank";
import {
  exercisesOf,
  restoreJuniorProgress,
  xpOf,
} from "@/lib/junior/progress";
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
    setMissions: (value: Progress) => set("missions", value),
    ciphers: progress.ciphers,
    setCiphers: (value: CipherProgress) => set("ciphers", value),
    story: progress.story,
    solveStory: () => set("story", true),
    events: progress.events,
    addEvent: (patch: Events) =>
      set("events", { ...progress.events, ...patch }),
    days: progress.daily,
    today,
    streak: today === null ? 0 : streak(progress.daily, today),
    solveDay: (day: number) => {
      if (!progress.daily.includes(day)) set("daily", [...progress.daily, day]);
    },
    agent: progress.agent,
    setAgent: (value: { name: string; rank: number }) => set("agent", value),
    missionCount: Object.keys(progress.missions).length,
    missionTotal: MISSION_IDS.length,
    exercises: exercisesOf(progress),
    exerciseTotal: TOTAL_EXERCISES,
    xp,
    ...rankFor(xp),
  };
}
