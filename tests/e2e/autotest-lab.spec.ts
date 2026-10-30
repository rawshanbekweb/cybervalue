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
    page.locator("#appsec").getByRole("link", { name: /Automated testing/ }),
  ).toHaveAttribute("href", "/intermediate/autotest");
  await page.goto("/intermediate/autotest");
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
       VALUES ($1, 'Pipeline Pupil', 'intermediate', $2, now())`,
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

  test("triage the findings and place the checks", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/autotest#lesson/3");
    const real = [true, true, false, false, true, false];
    const items = page.locator(".sc-line");
    await expect(items).toHaveCount(6);
    await items.nth(2).getByLabel("Real problem").check();
    await expect(page.locator(".sd-bad")).toHaveCount(1);
    for (let i = 0; i < real.length; i++)
      await items
        .nth(i)
        .getByLabel(real[i] ? "Real problem" : "False alarm")
        .check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "Three to fix",
    );
    await pass(page);
    await audit(page, "triage");

    await page.goto("/intermediate/autotest#lesson/6");
    const picks: [string, string][] = [
      ["An AWS access key left in a commit", "Secret scanning"],
      ["lodash 4.17.15 in package-lock.json", "SCA — checks dependencies"],
      ["A SQL query built by joining strings", "SAST — reads the code"],
      [
        "The staging site sends no Content-Security-Policy header",
        "DAST — probes the running site",
      ],
      [
        "The login cookie comes back without HttpOnly and Secure",
        "DAST — probes the running site",
      ],
    ];
    for (const [problem, label] of picks)
      await page.getByLabel(problem).selectOption({ label });
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "Every layer has its job",
    );
    await pass(page);
    await audit(page, "pipeline");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/autotest");
  await expect(page).toHaveTitle(/Avtomatik xavfsizlik/);
});
