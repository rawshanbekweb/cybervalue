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
    page.locator("#appsec").getByRole("link", { name: /Secure coding/ }),
  ).toHaveAttribute("href", "/intermediate/securecode");
  await page.goto("/intermediate/securecode");
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
       VALUES ($1, 'Coder Pupil', 'intermediate', $2, now())`,
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

  test("beat the denylist and fix the handler", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/securecode#lesson/2");
    for (const input of [
      "<ScRiPt>alert(1)</ScRiPt>",
      "<img src=x onerror=alert(1)>",
    ])
      await page
        .getByLabel(`${input} gets past the denylist`, { exact: true })
        .check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText("Mixed case");
    await pass(page);
    await audit(page, "filter");

    await page.goto("/intermediate/securecode#lesson/3");
    const fixes: [number, string][] = [
      [3, "Read the key from an environment variable or secret store"],
      [8, "A parameterised query"],
      [12, "Never log the password"],
      [15, "Validate against a schema (allowed fields only)"],
      [19, "A generic message for the user, details to the log"],
    ];
    await page.getByLabel("Fix for line 8").selectOption({
      label: "Never log the password",
    });
    await expect(page.locator(".sd-bad")).toHaveCount(1);
    for (const [no, label] of fixes)
      await page.getByLabel(`Fix for line ${no}`).selectOption({ label });
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "Five holes closed",
    );
    await pass(page);
    await audit(page, "fix");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/securecode");
  await expect(page).toHaveTitle(/Xavfsiz kod/);
});
