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
        if (!URL.canParse(v)) return false;
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
    const url = URL.canParse(env.SITE_URL) ? new URL(env.SITE_URL) : null;
    if (
      env.SITE_INDEXABLE &&
      (!url ||
        url.protocol !== "https:" ||
        ["localhost", "127.0.0.1"].includes(url.hostname))
    )
      ctx.addIssue({
        code: "custom",
        path: ["SITE_URL"],
        message: "Indexable sites require a public HTTPS origin",
      });
  });
const result = schema.safeParse(process.env);
if (!result.success) {
  const names = [...new Set(result.error.issues.map((i) => i.path.join(".")))];
  let hint = names.includes("SITE_URL")
    ? " Set SITE_URL to a complete HTTP(S) origin (for production, e.g. https://datalife.uz), without a path, query, or credentials."
    : "";
  if (
    names.some((name) =>
      ["GITHUB_URL", "LINKEDIN_URL", "TELEGRAM_URL", "INSTAGRAM_URL"].includes(
        name,
      ),
    )
  )
    hint +=
      " Social profile URLs must start with https:// and contain no credentials; leave unused values empty.";
  throw new Error(
    `Invalid environment configuration: ${names.join(", ")}.${hint}`,
  );
}
export const env = result.data;
