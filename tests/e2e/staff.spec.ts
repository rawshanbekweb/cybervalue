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
  const adminEmail = `admin-${id}@example.com`;
  let adminPassword = "";
  const ownStudent = `e2e_${randomUUID()}`;
  const otherStudent = `e2e_${randomUUID()}`;
  const practice = `e2e_${randomUUID()}`;
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
    // A practice task both pupils answered, for the grading queue.
    await client.query(
      `INSERT INTO "StudentMaterial" (id, slug, kind, title, "updatedAt")
       VALUES ($1, $2, 'PRACTICE', $3, now())`,
      [practice, `e2e-practice-${id}`, `Scope practice ${id}`],
    );
    for (const sid of [ownStudent, otherStudent])
      await client.query(
        `INSERT INTO "StudentSubmission" (id, "studentId", "materialId", body)
         VALUES ($1, $2, $3, $4)`,
        [randomUUID(), sid, practice, `Answer from ${sid}`],
      );
    await client.end();
  });

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = ANY($1)`, [
      [ownStudent, otherStudent],
    ]);
    await client.query(`DELETE FROM "StudentMaterial" WHERE id = $1`, [
      practice,
    ]);
    await client.query(`DELETE FROM "User" WHERE email = ANY($1)`, [
      [teacherEmail, adminEmail],
    ]);
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

    await page.goto("/teacher/groups");
    const row = page.getByRole("row", { name: new RegExp(mine) });
    await expect(row).toContainText("Test Teacher");
    await audit(page, "groups page");
  });

  test("the teacher sees only their group", async ({ page }) => {
    await signIn(page, teacherEmail, teacherPassword);
    await expect(page).toHaveURL(/\/teacher$/);
    const nav = page.getByRole("navigation", { name: "Admin sections" });
    await expect(
      nav.getByRole("link", { name: "Groups", exact: true }),
    ).toBeVisible();
    for (const name of ["Site settings", "Team", "All users"])
      await expect(nav.getByRole("link", { name, exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Admin panel" })).toHaveCount(
      0,
    );
    await audit(page, "teacher dashboard");

    // The admin panel is not theirs: every page there leads to /teacher.
    for (const path of [
      "/admin",
      "/admin/settings",
      "/admin/team",
      "/admin/cleanup",
      "/admin/users",
    ]) {
      await page.goto(path);
      await expect(page, path).toHaveURL(/\/teacher$/);
    }
    // Old links to moved pages still work.
    await page.goto("/admin/students");
    await expect(page).toHaveURL(/\/teacher\/students$/);

    await page.goto("/teacher/students");
    await expect(page.getByText(`Own Pupil ${id}`)).toBeVisible();
    await expect(page.getByText(`Other Pupil ${id}`)).toHaveCount(0);

    const outside = await page.goto(`/teacher/students/${otherStudent}`);
    expect(outside?.status()).toBe(404);
    const own = await page.goto(`/teacher/students/${ownStudent}`);
    expect(own?.status()).toBe(200);

    await page.goto("/teacher/students");
    await page.getByLabel(/One student per line/).fill(`Sneaky Add | ${other}`);
    await page.getByRole("button", { name: /Create/ }).click();
    await expect(page.locator(".admin-error")).toContainText(
      "You can only add people to your own groups",
    );

    await page.goto("/teacher/groups");
    await expect(
      page.getByRole("row", { name: new RegExp(mine) }),
    ).toBeVisible();
    await expect(page.getByText(other)).toHaveCount(0);

    // Grading and the material's answers hold the own group only.
    for (const path of [
      `/teacher/grading?material=${practice}`,
      `/teacher/materials/${practice}`,
    ]) {
      await page.goto(path);
      await expect(page.getByText(`Answer from ${ownStudent}`)).toBeVisible();
      await expect(page.getByText(`Answer from ${otherStudent}`)).toHaveCount(
        0,
      );
    }
    await audit(page, "grading queue");
  });

  test("an admin runs the site but cannot manage owners or admins", async ({
    page,
    browser,
  }) => {
    await signIn(page, email!, password!);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/team");
    await page.locator("#staff-name").fill("Test Admin");
    await page.locator("#staff-email").fill(adminEmail);
    await page.locator("#staff-role").selectOption("admin");
    await page.getByRole("button", { name: "Create account" }).click();
    const field = page.getByLabel("One-time password");
    await expect(field).toBeVisible();
    adminPassword = await field.inputValue();

    const context = await browser.newContext({ storageState: english });
    const admin = await context.newPage();
    await signIn(admin, adminEmail, adminPassword);
    await expect(admin).toHaveURL(/\/admin$/);
    const nav = admin.getByRole("navigation", { name: "Admin sections" });
    await expect(
      nav.getByRole("link", { name: "Site settings", exact: true }),
    ).toBeVisible();
    await audit(admin, "admin dashboard");

    // Teaching is one click away, with every group in sight.
    await admin.getByRole("link", { name: "Teacher panel" }).first().click();
    await expect(admin).toHaveURL(/\/teacher$/);
    await admin.goto("/teacher/students");
    await expect(admin.getByText(`Own Pupil ${id}`)).toBeVisible();
    await expect(admin.getByText(`Other Pupil ${id}`)).toBeVisible();

    // Only teachers can be added, and owners are read-only.
    await admin.goto("/admin/team");
    await expect(admin.locator("#staff-role option[value=admin]")).toHaveCount(
      0,
    );
    const ownerRow = admin.locator(`details[data-email="${email}"]`);
    await ownerRow.locator("summary").click();
    await expect(
      ownerRow.getByText("Only an owner can manage owners and admins."),
    ).toBeVisible();
    await expect(ownerRow.getByRole("button", { name: "Save" })).toHaveCount(0);
    await context.close();
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
