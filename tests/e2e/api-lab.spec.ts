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
    page.locator("#webappsec").getByRole("link", { name: /API security/ }),
  ).toHaveAttribute("href", "/intermediate/api");
  await page.goto("/intermediate/api");
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
       VALUES ($1, 'Api Pupil', 'intermediate', $2, now())`,
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

  test("a reply, a mass assignment and a rate limit", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/api#lesson/1");
    const reply = page.locator(".ui-query");
    await expect(reply).toContainText("passwordHash");
    for (const field of ["email", "phone", "passwordHash", "isAdmin"])
      await page.getByLabel(field, { exact: true }).uncheck();
    await expect(reply).not.toContainText("passwordHash");
    await expect(page.locator(".nl-card .nl-fail")).toHaveCount(0);
    await pass(page);
    await audit(page, "fields");

    await page.goto("/intermediate/api#lesson/2");
    await page
      .getByLabel("Request body")
      .fill('{"name": "Ali", "role": "admin"}');
    await expect(page.locator(".ac-reply")).toContainText(
      "a field only the server may set",
    );
    await page.getByLabel("Read only name and bio (allowlist)").check();
    await expect(page.locator(".ac-reply")).toContainText("Ignored: role");
    await pass(page);
    await audit(page, "mass assignment");

    await page.goto("/intermediate/api#lesson/4");
    await page.getByLabel("5", { exact: true }).check();
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(1);
    await page.getByLabel("Account", { exact: true }).check();
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "rate limit");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/api");
  await expect(page).toHaveTitle(/API xavfsizligi/);
});
