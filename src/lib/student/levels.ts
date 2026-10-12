// A student's level comes from the entrance exam and decides which materials
// they see, alongside their class group. Materials whose slug starts with
// ENTRANCE_PREFIX form the entrance exam.

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const isLevel = (value: unknown): value is Level =>
  LEVELS.includes(value as Level);

export const ENTRANCE_PREFIX = "kirish-sinovi-";
export const isEntranceExam = (slug: string) =>
  slug.startsWith(ENTRANCE_PREFIX);

// Thresholds on the entrance test, in percent of the best attempt
// (15 of 25 is 60%, 22 of 25 is 88%).
export const INTERMEDIATE_FROM = 60;
export const ADVANCED_FROM = 88;

// The suggestion the teacher confirms. Until the entrance test is taken there
// is none. The labs show whether the knowledge holds up in practice:
// - advanced: a strong test and every entrance lab solved;
// - intermediate: a passing test and at least one lab solved (or no labs);
// - beginner: everything else.
export function suggestLevel({
  testPercent,
  labsSolved,
  labsTotal,
}: {
  testPercent: number | null;
  labsSolved: number;
  labsTotal: number;
}): Level | null {
  if (testPercent === null) return null;
  if (testPercent >= ADVANCED_FROM && labsSolved >= labsTotal)
    return "advanced";
  if (testPercent >= INTERMEDIATE_FROM && (labsSolved > 0 || labsTotal === 0))
    return "intermediate";
  return "beginner";
}

// Empty `levels` means every student; otherwise only students placed at one
// of the listed levels.
export const visibleAtLevel = (levels: string[], level: string) =>
  levels.length === 0 || levels.includes(level);
