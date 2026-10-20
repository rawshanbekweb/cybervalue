// Shared building blocks of the animated beginner labs (HTTP, HTTPS, Bash,
// SSH): the lesson shape, the widgets every lab can use, and progress.
import type { Text } from "../network/ip";

export type { Text };

/** Someone or something in a message sequence: a column on the stage. */
export type Actor = {
  id: string;
  label: Text;
  icon: "laptop" | "server" | "lock" | "user" | "globe" | "shield" | "terminal";
};

/** One message flying from one actor to another. */
export type Step = {
  from: string;
  to: string;
  /** Short text on the flying envelope, usually code-like (not translated). */
  label: string;
  /** What happens, shown under the stage once the message arrives. */
  detail: Text;
  /** Colours the envelope: locked (encrypted), ok, error or plain. */
  tone?: "plain" | "locked" | "ok" | "error";
};

/** A clickable part of a code block, explained when chosen. */
export type Part = { text: string; id?: string };
export type Explain = { id: string; title: Text; body: Text };

export type Question = {
  ask: Text;
  options: Text[];
  answer: number;
  explain: Text;
};

export type SortItem = { label: Text; code?: boolean; bucket: string };
export type Bucket = { id: string; label: Text };

export type CommonWidget =
  | { type: "sequence"; actors: Actor[]; steps: Step[] }
  | { type: "anatomy"; lines: Part[][]; parts: Explain[] }
  | { type: "sort"; buckets: Bucket[]; items: SortItem[] }
  | { type: "quiz"; questions: Question[] };

export type Lesson<W> = {
  id: number;
  group: Text;
  title: Text;
  minutes: number;
  intro: Text;
  analogy: Text;
  theory: Text[];
  task: Text;
  hint: Text;
  widget: W;
};

/** Keeps only `true` marks for lessons that exist. */
export function restoreLessons(
  raw: unknown,
  lessons: readonly { id: number }[],
): Record<number, true> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<number, true> = {};
  for (const lesson of lessons)
    if ((raw as Record<string, unknown>)[lesson.id] === true)
      out[lesson.id] = true;
  return out;
}

/** Every explained part id must appear in the code block, and the reverse. */
export function anatomyIds(lines: Part[][]) {
  return lines.flat().flatMap((part) => (part.id ? [part.id] : []));
}

/** The column centre of an actor, in percent of the stage width. */
export function actorX(actors: Actor[], id: string) {
  const index = Math.max(
    0,
    actors.findIndex((a) => a.id === id),
  );
  return ((index + 0.5) / actors.length) * 100;
}
