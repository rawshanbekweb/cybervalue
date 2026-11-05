// Builds and grades the Intermediate domain exams. Never import this module
// from client components: the questions it builds carry their answers.
import { checkpointById, questionsFor } from "../checkpoints/questions";
import { DOMAINS, type Domain } from "../intermediate/roadmap";
import {
  DOMAIN_EXAM_PASS,
  PER_MODULE,
  type ExamAnswers,
  type ExamQuestion,
  type ExamResult,
} from "./content";

/** A domain that has an exam: every module has a lab with a checkpoint. */
export function examDomain(id: string): Domain | null {
  const domain = DOMAINS.find((d) => d.id === id);
  if (!domain || domain.modules.length === 0) return null;
  const ready = domain.modules.every(
    (m) => m.lab && m.href && checkpointById(`${m.lab}-1`),
  );
  return ready ? domain : null;
}

export const EXAM_DOMAINS = DOMAINS.filter((d) => examDomain(d.id));

/**
 * The exam for one seed: PER_MODULE questions from each module, in module
 * order. The same seed always gives the same questions and option order.
 */
export function buildExam(domain: Domain, seed: number) {
  return domain.modules.flatMap((m, index) => {
    const checkpoint = checkpointById(`${m.lab}-1`)!;
    return questionsFor(checkpoint, seed + index * 7919)
      .slice(0, PER_MODULE)
      .map((q, i) => ({
        ...q,
        id: `${m.lab}.${i}`,
        module: m.title,
        href: m.href!,
      }));
  });
}

/** What the browser gets while the exam runs: no answers, no explanations. */
export const publicQuestions = (
  questions: ReturnType<typeof buildExam>,
): ExamQuestion[] =>
  questions.map(({ id, module, ask, code, options }) => ({
    id,
    module,
    ask,
    ...(code ? { code } : {}),
    options,
  }));

export function gradeExam(
  domain: Domain,
  seed: number,
  answers: ExamAnswers,
): ExamResult {
  const items = buildExam(domain, seed).map((q) => {
    const raw = answers[q.id];
    const picked =
      Number.isInteger(raw) && raw >= 0 && raw < q.options.length ? raw : null;
    return {
      id: q.id,
      module: q.module,
      ask: q.ask,
      ...(q.code ? { code: q.code } : {}),
      options: q.options,
      picked,
      answer: q.answer,
      correct: picked === q.answer,
      explain: q.explain,
      href: q.href,
    };
  });
  const score = items.filter((i) => i.correct).length;
  const percent = Math.round((score / items.length) * 100);
  return {
    items,
    score,
    total: items.length,
    percent,
    passed: percent >= DOMAIN_EXAM_PASS,
  };
}
