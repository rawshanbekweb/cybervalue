import { z } from "zod";

// Admins write quizzes as plain text, one block per question:
//
//   ? Which port does HTTPS use by default?
//   - 80
//   + 443
//   - 22
//
// "+" marks the single correct option. The parsed key stays on the server.
export const quizSchema = z
  .array(
    z.object({
      prompt: z.string().min(1).max(1000),
      options: z.array(z.string().min(1).max(500)).min(2).max(8),
      answer: z.number().int().min(0),
    }),
  )
  .min(1)
  .max(60)
  .refine((questions) => questions.every((q) => q.answer < q.options.length));
export type Quiz = z.infer<typeof quizSchema>;
export type PublicQuestion = { prompt: string; options: string[] };

// Errors are translation keys; `line` or `number` fill their placeholders.
export type QuizParse =
  | { quiz: Quiz }
  | { error: string; values?: { line?: number; number?: number } };

export function parseQuiz(text: string): QuizParse {
  const quiz: { prompt: string; options: string[]; answer: number }[] = [];
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
    } else if (current && current.options.length === 0) {
      // A question may span several lines before its first option.
      current.prompt += `\n${line}`;
    } else {
      return {
        error:
          "Line {line}: start with ? (question), - (option) or + (correct option).",
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
      error: "Quiz is too long: up to 60 questions and 8 options each.",
    };
  return { quiz: parsed.data };
}

export function quizToText(quiz: Quiz) {
  return quiz
    .map(
      (q) =>
        `? ${q.prompt}\n${q.options
          .map((option, i) => `${i === q.answer ? "+" : "-"} ${option}`)
          .join("\n")}`,
    )
    .join("\n\n");
}

export const publicQuiz = (quiz: Quiz): PublicQuestion[] =>
  quiz.map(({ prompt, options }) => ({ prompt, options }));

// Unanswered or out-of-range choices count as wrong.
export function gradeQuiz(quiz: Quiz, answers: unknown[]) {
  const results = quiz.map((q, i) => answers[i] === q.answer);
  return {
    score: results.filter(Boolean).length,
    maxScore: quiz.length,
    results,
  };
}
