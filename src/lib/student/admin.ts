import { z } from "zod";
import { slugSchema } from "../validation";
import { parseQuiz, type Quiz } from "./quiz";

const groupName = z
  .string()
  .trim()
  .max(40)
  .regex(/^[\p{L}\p{N} ._-]*$/u);
export const MAX_ROSTER = 200;

// One student per line: "Full name | group". The group is optional.
export function parseRoster(text: string) {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((part) => part.trim()));
  if (!rows.length || rows.length > MAX_ROSTER)
    return { error: "Add between 1 and 200 students, one per line." } as const;
  const students: { name: string; group: string }[] = [];
  for (const [index, [name, group = "", ...extra]] of rows.entries()) {
    const parsedGroup = groupName.safeParse(group);
    if (!name || name.length > 100 || extra.length || !parsedGroup.success)
      return {
        error:
          "Line {line}: write Full name | group. Names up to 100 characters; groups up to 40 letters, digits, spaces, dots, dashes or underscores.",
        values: { line: index + 1 },
      } as const;
    students.push({ name, group: parsedGroup.data });
  }
  return { students } as const;
}

// An empty date means the access never expires. A date ends at midnight
// Tashkent time (UTC+5), where the classes run.
const expiry = z
  .union([z.literal(""), z.iso.date()])
  .transform((value) =>
    value ? new Date(`${value}T23:59:59.999+05:00`) : null,
  );

export const studentUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  group: groupName,
  note: z.string().trim().max(2000),
  active: z.boolean(),
  expiresAt: expiry,
});

export const rosterOptionsSchema = z.object({
  roster: z.string().max(25000),
  expiresAt: expiry,
});

export const MATERIAL_KIND_VALUES = [
  "LESSON",
  "LAB",
  "PRACTICE",
  "QUIZ",
] as const;

// The raw form, as the admin typed it.
export type MaterialFormValues = {
  slug: string;
  kind: (typeof MATERIAL_KIND_VALUES)[number];
  title: string;
  summary: string;
  body: string;
  quizText: string;
  maxAttempts: number;
  groups: string;
  position: number;
  published: boolean;
};

export const materialSchema = z.object({
  slug: slugSchema,
  kind: z.enum(MATERIAL_KIND_VALUES),
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().max(400),
  body: z.string().max(60000),
  quizText: z.string().max(60000),
  maxAttempts: z.coerce.number().int().min(0).max(20),
  groups: z
    .string()
    .max(400)
    .transform((value) =>
      [
        ...new Set(
          value
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean),
        ),
      ].slice(0, 20),
    )
    .pipe(z.array(groupName.min(1))),
  position: z.coerce.number().int().min(-10000).max(10000),
  published: z.boolean(),
});
export type MaterialInput = z.infer<typeof materialSchema>;

export type MaterialCheck =
  | { data: Omit<MaterialInput, "quizText"> & { quiz: Quiz | null } }
  | { error: string; values?: Record<string, number> };

// A quiz material must carry a valid question list; other kinds never store one.
export function checkMaterial(input: unknown): MaterialCheck {
  const parsed = materialSchema.safeParse(input);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return {
      error:
        field === "slug"
          ? "Slug: lowercase letters, digits and single dashes."
          : field === "groups"
            ? "Groups: comma-separated names of letters, digits, spaces, dots, dashes or underscores."
            : "A title is required, and each text field has a length limit.",
    };
  }
  const { quizText, ...fields } = parsed.data;
  if (fields.kind !== "QUIZ") return { data: { ...fields, quiz: null } };
  const quiz = parseQuiz(quizText);
  if ("error" in quiz) return quiz;
  return { data: { ...fields, quiz: quiz.quiz } };
}
