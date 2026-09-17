import { z } from "zod";

export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const httpsUrl = z
  .url()
  .max(2000)
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  }, "Use an HTTPS URL without credentials");
const text = z.string().trim().min(1).max(30000);
const label = z.string().trim().min(1).max(100);
const taxonomy = z.object({ name: label, slug: slugSchema }).strict();
const list = z.array(label).max(30).default([]);
export const resourcePath = z
  .string()
  .regex(
    /^\/downloads\/[a-z0-9]+(?:[a-z0-9._-]*[a-z0-9])?\.(?:pdf|txt|md|zip|csv)$/,
  )
  .refine((v) => !v.includes(".."));
export const imagePath = z
  .string()
  .regex(/^\/images\/[a-z0-9][a-z0-9_-]*\.(?:webp|png|jpg|jpeg|avif)$/);

const base = z.object({
  slug: slugSchema,
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(20).max(500),
  body: text,
  seoTitle: z.string().trim().min(3).max(160).optional(),
  seoDescription: z.string().trim().min(20).max(300).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  publishedAt: z.iso.datetime({ offset: true }).optional(),
  category: taxonomy.optional(),
  tags: z.array(taxonomy).max(20).default([]),
  relatedSlugs: z.array(slugSchema).max(20).default([]),
  images: z
    .array(
      z
        .object({
          path: imagePath,
          alt: label,
          width: z.number().int().min(1).max(8000),
          height: z.number().int().min(1).max(8000),
        })
        .strict(),
    )
    .max(12)
    .default([]),
});

export const contentSchema = z
  .discriminatedUnion("kind", [
    base
      .extend({
        kind: z.literal("PROJECT"),
        project: z
          .object({
            problem: text,
            objective: text,
            architecture: text,
            securityConsiderations: text,
            challenges: text,
            solution: text,
            result: text,
            lessonsLearned: text,
            technologies: list,
            repositoryUrl: httpsUrl.optional(),
            liveUrl: httpsUrl.optional(),
            projectStatus: label,
          })
          .strict(),
      })
      .strict(),
    base
      .extend({
        kind: z.literal("LAB"),
        lab: z
          .object({
            environment: label,
            objective: text,
            tools: list,
            methodology: text,
            discovery: text,
            analysis: text,
            impact: text,
            remediation: text,
            lessonsLearned: text,
            difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
            authorized: z.literal(true),
          })
          .strict(),
      })
      .strict(),
    base
      .extend({
        kind: z.literal("RESEARCH"),
        research: z
          .object({ references: z.array(httpsUrl).max(50).default([]) })
          .strict(),
      })
      .strict(),
    base
      .extend({
        kind: z.literal("CTF"),
        ctf: z
          .object({
            eventName: label,
            eventDate: z.iso.datetime({ offset: true }),
            location: label.optional(),
            placement: label.optional(),
            challengesSolved: list,
            categories: list,
            lessonsLearned: text,
          })
          .strict(),
      })
      .strict(),
    base
      .extend({
        kind: z.literal("RESOURCE"),
        resource: z
          .object({
            type: label,
            filePath: resourcePath,
            topic: label,
            version: label,
          })
          .strict(),
      })
      .strict(),
  ])
  .superRefine((entry, ctx) => {
    if (entry.status === "PUBLISHED" && !entry.publishedAt)
      ctx.addIssue({
        code: "custom",
        path: ["publishedAt"],
        message: "Published content needs a real publication date",
      });
    if (entry.relatedSlugs.includes(entry.slug))
      ctx.addIssue({
        code: "custom",
        path: ["relatedSlugs"],
        message: "An entry cannot relate to itself",
      });
  });
export type ContentInput = z.infer<typeof contentSchema>;

export const filterSchema = z.object({
  q: z.string().trim().max(120).default(""),
  category: z.union([slugSchema, z.literal("")]).default(""),
  tag: z.union([slugSchema, z.literal("")]).default(""),
  technology: z.string().trim().max(80).default(""),
  year: z
    .union([z.string().regex(/^(19|20)\d{2}$/), z.literal("")])
    .default(""),
  difficulty: z.enum(["", "BEGINNER", "INTERMEDIATE", "ADVANCED"]).default(""),
  page: z.coerce.number().int().min(1).max(10000).default(1),
});
export type Filters = z.infer<typeof filterSchema>;
export function parseFilters(
  input: Record<string, string | string[] | undefined>,
) {
  return filterSchema.safeParse(input);
}

export const loginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(200),
});

export function isPublished(
  entry: { status: string; publishedAt: Date | null },
  now = new Date(),
) {
  return (
    entry.status === "PUBLISHED" &&
    !!entry.publishedAt &&
    entry.publishedAt <= now
  );
}
export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
export function safeLink(value: string | null | undefined) {
  return value && httpsUrl.safeParse(value).success ? value : undefined;
}
