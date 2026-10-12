import { z } from "zod";

// Admins write quizzes as plain text, one block per question:
//
//   ? Which port does HTTPS use by default?
//   - 80
//   + 443
//   - 22
//   > Port 443 is reserved for HTTP over TLS.
//
// "+" marks the single correct option and optional ">" lines explain the
// answer. The key and explanations stay on the server until a student may
// see them.
export const quizSchema = z
  .array(
    z.object({
      prompt: z.string().min(1).max(1000),
      options: z.array(z.string().min(1).max(500)).min(2).max(8),
      answer: z.number().int().min(0),
      explain: z.string().max(2000).optional(),
    }),
  )
  .min(1)
  .max(60)
  .refine((questions) => questions.every((q) => q.answer < q.options.length));
export type Quiz = z.infer<typeof quizSchema>;
// What the browser gets: no key, no explanations. `index` is the question's
// and `value` the option's position in the stored quiz, so a shuffled form
// still submits answers the grader understands.
export type PublicQuestion = {
  index: number;
  prompt: string;
  options: { value: number; label: string }[];
};

// Errors are translation keys; `line` or `number` fill their placeholders.
export type QuizParse =
  | { quiz: Quiz }
  | { error: string; values?: { line?: number; number?: number } };

export function parseQuiz(text: string): QuizParse {
  const quiz: {
    prompt: string;
    options: string[];
    answer: number;
    explain?: string;
  }[] = [];
  const correct: number[] = [];
  const lines = text.split(/\r?\n/);
  for (const [index, raw] of lines.entries()) {
    const line = raw.trim();
    if (!line) continue;
    const marker = line[0];
    const value = line.slice(1).trim();
    const current = quiz.at(-1);
    if (marker === "?") {
      if (!value)
        return {
          error: "Line {line}: question text is empty.",
          values: { line: index + 1 },
        };
      quiz.push({ prompt: value, options: [], answer: -1 });
      correct.push(0);
    } else if ((marker === "-" || marker === "+") && current) {
      if (!value)
        return {
          error: "Line {line}: option text is empty.",
          values: { line: index + 1 },
        };
      if (marker === "+") {
        current.answer = current.options.length;
        correct[correct.length - 1]++;
      }
      current.options.push(value);
    } else if (marker === ">" && current) {
      current.explain = current.explain
        ? `${current.explain}\n${value}`
        : value;
    } else if (current && current.options.length === 0 && !current.explain) {
      // A question may span several lines before its first option.
      current.prompt += `\n${line}`;
    } else {
      return {
        error:
          "Line {line}: start with ? (question), - (option), + (correct option) or > (explanation).",
        values: { line: index + 1 },
      };
    }
  }
  if (!quiz.length) return { error: "Add at least one question." };
  const bad = quiz.findIndex(
    (q, i) => correct[i] !== 1 || q.options.length < 2,
  );
  if (bad >= 0)
    return {
      error:
        "Question {number} needs at least two options and exactly one + answer.",
      values: { number: bad + 1 },
    };
  const parsed = quizSchema.safeParse(quiz);
  if (!parsed.success)
    return {
      error:
        "Quiz is too long: up to 60 questions, 8 options each and 2,000 characters per explanation.",
    };
  return { quiz: parsed.data };
}

export function quizToText(quiz: Quiz) {
  return quiz
    .map((q) => {
      const options = q.options.map(
        (option, i) => `${i === q.answer ? "+" : "-"} ${option}`,
      );
      const explain = q.explain?.split("\n").map((line) => `> ${line}`) ?? [];
      return [`? ${q.prompt}`, ...options, ...explain].join("\n");
    })
    .join("\n\n");
}

// A small seeded generator (cyrb53 hash into mulberry32): the same seed always
// gives the same order, so a reload does not reshuffle an open attempt.
function seededRandom(seed: string) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  let state = (h1 ^ Math.imul(h2, 16777619)) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Without a seed the stored order is kept. With one (student, test and
// attempt), questions and their options are shuffled, so classmates sitting
// side by side do not see the same "1-B, 2-A".
export function publicQuiz(quiz: Quiz, seed?: string): PublicQuestion[] {
  const questions = quiz.map(({ prompt, options }, index) => ({
    index,
    prompt,
    options: options.map((label, value) => ({ value, label })),
  }));
  if (seed === undefined) return questions;
  const random = seededRandom(seed);
  return shuffle(questions, random).map((q) => ({
    ...q,
    options: shuffle(q.options, random),
  }));
}

// Unanswered or out-of-range choices count as wrong.
export function gradeQuiz(quiz: Quiz, answers: unknown[]) {
  const results = quiz.map((q, i) => answers[i] === q.answer);
  return {
    score: results.filter(Boolean).length,
    maxScore: quiz.length,
    results,
  };
}

type QuizStart = { startedAt: Date };

// A timed quiz starts when the student presses "Start" and ends at
// startedAt + timeLimit minutes. The form submits itself at the deadline;
// the grace period covers a slow network, not extra thinking time.
export const QUIZ_GRACE_MS = 60_000;

export const quizDeadline = (start: QuizStart, minutes: number) =>
  new Date(start.startedAt.getTime() + minutes * 60_000);

export const quizMsLeft = (
  start: QuizStart,
  minutes: number,
  now = new Date(),
) => Math.max(0, quizDeadline(start, minutes).getTime() - now.getTime());

export const isQuizExpired = (
  start: QuizStart,
  minutes: number,
  now = new Date(),
) => now.getTime() > quizDeadline(start, minutes).getTime() + QUIZ_GRACE_MS;
