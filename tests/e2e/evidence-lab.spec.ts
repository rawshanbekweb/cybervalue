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
    page.locator("#forensics").getByRole("link", { name: /Handling evidence/ }),
  ).toHaveAttribute("href", "/intermediate/evidence");
  await page.goto("/intermediate/evidence");
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
       VALUES ($1, 'Evidence Pupil', 'intermediate', $2, now())`,
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

  test("an acquisition, the copies and the custody log", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/evidence#lesson/3");
    await expect(page.locator(".ev-problems li")).toHaveCount(5);
    for (const name of [
      "write blocker",
      "Hash the original disk",
      "bit-for-bit image",
      "Hash the image",
      "Analyse a copy",
    ])
      await page.getByLabel(name).check();
    await expect(page.locator(".ac-reply")).toHaveClass(/ok/);
    await pass(page);
    await audit(page, "acquire");

    await page.goto("/intermediate/evidence#lesson/5");
    const copies = page.locator(".ev-copy");
    await copies.nth(0).getByLabel("Intact").check();
    await copies.nth(1).getByLabel("Altered").check();
    await copies.nth(2).getByLabel("Intact").check();
    await copies.nth(3).getByLabel("Altered").check();
    await pass(page);
    await audit(page, "hashes");

    await page.goto("/intermediate/evidence#lesson/6");
    await page.getByLabel(/03\.10 16:40/).check();
    await expect(page.locator(".nl-card .nl-fail")).toBeVisible();
    await page.getByLabel(/05\.10 09:15/).check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText("Two days");
    await pass(page);
    await audit(page, "custody");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/evidence");
  await expect(page).toHaveTitle(/Dalil bilan ishlash/);
});
