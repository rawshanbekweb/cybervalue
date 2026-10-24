import { createHash, randomBytes, randomUUID } from "node:crypto";
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

const newCode = () =>
  [...randomBytes(16)]
    .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
    .join("");

test.describe("teacher tools", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );
  test.describe.configure({ mode: "serial" });

  const id = Date.now().toString(36);
  const group = `tt-${id}`;
  const code = newCode();
  const studentId = `e2e_${randomUUID()}`;
  let materialUrl = "";

  test.beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      // Joined a month ago, so last week's deadlines apply to her.
      `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash", "createdAt")
       VALUES ($1, 'Dana Tester', $2, now(), $3, now() - interval '30 days')`,
      [studentId, group, createHash("sha256").update(code).digest("hex")],
    );
    await client.end();
  });

  test("a test is built question by question and analysed per question", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/teacher/materials");
    await page.getByRole("link", { name: "New test" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "New test" }),
    ).toBeVisible();
    await page.getByLabel("Title", { exact: true }).fill(`Built test ${id}`);
    await page.getByLabel("Slug").fill(`e2e-built-${id}`);
    await page.getByLabel("Groups (comma-separated)").fill(group);

    await page
      .getByLabel("Question 1", { exact: true })
      .fill("Default HTTPS port?");
    await page.getByLabel("Question 1, option A").fill("80");
    await page.getByLabel("Question 1, option B").fill("443");
    await page.getByLabel("Question 1, option C").fill("22");
    // Option D stays empty and is dropped.
    await page
      .getByRole("radio", { name: "Option B is correct" })
      .first()
      .check();
    await page.getByRole("button", { name: "Add question" }).click();
    await page
      .getByLabel("Question 2", { exact: true })
      .fill("What does a gateway do?");
    await page
      .getByLabel("Question 2, option A")
      .fill("Routes to other networks");
    await page.getByLabel("Question 2, option B").fill("Stores passwords");
    await expect(page.getByText("2 questions · 2 ready")).toBeVisible();
    await audit(page, "test builder");

    // The text view shows the same questions in the old format.
    await page.getByRole("button", { name: "Text", exact: true }).click();
    await expect(page.getByLabel("Questions as text")).toHaveValue(
      "? Default HTTPS port?\n- 80\n+ 443\n- 22\n\n? What does a gateway do?\n+ Routes to other networks\n- Stores passwords",
    );
    await page.getByRole("button", { name: "Editor", exact: true }).click();

    await page.getByLabel("Visible to students").check();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Material created.")).toBeVisible();
    materialUrl = page.url();
    await expect(page.getByLabel("Question 1, option B")).toHaveValue("443");
    await expect(page.getByLabel("Question 1, option D")).toHaveCount(0);

    // Three attempts: question 1 is mostly wrong (two chose 80).
    const materialId = new URL(materialUrl).pathname.split("/").pop();
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    for (const answers of [
      [0, 0],
      [0, 0],
      [1, null],
    ])
      await client.query(
        `INSERT INTO "StudentSubmission" (id, "studentId", "materialId", answers, score, "maxScore")
         VALUES ($1, $2, $3, $4, 0, 2)`,
        [`e2e_${randomUUID()}`, studentId, materialId, JSON.stringify(answers)],
      );
    await client.end();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Question analysis" }),
    ).toBeVisible();
    await expect(page.getByText("Based on 3 attempts.")).toBeVisible();
    const stats = page.locator(".admin-question-stats tbody tr");
    await expect(stats.nth(0)).toContainText("67%");
    await expect(stats.nth(0)).toContainText("80 (2)");
    await expect(stats.nth(1)).toContainText("33%");
    await audit(page, "question analysis");
  });

  test("assignments show to the group and missed ones reach the class panel", async ({
    page,
    browser,
  }) => {
    await signIn(page);
    await page.getByRole("link", { name: "Teacher panel" }).first().click();
    await expect(page).toHaveURL(/\/teacher$/);
    await page
      .getByRole("navigation", { name: "Admin sections" })
      .getByRole("link", { name: "Assignments" })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Assignments" }),
    ).toBeVisible();
    await page.getByLabel("Title", { exact: true }).fill(`Finish test ${id}`);
    await page.getByLabel("Group").first().selectOption(group);
    await page
      .getByLabel("What to do")
      .selectOption({ label: `Built test ${id} · Test` });
    await page.getByLabel("Note for students").fill("Read lesson 6 first.");
    await page.getByRole("button", { name: "Create assignment" }).click();
    await expect(page.getByRole("status")).toHaveText("Assignment created.");
    await audit(page, "assignments");

    // One more, already past its deadline.
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "StudentAssignment" (id, title, "group", target, "dueAt")
       VALUES ($1, $2, $3, 'checkpoint:linux-1', now() - interval '2 days')`,
      [`e2e_${randomUUID()}`, `Linux check ${id}`, group],
    );
    // A classmate who joined today: last week's deadline is not theirs.
    await client.query(
      `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash")
       VALUES ($1, 'New Joiner', $2, now(), $3)`,
      [`e2e_${randomUUID()}`, group, randomUUID()],
    );
    await client.end();

    const student = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await student.goto("/student/login");
    await student.getByLabel("Access code").fill(code);
    await student.getByRole("button", { name: "Enter" }).click();
    await expect(student).toHaveURL(/\/student$/);
    const section = student.locator("#assignments");
    await expect(section).toContainText("1 to hand in this week");
    // The test was already handed in (the seeded attempts), so it is done.
    const done = section.getByRole("link", {
      name: new RegExp(`Finish test ${id}`),
    });
    await expect(done).toContainText("Done");
    await expect(done).toContainText("Read lesson 6 first.");
    const missed = section.getByRole("link", {
      name: new RegExp(`Linux check ${id}`),
    });
    await expect(missed).toContainText("Missed");
    await expect(missed).toHaveAttribute(
      "href",
      "/akademiya/linux-basics#checkpoints",
    );
    await student.context().close();

    await page.goto(`/teacher/class?group=${group}`);
    await expect(page.locator(".admin-attention")).toContainText(
      "Missed an assignment deadline",
    );
    const row = page.locator("tr", { hasText: `Linux check ${id}` });
    await expect(row).toContainText("0/1");
    await expect(row.getByRole("link", { name: "Dana Tester" })).toBeVisible();
    await expect(row.getByRole("link", { name: "New Joiner" })).toHaveCount(0);
    await expect(
      page.locator("tr", { hasText: `Finish test ${id}` }),
      // The new classmate has the upcoming one to do too.
    ).toContainText("1/2");
  });
});
