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

async function sql<T = Record<string, unknown>>(
  query: string,
  values: unknown[] = [],
) {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return (await client.query(query, values)).rows as T[];
  } finally {
    await client.end();
  }
}

test.describe("trash", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );
  test.describe.configure({ mode: "serial" });

  const id = Date.now().toString(36);
  const studentId = `e2e_${randomUUID()}`;
  const studentName = `Trash Pupil ${id}`;
  const contentId = `e2e_${randomUUID()}`;
  const contentTitle = `Trash research ${id}`;
  const tagId = `e2e_${randomUUID()}`;
  const assignmentTitle = `Trash task ${id}`;

  test.beforeAll(async () => {
    await sql(
      `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash", "reportToken")
       VALUES ($1, $2, 'trash-g', now(), $3, $4)`,
      [
        studentId,
        studentName,
        createHash("sha256").update(studentId).digest("hex"),
        `rt_${id}`,
      ],
    );
    await sql(
      `INSERT INTO "StudentCheckpoint" (id, "studentId", checkpoint, seed, score, total)
       VALUES ($1, $2, 'network-1', 7, 4, 5)`,
      [`e2e_${randomUUID()}`, studentId],
    );
    await sql(
      `INSERT INTO "TelegramChat" (id, "chatId", subject) VALUES ($1, $2, $3)`,
      [`e2e_${randomUUID()}`, `chat-${id}`, `parent:student:${studentId}`],
    );
    const [admin] = await sql<{ id: string }>(
      `SELECT id FROM "User" WHERE email = $1`,
      [email],
    );
    await sql(
      `INSERT INTO "Content" (id, kind, slug, title, summary, body, "updatedAt", "authorId")
       VALUES ($1, 'RESEARCH', $2, $3, 'Summary', 'Body text', now(), $4)`,
      [contentId, `trash-research-${id}`, contentTitle, admin.id],
    );
    await sql(
      `INSERT INTO "ResearchArticle" ("contentId", "references") VALUES ($1, ARRAY['https://example.com/ref'])`,
      [contentId],
    );
    await sql(`INSERT INTO "Tag" (id, name, slug) VALUES ($1, $2, $2)`, [
      tagId,
      `trash-tag-${id}`,
    ]);
    await sql(`INSERT INTO "_ContentToTag" ("A", "B") VALUES ($1, $2)`, [
      contentId,
      tagId,
    ]);
    await sql(
      `INSERT INTO "StudentAssignment" (id, title, "group", target, "dueAt")
       VALUES ($1, $2, 'trash-g', 'lab:network', now() + interval '3 days')`,
      [`e2e_${randomUUID()}`, assignmentTitle],
    );
  });

  test.afterAll(async () => {
    await sql(`DELETE FROM "Student" WHERE id = $1`, [studentId]);
    await sql(`DELETE FROM "Content" WHERE id = $1`, [contentId]);
    await sql(`DELETE FROM "Tag" WHERE id = $1`, [tagId]);
    await sql(`DELETE FROM "TrashItem" WHERE label = ANY($1)`, [
      [studentName, contentTitle, assignmentTitle],
    ]);
  });

  test("a deleted student comes back with progress and parent link", async ({
    page,
  }) => {
    await signIn(page);
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto(`/teacher/students/${studentId}`);
    await page.getByRole("button", { name: "Delete student" }).click();
    await expect(page).toHaveURL(/\/teacher\/students$/);
    expect(
      await sql(`SELECT 1 FROM "Student" WHERE id = $1`, [studentId]),
    ).toHaveLength(0);

    await page.goto("/teacher/trash");
    const row = page.getByRole("row", { name: new RegExp(studentName) });
    await expect(row).toContainText("Student");
    await expect(row).toContainText("trash-g");
    await audit(page, "trash page");
    await row.getByRole("button", { name: `Restore ${studentName}` }).click();
    await expect(row).toHaveCount(0);

    const [restored] = await sql<{ reportToken: string }>(
      `SELECT "reportToken" FROM "Student" WHERE id = $1`,
      [studentId],
    );
    expect(restored.reportToken).toBe(`rt_${id}`);
    expect(
      await sql(`SELECT 1 FROM "StudentCheckpoint" WHERE "studentId" = $1`, [
        studentId,
      ]),
    ).toHaveLength(1);
    expect(
      await sql(`SELECT 1 FROM "TelegramChat" WHERE subject = $1`, [
        `parent:student:${studentId}`,
      ]),
    ).toHaveLength(1);
    const response = await page.goto(`/teacher/students/${studentId}`);
    expect(response?.status()).toBe(200);
  });

  test("a deleted site entry comes back with its details and tags", async ({
    page,
  }) => {
    await signIn(page);
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto("/admin/research");
    await page
      .getByRole("form", { name: `Actions for ${contentTitle}` })
      .getByRole("button", { name: "Delete" })
      .click();
    await expect(page.getByRole("link", { name: contentTitle })).toHaveCount(0);

    await page.goto("/teacher/trash?kind=content");
    const row = page.getByRole("row", { name: new RegExp(contentTitle) });
    await row.getByRole("button", { name: `Restore ${contentTitle}` }).click();
    await expect(row).toHaveCount(0);

    expect(
      await sql(
        `SELECT "references" FROM "ResearchArticle" WHERE "contentId" = $1`,
        [contentId],
      ),
    ).toEqual([{ references: ["https://example.com/ref"] }]);
    expect(
      await sql(`SELECT 1 FROM "_ContentToTag" WHERE "A" = $1 AND "B" = $2`, [
        contentId,
        tagId,
      ]),
    ).toHaveLength(1);
    await page.goto("/admin/research");
    await expect(page.getByRole("link", { name: contentTitle })).toBeVisible();
  });

  test("an item deleted for good is gone", async ({ page }) => {
    await signIn(page);
    page.on("dialog", (dialog) => dialog.accept());
    await page.goto("/teacher/assignments");
    await page
      .locator("li.admin-assignment")
      .filter({ hasText: assignmentTitle })
      .last()
      .getByRole("button", { name: /Delete/ })
      .click();
    await expect(page.getByText(assignmentTitle)).toHaveCount(0);

    await page.goto("/teacher/trash?kind=assignment");
    const row = page.getByRole("row", { name: new RegExp(assignmentTitle) });
    await row
      .getByRole("button", { name: `Delete ${assignmentTitle} for good` })
      .click();
    await expect(row).toHaveCount(0);
    expect(
      await sql(`SELECT 1 FROM "TrashItem" WHERE label = $1`, [
        assignmentTitle,
      ]),
    ).toHaveLength(0);
    expect(
      await sql(`SELECT 1 FROM "StudentAssignment" WHERE title = $1`, [
        assignmentTitle,
      ]),
    ).toHaveLength(0);
  });
});
