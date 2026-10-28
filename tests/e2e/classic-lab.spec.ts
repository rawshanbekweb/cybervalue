import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";

test.use({
  storageState: {
    cookies: [
      {
        name: "cybervalue-locale",
        value: "en",
        domain: "localhost",
        path: "/",
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ],
    origins: [],
  },
});

const newCode = () =>
  [...randomBytes(16)]
    .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
    .join("");

async function audit(page: Page, label: string) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    label,
  ).toEqual([]);
}

async function pass(page: Page) {
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".nl-task .nl-pass")).toContainText(
    "Lesson completed",
  );
}

test("the module is on the roadmap and locked for visitors", async ({
  page,
}) => {
  await page.goto("/intermediate");
  await expect(
    page.locator("#crypto").getByRole("link", { name: /Classical ciphers/ }),
  ).toHaveAttribute("href", "/intermediate/classic");
  await page.goto("/intermediate/classic");
  await expect(
    page.getByRole("heading", { name: "This lab is part of Intermediate." }),
  ).toBeVisible();
});

test.describe("an Intermediate student", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");
  const id = randomUUID();
  const code = newCode();

  test.beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "Student" (id, name, level, "codeHash", "updatedAt")
       VALUES ($1, 'Cipher Pupil', 'intermediate', $2, now())`,
      [id, createHash("sha256").update(code).digest("hex")],
    );
    await client.end();
  });

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = $1`, [id]);
    await client.end();
  });

  test("Caesar by every key and by counting, Vigenère by its first word", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/classic#lesson/1");
    await page.getByRole("button", { name: "Show every shift" }).click();
    await page.getByRole("button", { name: /^7 uchrashuv/ }).click();
    await expect(page.locator(".cc-text.ok")).toContainText("uchrashuv soat");
    await pass(page);
    await audit(page, "caesar");

    await page.goto("/intermediate/classic#lesson/3");
    await page
      .getByLabel("The cipher letter that stands for “a”")
      .selectOption("l");
    await expect(page.locator(".cc-text.ok")).toContainText(
      "parolni hech kimga",
    );
    await pass(page);
    await audit(page, "frequency");

    await page.goto("/intermediate/classic#lesson/5");
    await page.getByLabel("The word you think it starts with").fill("salom");
    await expect(page.locator(".cb-out")).toContainText("kalit");
    await page.getByLabel("Key", { exact: true }).fill("kalit");
    await expect(page.locator(".cc-text.ok")).toContainText("salom dostim");
    await pass(page);
    await audit(page, "vigenere");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/classic");
  await expect(page).toHaveTitle(/Klassik shifrlar/);
});
