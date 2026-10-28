import { randomUUID } from "node:crypto";
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

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

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

test.describe("placing students at a level", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD",
  );
  const group = `lv${randomUUID().slice(0, 8)}`;
  const ids = [randomUUID(), randomUUID(), randomUUID()];
  const names = ["Level One", "Level Two", "Level Three"].map(
    (n) => `${n} ${group}`,
  );

  test.beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    for (const [i, id] of ids.entries())
      await client.query(
        `INSERT INTO "Student" (id, name, "group", level, "codeHash", "updatedAt")
         VALUES ($1, $2, $3, 'beginner', $4, now())`,
        [id, names[i], group, randomUUID()],
      );
    await client.end();
  });

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = ANY($1)`, [ids]);
    await client.end();
  });

  test("the teacher moves ticked students, or one student, to Intermediate", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto(`/teacher/students?group=${group}`);
    const rows = page.locator(".admin-table tbody tr");
    await expect(rows).toHaveCount(3);
    await expect(rows.first()).toContainText("Beginner");
    await audit(page, "students list");

    await page.getByLabel(`Tick ${names[0]}`).check();
    await page.getByLabel(`Tick ${names[1]}`).check();
    await expect(page.getByLabel("Move the ticked students to")).toHaveValue(
      "intermediate",
    );
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(
      "Level changed for 2 students.",
    );
    await expect(page).toHaveURL(new RegExp(`group=${group}`));

    await page
      .getByLabel("Level", { exact: true })
      .selectOption("intermediate");
    await page.getByRole("button", { name: "Show", exact: true }).click();
    await expect(rows).toHaveCount(2);
    await expect(page.locator(".admin-table")).not.toContainText(names[2]);

    // Ticking everyone and applying again changes nobody already there.
    await page.getByLabel("Tick every student").check();
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(
      "Level changed for 0 students.",
    );

    await page.goto(`/teacher/students?group=${group}&show=beginner`);
    await page.getByRole("link", { name: names[2] }).click();
    await page.getByRole("button", { name: "Move to Intermediate" }).click();
    await expect(page.getByText("Intermediate labs are open")).toBeVisible();
    await expect(page.locator("#level")).toHaveValue("intermediate");

    await page.goto("/admin/audit");
    await expect(page.locator("body")).toContainText(
      `${names[2]}: intermediate`,
    );
  });
});
