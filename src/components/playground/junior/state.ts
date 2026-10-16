"use client";

import { useSyncExternalStore } from "react";
import { useLocalStorageState } from "../useLocalStorageState";
import { MISSION_IDS } from "@/lib/junior/content";
import { PROGRESS_KEY, restoreProgress } from "@/lib/junior/logic";
import {
  CIPHER_PROGRESS_KEY,
  restoreCipherProgress,
  TOTAL_EXERCISES,
} from "@/lib/junior/cipher-content";
import { STORY_KEY, restoreStory } from "@/lib/junior/story";
import { EVENTS_KEY, restoreEvents, type Events } from "@/lib/junior/badges";
import { DAILY_KEY, dayIndex, restoreDaily, streak } from "@/lib/junior/daily";
import { rankFor, xpFor } from "@/lib/junior/rank";

const never = () => () => {};

/** Today's puzzle day, or null on the server and during hydration. */
export function useToday() {
  return useSyncExternalStore(
    never,
    () => dayIndex(Date.now()),
    () => null,
  );
}

// Everything Junior keeps in the browser, read and validated in one place so
// every panel on the page agrees (the storage hook shares one value per key).
export function useJuniorState() {
  const [missionsRaw, setMissions] = useLocalStorageState<unknown>(
    PROGRESS_KEY,
    {},
  );
  const [ciphersRaw, setCiphers] = useLocalStorageState<unknown>(
    CIPHER_PROGRESS_KEY,
    {},
  );
  const [storyRaw, setStory] = useLocalStorageState<unknown>(STORY_KEY, {});
  const [eventsRaw, setEventsRaw] = useLocalStorageState<unknown>(
    EVENTS_KEY,
    {},
  );
  const [dailyRaw, setDaily] = useLocalStorageState<unknown>(DAILY_KEY, {});
  const today = useToday();

  const missions = restoreProgress(missionsRaw, MISSION_IDS);
  const ciphers = restoreCipherProgress(ciphersRaw);
  const story = restoreStory(storyRaw);
  const events = restoreEvents(eventsRaw);
  const days = restoreDaily(dailyRaw);
  const missionCount = Object.keys(missions).length;
  const exercises = Object.values(ciphers).reduce(
    (sum, list) => sum + (list?.length ?? 0),
    0,
  );
  const xp = xpFor({
    missions: missionCount,
    exercises,
    daily: days.length,
    story,
  });

  return {
    missions,
    setMissions: (value: Record<string, true>) => setMissions(value),
    ciphers,
    setCiphers,
    story,
    solveStory: () => setStory({ solved: true }),
    events,
    addEvent: (patch: Events) => setEventsRaw({ ...events, ...patch }),
    days,
    today,
    streak: today === null ? 0 : streak(days, today),
    solveDay: (day: number) => {
      if (!days.includes(day)) setDaily({ days: [...days, day] });
    },
    missionCount,
    missionTotal: MISSION_IDS.length,
    exercises,
    exerciseTotal: TOTAL_EXERCISES,
    xp,
    ...rankFor(xp),
  };
}
