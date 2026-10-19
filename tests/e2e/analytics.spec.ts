import { createHash, randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";

// Assertions use the English interface copy.
const english = {
  cookies: [
    {
      name: "cybervalue-locale",
      value: "en",
      domain: "localhost",
      path: "/",
      expires: -1,
      httpOnly: true,
      secure: false,
      sameSite: "Lax" as const,
    },
  ],
  origins: [],
};
test.use({ storageState: english });

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

async function audit(page: Page, label: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
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

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe("analytics", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );

  const id = Date.now().toString(36);
  const group = `an-${id}`;
  const studentId = `e2e_${randomUUID()}`;
  const kidId = `e2e_${randomUUID()}`;

  test.beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash", "lastLoginAt")
       VALUES ($1, $2, $3, now(), $4, now())`,
      [
        studentId,
        `Chart Pupil ${id}`,
        group,
        createHash("sha256").update(studentId).digest("hex"),
      ],
    );
    // Two checkpoint attempts this week, one passed (9/12 = 75%).
    for (const [score, seed] of [
      [9, 1],
      [5, 2],
    ])
      await client.query(
        `INSERT INTO "StudentCheckpoint" (id, "studentId", checkpoint, seed, score, total, "createdAt")
         VALUES ($1, $2, 'network-1', $3, $4, 12, now() - interval '1 hour')`,
        [`e2e_${randomUUID()}`, studentId, seed, score],
      );
    await client.query(
      `INSERT INTO "KidsMember" (id, name, "group", "codeHash", "updatedAt", xp)
       VALUES ($1, $2, $3, $4, now(), 40)`,
      [
        kidId,
        `Chart Kid ${id}`,
        group,
        createHash("sha256").update(kidId).digest("hex"),
      ],
    );
    await client.query(
      `INSERT INTO "ActivityDay" (kind, "memberId", day, events)
       VALUES ('kids', $1, (now() AT TIME ZONE 'Asia/Tashkent')::date, 3)`,
      [kidId],
    );
    await client.end();
  });

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = $1`, [studentId]);
    await client.query(`DELETE FROM "KidsMember" WHERE id = $1`, [kidId]);
    await client.query(`DELETE FROM "ActivityDay" WHERE "memberId" = $1`, [
      kidId,
    ]);
    await client.end();
  });

  test("the analytics page shows the week, 12 weeks and the groups", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/analytics");
    await expect(
      page.getByRole("heading", { level: 1, name: "Analytics" }),
    ).toBeVisible();
    await expect(page.locator(".admin-stat")).toHaveCount(4);
    await expect(
      page
        .locator(".admin-stat")
        .filter({ hasText: "Checkpoints passed" })
        .locator("strong"),
    ).not.toHaveText("0");
    await expect(page.locator(".admin-chart")).toHaveCount(3);
    const row = page.getByRole("row", { name: new RegExp(group) });
    // One student and one Kids member, both active this week.
    await expect(row).toContainText("2 · 100%");
    await expect(row).toContainText("40");
    await audit(page, "analytics");
    await page.screenshot({
      path: test.info().outputPath("analytics.png"),
      fullPage: true,
    });
  });

  test("learner pages show their activity history", async ({ page }) => {
    await signIn(page);
    await page.goto(`/admin/students/${studentId}`);
    const history = page.getByRole("region", { name: "Activity history" });
    await expect(history.getByText("Checkpoint attempt").first()).toBeVisible();
    await expect(history).toContainText("9/12");
    await expect(history).toContainText("1 active days in the last 12 weeks");
    await audit(page, "student history");
    await history.screenshot({ path: test.info().outputPath("history.png") });

    await page.goto(`/admin/kids/${kidId}`);
    await expect(
      page.getByText("1 active days in the last 12 weeks"),
    ).toBeVisible();
    await expect(page.locator(".admin-heat-grid .level-4")).toHaveCount(1);
  });
});
