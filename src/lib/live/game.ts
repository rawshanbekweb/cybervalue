// Live quiz rules shared by the host screen, the player page and the API:
// codes, names, scoring and what each side may see.
import { createHash, randomBytes, randomInt } from "node:crypto";
import { z } from "zod";
import { quizSchema, type Quiz } from "../student/quiz";

export const LIVE_STATES = ["lobby", "question", "reveal", "finished"] as const;
export type LiveState = (typeof LIVE_STATES)[number];

// Late answers within this window still count: phones on a slow network.
export const ANSWER_GRACE_MS = 1500;
export const MAX_PLAYERS = 200;
export const SECONDS = [10, 20, 30, 60] as const;

export const newGameCode = () => String(randomInt(100000, 1000000));
export const newPlayerToken = () => randomBytes(24).toString("base64url");
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const codeSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ""))
  .pipe(z.string().length(6));

// Names show on the classroom screen: letters, digits, spaces and a few
// marks, without leading or doubled spaces.
export const nameSchema = z
  .string()
  .transform((value) => value.replace(/\s+/g, " ").trim())
  .pipe(
    z
      .string()
      .min(1)
      .max(24)
      .regex(/^[\p{L}\p{N} .'‘’`_-]+$/u),
  );

export function parseQuestions(value: unknown): Quiz | null {
  const parsed = quizSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** 500 for a right answer plus up to 500 for speed; 0 when wrong. */
export function points(correct: boolean, ms: number, seconds: number) {
  if (!correct) return 0;
  const limit = seconds * 1000;
  const fraction = Math.min(1, Math.max(0, ms / limit));
  return Math.round(500 + 500 * (1 - fraction));
}

export function msLeft(
  startedAt: Date | null,
  seconds: number,
  now = Date.now(),
) {
  if (!startedAt) return 0;
  return Math.max(0, startedAt.getTime() + seconds * 1000 - now);
}

/** Whether an answer sent now still counts. */
export function canAnswer(
  game: { state: string; startedAt: Date | null; seconds: number },
  now = Date.now(),
) {
  return (
    game.state === "question" &&
    game.startedAt !== null &&
    now <= game.startedAt.getTime() + game.seconds * 1000 + ANSWER_GRACE_MS
  );
}

type Ranked = { id: string; name: string; score: number; createdAt: Date };

/** Highest score first; ties go to who joined first. */
export function leaderboard<T extends Ranked>(players: T[]) {
  return [...players]
    .sort(
      (a, b) =>
        b.score - a.score || a.createdAt.getTime() - b.createdAt.getTime(),
    )
    .map((player, index) => ({ ...player, place: index + 1 }));
}

/** How many players picked each option of a question. */
export function distribution(
  optionCount: number,
  answers: { choice: number }[],
) {
  const counts = Array.from({ length: optionCount }, () => 0);
  for (const a of answers)
    if (a.choice >= 0 && a.choice < optionCount) counts[a.choice]++;
  return counts;
}

/** The next state for a host command, or null when it does not apply. */
export function nextState(
  game: { state: string; current: number },
  command: "start" | "reveal" | "next" | "end",
  total: number,
): { state: LiveState; current: number } | null {
  switch (command) {
    case "start":
      return game.state === "lobby" && total > 0
        ? { state: "question", current: 0 }
        : null;
    case "reveal":
      return game.state === "question"
        ? { state: "reveal", current: game.current }
        : null;
    case "next":
      if (game.state !== "reveal") return null;
      return game.current + 1 < total
        ? { state: "question", current: game.current + 1 }
        : { state: "finished", current: game.current };
    case "end":
      return game.state === "finished"
        ? null
        : { state: "finished", current: game.current };
  }
}
