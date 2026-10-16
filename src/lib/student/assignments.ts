// Assignments: a task for a group with a deadline. What counts as done is the
// target, read from the progress the site already records, so students never
// mark anything by hand.
import { z } from "zod";
import { CHECKPOINT_META } from "../checkpoints/meta";
import { isLabId, LAB_META, type LabId } from "../lab-progress";

const DAY = 86_400_000;

export type Target =
  | { kind: "material"; id: string }
  | { kind: "checkpoint"; id: string }
  | { kind: "lab"; id: LabId };

export function parseTarget(value: string): Target | null {
  const [kind, id = "", ...rest] = value.split(":");
  if (rest.length || !id) return null;
  if (kind === "material" && /^[a-z0-9]{1,40}$/i.test(id)) return { kind, id };
  if (kind === "checkpoint" && CHECKPOINT_META.some((c) => c.id === id))
    return { kind, id };
  if (kind === "lab" && isLabId(id)) return { kind, id };
  return null;
}

export const targetKey = (target: Target) => `${target.kind}:${target.id}`;

/** Where the student goes to do it. Materials need their slug. */
export function targetHref(target: Target, slug?: string) {
  if (target.kind === "material")
    return slug ? `/student/m/${slug}` : "/student";
  if (target.kind === "checkpoint")
    return CHECKPOINT_META.find((c) => c.id === target.id)?.href ?? "/student";
  return LAB_META.find((l) => l.id === target.id)?.href ?? "/student";
}

export type AssignmentStatus = "done" | "late" | "open" | "missed";

/** On time, done after the deadline, still open, or missed. */
export function assignmentStatus(
  completedAt: Date | null | undefined,
  dueAt: Date,
  now = Date.now(),
): AssignmentStatus {
  if (completedAt) return completedAt <= dueAt ? "done" : "late";
  return now <= dueAt.getTime() ? "open" : "missed";
}

export const STATUS_TEXT: Record<AssignmentStatus, string> = {
  done: "Done",
  late: "Done late",
  open: "Still open",
  missed: "Missed",
};

/** Open work due within a week, or missed, comes first on the student page. */
export function isUrgent(status: AssignmentStatus, dueAt: Date, now: number) {
  return (
    status === "missed" ||
    (status === "open" && dueAt.getTime() - now <= 7 * DAY)
  );
}

/** Shown to students: everything still open, plus the last two weeks. */
export const visibleSince = (now: number) => new Date(now - 14 * DAY);

/** "Due in 3 days", "due today", "2 days overdue". */
export function dueLabel(dueAt: Date, now: number) {
  // Calendar days in Tashkent (UTC+5).
  const day = (t: number) => Math.floor((t + 5 * 3_600_000) / DAY);
  const days = day(dueAt.getTime()) - day(now);
  if (dueAt.getTime() < now)
    return days >= 0
      ? { text: "Overdue today" }
      : { text: "{days} days overdue", days: -days };
  if (days === 0) return { text: "Due today" };
  if (days === 1) return { text: "Due tomorrow" };
  return { text: "Due in {days} days", days };
}

const groupName = z
  .string()
  .trim()
  .max(40)
  .regex(/^[\p{L}\p{N} ._-]*$/u);

// The date and time the teacher picked are Tashkent time (UTC+5).
export const assignmentSchema = z.object({
  title: z.string().trim().min(1).max(160),
  note: z.string().trim().max(2000),
  group: groupName,
  target: z.string().transform((value, ctx) => {
    const target = parseTarget(value);
    if (!target) {
      ctx.addIssue({ code: "custom", message: "target" });
      return z.NEVER;
    }
    return targetKey(target);
  }),
  dueAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    .transform((value) => new Date(`${value}:00+05:00`))
    .refine((date) => !Number.isNaN(date.getTime())),
});

/** The value of a datetime-local field in Tashkent time. */
export function localInput(date: Date) {
  return new Date(date.getTime() + 5 * 3_600_000).toISOString().slice(0, 16);
}

export type Completion = {
  materials: {
    id: string;
    studentId: string;
    at: Date;
  }[];
  checkpoints: {
    studentId: string;
    checkpoint: string;
    score: number;
    total: number;
    createdAt: Date;
  }[];
  labs: {
    studentId: string;
    lab: string;
    lessons: number[];
    updatedAt: Date;
  }[];
};

/**
 * When the student first completed the target, or null. Materials count as
 * the student page counts them (progress, or any hand-in); a checkpoint must
 * be passed; a lab needs every lesson, dated by its last save.
 */
export function completedAt(
  target: Target,
  studentId: string,
  data: Completion,
  total: (lab: LabId) => number,
): Date | null {
  const first = (dates: Date[]) =>
    dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
  if (target.kind === "material")
    return first(
      data.materials
        .filter((m) => m.id === target.id && m.studentId === studentId)
        .map((m) => m.at),
    );
  if (target.kind === "checkpoint") {
    const pass = CHECKPOINT_META.find((c) => c.id === target.id)?.pass ?? 100;
    return first(
      data.checkpoints
        .filter(
          (c) =>
            c.studentId === studentId &&
            c.checkpoint === target.id &&
            c.total > 0 &&
            (c.score / c.total) * 100 >= pass,
        )
        .map((c) => c.createdAt),
    );
  }
  const row = data.labs.find(
    (l) => l.studentId === studentId && l.lab === target.id,
  );
  return row && row.lessons.length >= total(target.id) ? row.updatedAt : null;
}

/** "Fri 24 Oct, 18:00" in Tashkent time. */
export function formatDue(date: Date, locale: "uz" | "en") {
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-Latn" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tashkent",
  }).format(date);
}

/** What the assignment asks for, in the reader's language. */
export function targetName(
  assignment: { target: Target; material: { title: string } | null },
  locale: "uz" | "en",
  t: (source: string) => string,
) {
  const { target } = assignment;
  if (target.kind === "material")
    return assignment.material?.title ?? t("Deleted material");
  if (target.kind === "checkpoint")
    return (
      CHECKPOINT_META.find((c) => c.id === target.id)?.title[locale] ??
      target.id
    );
  const lab = LAB_META.find((l) => l.id === target.id);
  return lab
    ? t("All lessons: {lab}").replace("{lab}", lab.title[locale])
    : target.id;
}
