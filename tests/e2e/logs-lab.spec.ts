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
    page
      .locator("#forensics")
      .getByRole("link", { name: /Logs and artefacts/ }),
  ).toHaveAttribute("href", "/intermediate/logs");
  await page.goto("/intermediate/logs");
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
       VALUES ($1, 'Log Pupil', 'intermediate', $2, now())`,
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

  test("grep the auth log and read three epochs", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/logs#lesson/2");
    const out = page.locator(".lg-out");
    await page.getByLabel("Pattern").fill("Accepted");
    await expect(out).toContainText(
      "Accepted password for root from 203.0.113.7",
    );
    await page.getByLabel("Pattern").fill("new user");
    await expect(out).toContainText("name=sysbackup, UID=0");
    await page.getByLabel("The attacker’s IP address").fill("203.0.113.7");
    await page.getByLabel("The account they created").fill("sysbackup");
    await expect(page.locator(".nl-card .nl-pass")).toBeVisible();
    await pass(page);
    await audit(page, "grep");

    await page.goto("/intermediate/logs#lesson/5");
    const cards = page.locator(".ev-copy");
    await cards.nth(0).getByLabel("Unix milliseconds").check();
    await expect(cards.nth(0).locator(".cb-out")).toContainText("1970-01-21");
    await cards.nth(0).getByLabel("Unix seconds").check();
    await cards.nth(1).getByLabel("Unix milliseconds").check();
    await cards.nth(2).getByLabel("Chrome / WebKit").check();
    await expect(cards.nth(2).locator(".cb-out")).toContainText(
      "2026-10-03T02:14:07Z",
    );
    await pass(page);
    await audit(page, "epoch");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/logs");
  await expect(page).toHaveTitle(/Loglar va artefaktlar/);
});
