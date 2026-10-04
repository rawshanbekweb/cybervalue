import { z } from "zod";

export const ASSESSMENT_PATH = "/playground/html-basics/assessment";
export const MAX_CODE_LENGTH = 24000;
export const signalsSchema = z
  .object({
    hidden: z.number().int().min(0).max(10000),
    paste: z.number().int().min(0).max(10000),
    fullscreen: z.number().int().min(0).max(10000),
  })
  .strict();
export const draftSchema = z
  .object({
    revision: z.number().int().min(0).max(1000000),
    code: z.string().max(MAX_CODE_LENGTH),
    answers: z
      .record(z.string().max(30), z.number().int().min(0).max(3))
      .refine((x) => Object.keys(x).length <= 12),
    explanations: z.tuple([z.string().max(1600), z.string().max(1600)]),
    signals: signalsSchema,
  })
  .strict();
export type Draft = z.infer<typeof draftSchema>;
export type Question = {
  id: string;
  prompt: string;
  options: string[];
  lesson: number;
};
export type Challenge = {
  name: string;
  variant: number;
  starter: string;
  // Uzbek source templates; fill or translate them with `values`.
  requirements: string[];
  values: Record<string, string>;
  questions: Question[];
  reasoning: string[];
};
export const fillTemplate = (
  template: string,
  values: Record<string, string>,
) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? values[key] : match,
  );

export type AttemptView = {
  id: string;
  name: string;
  title: string;
  minutes: number;
  deadline: string;
  serverNow: string;
  submittedAt: string | null;
  finishReason: string | null;
  autoScore: number | null;
  reviewScore: number | null;
  reviewNote: string;
  draft: Draft;
  challenge: Challenge;
};
