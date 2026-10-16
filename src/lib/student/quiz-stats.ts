import type { Quiz } from "./quiz";

export type QuestionStat = {
  index: number;
  prompt: string;
  answer: string;
  attempts: number;
  correct: number;
  blank: number;
  // Percent of attempts that got it wrong or left it blank.
  wrongPercent: number;
  // How often each option was picked, in stored order.
  picks: number[];
  // The wrong option picked most often, if any.
  trap: { label: string; count: number } | null;
};

/**
 * Per-question results over every graded attempt. An attempt saved before
 * the questions were edited (a different count) is left out, since its
 * answers no longer line up.
 */
export function questionStats(quiz: Quiz, answerSets: unknown[]) {
  const sets = answerSets.filter(
    (a): a is unknown[] => Array.isArray(a) && a.length === quiz.length,
  );
  const stats: QuestionStat[] = quiz.map((q, index) => {
    const picks = q.options.map(() => 0);
    let blank = 0;
    for (const answers of sets) {
      const value = answers[index];
      if (typeof value === "number" && value >= 0 && value < picks.length)
        picks[value]++;
      else blank++;
    }
    const correct = picks[q.answer];
    const wrong = picks
      .map((count, option) => ({ count, option }))
      .filter((p) => p.option !== q.answer && p.count > 0)
      .sort((a, b) => b.count - a.count)[0];
    return {
      index,
      prompt: q.prompt,
      answer: q.options[q.answer],
      attempts: sets.length,
      correct,
      blank,
      wrongPercent: sets.length
        ? Math.round(((sets.length - correct) / sets.length) * 100)
        : 0,
      picks,
      trap: wrong
        ? { label: q.options[wrong.option], count: wrong.count }
        : null,
    };
  });
  return {
    counted: sets.length,
    skipped: answerSets.length - sets.length,
    stats,
  };
}

/** The hardest questions first, ties in question order. */
export const hardest = (stats: QuestionStat[], limit = 3) =>
  [...stats]
    .filter((s) => s.attempts > 0 && s.wrongPercent > 0)
    .sort((a, b) => b.wrongPercent - a.wrongPercent || a.index - b.index)
    .slice(0, limit);
