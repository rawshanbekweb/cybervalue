import { MISSION_IDS } from "./content";
import { restoreProgress } from "./logic";
import { restoreCipherProgress } from "./cipher-content";
import { restoreStory } from "./story";
import { dayIndex, restoreDaily } from "./daily";
import { restoreCodename, xpFor } from "./rank";

// Junior runs in the browser, so a student shares their results by sending
// what their browser stored. The server re-reads it with the same validators
// and recomputes the XP, so a hand-edited upload can only claim what a real
// run could earn: every mission, every exercise and one puzzle a day.

export const MAX_SNAPSHOT = 20_000;
// The daily puzzle started with this release; no streak can be older.
const FIRST_DAY = dayIndex(Date.UTC(2026, 9, 16));

export function juniorFromSnapshot(raw: unknown, now = Date.now()) {
  const value =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const missions = Object.keys(
    restoreProgress(value.missions, MISSION_IDS),
  ).length;
  const exercises = Object.values(restoreCipherProgress(value.ciphers)).reduce(
    (sum, list) => sum + (list?.length ?? 0),
    0,
  );
  const today = dayIndex(now);
  const daily = restoreDaily(value.daily).filter(
    (day) => day >= FIRST_DAY && day <= today,
  ).length;
  const story = restoreStory(value.story);
  return {
    xp: xpFor({ missions, exercises, daily, story }),
    codename: restoreCodename(value.agent),
  };
}

/** How a classmate is shown: their codename, or first name and initial. */
export function rankingName(student: { name: string; juniorCodename: string }) {
  if (student.juniorCodename) return student.juniorCodename;
  const [first = "", second = ""] = student.name.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}
