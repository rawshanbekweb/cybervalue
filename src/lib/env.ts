import { z } from "zod";
import { httpsUrl } from "./validation";

const optional = (schema: z.ZodType<string>) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    schema.optional(),
  );
const schema = z
  .object({
    DATABASE_URL: optional(
      z.url().refine((v) => /^postgres(?:ql)?:\/\//.test(v)),
    ),
    SITE_URL: z
      .url()
      .default("http://localhost:3000")
      .refine((v) => {
        const url = new URL(v);
        return (
          ["http:", "https:"].includes(url.protocol) &&
          url.pathname === "/" &&
          !url.search &&
          !url.hash &&
          !url.username &&
          !url.password
        );
      }, "SITE_URL must be an HTTP(S) origin"),
    SITE_INDEXABLE: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    GITHUB_URL: optional(httpsUrl),
    LINKEDIN_URL: optional(httpsUrl),
    TELEGRAM_URL: optional(httpsUrl),
    INSTAGRAM_URL: optional(httpsUrl),
  })
  .superRefine((env, ctx) => {
    if (
      env.SITE_INDEXABLE &&
      (!env.SITE_URL.startsWith("https://") ||
        ["localhost", "127.0.0.1"].includes(new URL(env.SITE_URL).hostname))
    )
      ctx.addIssue({
        code: "custom",
        path: ["SITE_URL"],
        message: "Indexable sites require a public HTTPS origin",
      });
  });
const result = schema.safeParse(process.env);
if (!result.success)
  throw new Error(
    `Invalid environment configuration: ${result.error.issues.map((i) => i.path.join(".")).join(", ")}`,
  );
export const env = result.data;
