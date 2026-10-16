import { createHash, randomBytes, randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { Client } from "pg";

// Academy Junior is behind access codes. Tests create a fresh member straight
// in the database (the admin flow is covered in junior-admin.spec.ts), so each
// test starts with empty progress.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const needsDatabase = () =>
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");

export async function createJunior({
  name = "Test Agent",
  group = "",
  progress = {},
  xp = 0,
}: {
  name?: string;
  group?: string;
  progress?: object;
  xp?: number;
} = {}) {
  const code = [...randomBytes(8)].map((b) => ALPHABET[b & 31]).join("");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const id = `e2e_${randomUUID()}`;
    await client.query(
      `INSERT INTO "JuniorMember"
         (id, name, "group", "codeHash", progress, xp, "lastActiveAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $6::int > 0 THEN now() END, now())`,
      [
        id,
        name,
        group,
        createHash("sha256").update(code).digest("hex"),
        JSON.stringify(progress),
        xp,
      ],
    );
    return { id, code };
  } finally {
    await client.end();
  }
}

/** Creates a member and signs the page in with their code. */
export async function signInJunior(
  page: Page,
  options?: Parameters<typeof createJunior>[0],
) {
  const member = await createJunior(options);
  await page.goto("/playground/junior");
  await enterCode(page, member.code);
  return member;
}

export async function enterCode(page: Page, code: string) {
  await page.getByLabel(/Access code|Kirish kodi/).fill(code);
  await page.getByRole("button", { name: /^(Enter|Kirish)$/ }).click();
  await expect(page.locator(".jr-topbar")).toBeVisible();
}
