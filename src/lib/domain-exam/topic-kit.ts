// Shared shape and helpers of the topic exam banks.
import type { Text } from "../anim-lab/types";

export type Pair = [uz: string, en: string];

export type TopicQuestion = {
  topic: number;
  ask: Text;
  code?: string;
  /** Trusted HTML from the bank, shown rendered in a mock browser window. */
  preview?: string;
  options: Text[];
  answer: number;
  explain: Text;
};

export type TopicExam = {
  id: string;
  title: Text;
  minutes: number;
  /** The topics, shown as "modules" with a lesson to revisit. */
  modules: { title: Text; href: string }[];
  questions: TopicQuestion[];
};

const tx = ([uz, en]: Pair): Text => ({ uz, en });
const opt = (o: string | Pair): Text =>
  typeof o === "string" ? { uz: o, en: o } : tx(o);

export const q = (
  topic: number,
  ask: Pair,
  options: (string | Pair)[],
  answer: number,
  explain: Pair,
  code?: string,
): TopicQuestion => ({
  topic,
  ask: tx(ask),
  ...(code ? { code } : {}),
  options: options.map(opt),
  answer,
  explain: tx(explain),
});

/** The same question with a rendered page shown above its options. */
export const see = (question: TopicQuestion, html: string): TopicQuestion => ({
  ...question,
  preview: html,
});
