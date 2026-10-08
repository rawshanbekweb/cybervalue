import { initialShell, restoreShell, type Event, type Shell } from "./engine";

export type Transcript = {
  input: string;
  output: string;
  cwd: string;
  code: number;
};
export type Session = {
  shell: Shell;
  events: Event[];
  transcript: Transcript[];
  answer: number | null;
  draft: string;
};
export const EMPTY_SESSION: Session = {
  shell: initialShell(),
  events: [],
  transcript: [],
  answer: null,
  draft: "",
};
export const PROGRESS_KEY = "cybervalue:linux:progress:v1";
export const EMPTY_PROGRESS: Record<string, boolean> = {};

export function restoreSession(value: unknown): Session {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return structuredClone(EMPTY_SESSION);
  const raw = value as Partial<Session>;
  const events = Array.isArray(raw.events)
    ? raw.events
        .filter(
          (e) =>
            e &&
            typeof e.command === "string" &&
            e.command.length < 100 &&
            Array.isArray(e.args) &&
            e.args.length <= 100 &&
            e.args.every((a) => typeof a === "string" && a.length <= 2000) &&
            typeof e.output === "string" &&
            e.output.length <= 40000 &&
            [0, 1, 2].includes(e.code),
        )
        .slice(-200)
    : [];
  const transcript = Array.isArray(raw.transcript)
    ? raw.transcript
        .filter(
          (e) =>
            e &&
            typeof e.input === "string" &&
            e.input.length <= 2000 &&
            typeof e.output === "string" &&
            e.output.length <= 40000 &&
            typeof e.cwd === "string" &&
            e.cwd.length <= 2000 &&
            [0, 1, 2].includes(e.code),
        )
        .slice(-80)
    : [];
  return {
    shell: restoreShell(raw.shell),
    events,
    transcript,
    answer:
      Number.isInteger(raw.answer) && raw.answer! >= 0 && raw.answer! <= 2
        ? raw.answer!
        : null,
    draft: typeof raw.draft === "string" ? raw.draft.slice(0, 2000) : "",
  };
}

export function restoreProgress(
  value: unknown,
  total: number,
): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Array.from({ length: total }, (_, i) => String(i + 1))
      .filter(
        (id) =>
          Object.hasOwn(value, id) &&
          (value as Record<string, unknown>)[id] === true,
      )
      .map((id) => [id, true]),
  );
}
