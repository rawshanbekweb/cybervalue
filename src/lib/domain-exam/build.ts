// Builds and grades the Intermediate domain exams. Never import this module
// from client components: the questions it builds carry their answers.
import { checkpointById, questionsFor } from "../checkpoints/questions";
import { DOMAINS, type Domain } from "../intermediate/roadmap";
import { random, shuffle } from "../network/practice";
import { TOPIC_EXAMS, topicExam, type TopicExam } from "./topic-exams";
import {
  DOMAIN_EXAM_MINUTES,
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

/** A roadmap domain's final exam, or a topic exam with its own questions. */
export type ExamSubject = Domain | TopicExam;

export const isTopicExam = (s: ExamSubject): s is TopicExam => "questions" in s;

export const examSubject = (id: string): ExamSubject | null =>
  topicExam(id) ?? examDomain(id);

/** Every exam the teacher page lists: domain exams, then topic exams. */
export const EXAM_SUBJECTS: ExamSubject[] = [...EXAM_DOMAINS, ...TOPIC_EXAMS];

export const examMinutes = (s: ExamSubject) =>
  isTopicExam(s) ? s.minutes : DOMAIN_EXAM_MINUTES;

/**
 * A topic exam for one seed: every question, in a shuffled order with
 * shuffled options. Ids stay those of the bank so answers survive.
 */
function buildTopicExam(exam: TopicExam, seed: number) {
  const r = random(seed);
  return shuffle(
    r,
    exam.questions.map((q, i) => ({ q, i })),
  ).map(({ q, i }) => {
    const order = shuffle(
      r,
      q.options.map((_, n) => n),
    );
    const topic = exam.modules[q.topic];
    return {
      ask: q.ask,
      ...(q.code ? { code: q.code } : {}),
      options: order.map((n) => q.options[n]),
      answer: order.indexOf(q.answer),
      explain: q.explain,
      id: `${exam.id}.${i}`,
      module: topic.title,
      href: topic.href,
    };
  });
}

/**
 * The exam for one seed: PER_MODULE questions from each module, in module
 * order. The same seed always gives the same questions and option order.
 */
export function buildExam(domain: ExamSubject, seed: number) {
  if (isTopicExam(domain)) return buildTopicExam(domain, seed);
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
  domain: ExamSubject,
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
