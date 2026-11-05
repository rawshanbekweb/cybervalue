// Academy Intermediate final exams: one per roadmap domain, built from the
// checkpoint pools of the domain's modules. Safe for the browser: nothing
// here holds an answer key (see ./build.ts).
import type { Text } from "../anim-lab/types";

export const DOMAIN_EXAM_MINUTES = 30;
/** Answers that arrive this long after the deadline still count. */
export const DOMAIN_EXAM_GRACE_MS = 60_000;
/** Questions taken from each module's checkpoint pool. */
export const PER_MODULE = 4;
/** Percent needed to pass. */
export const DOMAIN_EXAM_PASS = 70;

export const domainExamPath = (domain: string) =>
  `/intermediate/exam/${domain}`;

/** A question as the student sees it during the exam. */
export type ExamQuestion = {
  id: string;
  module: Text;
  ask: Text;
  code?: string;
  options: Text[];
};

/** Picked option index by question id. */
export type ExamAnswers = Record<string, number>;

export type ExamResultItem = ExamQuestion & {
  picked: number | null;
  answer: number;
  correct: boolean;
  explain: Text;
  href: string;
};

export type ExamResult = {
  items: ExamResultItem[];
  score: number;
  total: number;
  percent: number;
  passed: boolean;
};

export type ExamState =
  | { kind: "staff" }
  | { kind: "new"; count: number }
  | {
      kind: "running";
      remaining: number;
      answers: ExamAnswers;
      leaves: number;
      questions: ExamQuestion[];
    }
  | { kind: "pending" }
  | { kind: "approved"; result: ExamResult; leaves: number; note: string };
