// The teacher's class panel: who needs attention and a weekly report, from
// the same standings the students see.
import { CHECKPOINT_META } from "../checkpoints/meta";
import { toCsv } from "./results";
import type { Standing } from "./xp";

const DAY = 86_400_000;

export type Reason = "inactive" | "never" | "behind" | "low-tests";

/** Why a student may need the teacher's attention, most urgent first. */
export function attention(
  standing: Standing,
  classCompletion: number,
  now = Date.now(),
): Reason[] {
  const reasons: Reason[] = [];
  if (!standing.lastActive) reasons.push("never");
  else if (now - standing.lastActive.getTime() > 7 * DAY)
    reasons.push("inactive");
  const completion = standing.available
    ? standing.done / standing.available
    : 0;
  if (standing.available && completion + 0.25 < classCompletion)
    reasons.push("behind");
  if (standing.average !== null && standing.average < 50)
    reasons.push("low-tests");
  return reasons;
}

export const REASON_TEXT: Record<Reason, string> = {
  never: "No activity yet",
  inactive: "Inactive for over a week",
  behind: "Far behind the class",
  "low-tests": "Test average below 50%",
};

export type ClassRow = {
  name: string;
  group: string;
  standing: Standing;
  reasons: Reason[];
};

export function classCsv(
  rows: ClassRow[],
  t: (source: string) => string,
  locale: "uz" | "en",
) {
  const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
  return toCsv([
    [
      t("Name"),
      t("Group"),
      t("Rank"),
      "XP",
      t("Completed"),
      t("Test average"),
      ...CHECKPOINT_META.map((c) => c.title[locale]),
      t("This week"),
      t("Streak (weeks)"),
      t("Last activity"),
      t("Needs attention"),
    ],
    ...rows.map(({ name, group, standing: s, reasons }) => [
      name,
      group,
      s.rank.title[locale],
      s.xp,
      `${s.done}/${s.available}`,
      s.average === null ? "" : `${s.average}%`,
      ...CHECKPOINT_META.map((c) =>
        s.checkpoints[c.id] === undefined ? "" : `${s.checkpoints[c.id]}%`,
      ),
      s.week,
      s.streakWeeks,
      day(s.lastActive),
      reasons.map((r) => t(REASON_TEXT[r])).join("; "),
    ]),
  ]);
}
