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

async function signIn(page: Page, as: string, secret: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(as);
  await page.getByLabel("Password").fill(secret);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test.describe("team and teacher roles", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );
  test.describe.configure({ mode: "serial" });

  const id = Date.now().toString(36);
  const mine = `own-${id}`;
  const other = `other-${id}`;
  const teacherEmail = `teacher-${id}@example.com`;
  const ownStudent = `e2e_${randomUUID()}`;
  const otherStudent = `e2e_${randomUUID()}`;
  let teacherPassword = "";

  test.beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    for (const [sid, name, group] of [
      [ownStudent, `Own Pupil ${id}`, mine],
      [otherStudent, `Other Pupil ${id}`, other],
    ])
      await client.query(
        `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash")
         VALUES ($1, $2, $3, now(), $4)`,
        [sid, name, group, createHash("sha256").update(sid).digest("hex")],
      );
    await client.end();
  });

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = ANY($1)`, [
      [ownStudent, otherStudent],
    ]);
    await client.query(`DELETE FROM "User" WHERE email = $1`, [teacherEmail]);
    await client.end();
  });

  test("the owner adds a teacher with one group", async ({ page }) => {
    await signIn(page, email!, password!);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/team");
    await expect(
      page.getByRole("heading", { name: "Team", exact: true }),
    ).toBeVisible();
    await page.locator("#staff-name").fill("Test Teacher");
    await page.locator("#staff-email").fill(teacherEmail);
    await page.locator("#staff-role").selectOption("teacher");
    await page.locator("#staff-groups").fill(mine);
    await page.getByRole("button", { name: "Create account" }).click();
    const field = page.getByLabel("One-time password");
    await expect(field).toBeVisible();
    teacherPassword = await field.inputValue();
    expect(teacherPassword).toHaveLength(16);
    await audit(page, "team page");

    await page.goto("/admin/groups");
    const row = page.getByRole("row", { name: new RegExp(mine) });
    await expect(row).toContainText("Test Teacher");
    await audit(page, "groups page");
  });

  test("the teacher sees only their group", async ({ page }) => {
    await signIn(page, teacherEmail, teacherPassword);
    await expect(page).toHaveURL(/\/admin$/);
    const nav = page.getByRole("navigation", { name: "Admin sections" });
    await expect(
      nav.getByRole("link", { name: "Groups", exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Settings", exact: true }),
    ).toHaveCount(0);
    await expect(
      nav.getByRole("link", { name: "Team", exact: true }),
    ).toHaveCount(0);

    await page.goto("/admin/students");
    await expect(page.getByText(`Own Pupil ${id}`)).toBeVisible();
    await expect(page.getByText(`Other Pupil ${id}`)).toHaveCount(0);

    for (const path of [
      "/admin/settings",
      "/admin/team",
      "/admin/cleanup",
      "/admin/users",
      `/admin/students/${otherStudent}`,
    ]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
    const own = await page.goto(`/admin/students/${ownStudent}`);
    expect(own?.status()).toBe(200);

    await page.goto("/admin/students");
    await page.getByLabel(/One student per line/).fill(`Sneaky Add | ${other}`);
    await page.getByRole("button", { name: /Create/ }).click();
    await expect(page.locator(".admin-error")).toContainText(
      "You can only add people to your own groups",
    );

    await page.goto("/admin/groups");
    await expect(
      page.getByRole("row", { name: new RegExp(mine) }),
    ).toBeVisible();
    await expect(page.getByText(other)).toHaveCount(0);
  });

  test("a switched-off teacher cannot sign in", async ({ page, browser }) => {
    await signIn(page, email!, password!);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/team");
    const row = page.locator(`details[data-email="${teacherEmail}"]`);
    await row.locator("summary").click();
    await row.getByLabel(/Can sign in/).uncheck();
    await row.getByRole("button", { name: "Save" }).click();
    await expect(row.getByRole("status")).toContainText("Saved.");

    const context = await browser.newContext({ storageState: english });
    const teacher = await context.newPage();
    await signIn(teacher, teacherEmail, teacherPassword);
    await expect(teacher.locator(".admin-error")).toBeVisible();
    await expect(teacher).toHaveURL(/\/admin\/login/);
    await context.close();
  });
});
