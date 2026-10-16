import { createHash, randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import { createJunior } from "./junior-member";

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

test.describe("site settings and users", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );

  test("the admin turns the announcement banner on and off", async ({
    page,
    browser,
  }) => {
    const text = `Open day ${Date.now().toString(36)}`;
    await signIn(page);
    await page
      .getByRole("navigation", { name: "Admin sections" })
      .getByRole("link", { name: "Site settings" })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Site settings" }),
    ).toBeVisible();
    await page.getByLabel("Show the banner above every public page").check();
    await page.getByLabel("Text (English)").fill(text);
    await page.getByLabel("Text (Uzbek)").fill(text);
    await page.getByLabel("Link (optional)").fill("javascript:alert(1)");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.locator(".admin-error")).toContainText(
      "The banner link must start with / or https://.",
    );
    await page.getByLabel("Link (optional)").fill("/playground/junior");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Saved. The site is updated.",
    );
    await audit(page, "settings");

    const visitor = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    const banner = visitor.getByRole("note");
    // The first visit after a change may still regenerate the page.
    await expect(async () => {
      await visitor.goto("/");
      await expect(banner).toContainText(text, { timeout: 2000 });
    }).toPass({ timeout: 30_000 });
    await expect(banner.getByRole("link")).toHaveAttribute(
      "href",
      "/playground/junior",
    );
    await visitor.context().close();

    await page.reload();
    await page.getByLabel("Show the banner above every public page").uncheck();
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Saved. The site is updated.",
    );
  });

  test("students and Junior members are managed together", async ({ page }) => {
    const group = `u-${Date.now().toString(36)}`;
    const moved = `${group}-b`;
    await createJunior({ name: `Junior ${group}`, group });
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "Student" (id, name, "group", "codeHash", "updatedAt")
       VALUES ($1, $2, $3, $4, now())`,
      [
        `e2e_${randomUUID()}`,
        `Student ${group}`,
        group,
        createHash("sha256").update(randomUUID()).digest("hex"),
      ],
    );
    await client.end();

    await signIn(page);
    await page.goto(`/admin/users?group=${group}`);
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(2);
    await audit(page, "users");
    await page.getByLabel("Select all").check();
    await expect(page.getByText("2 selected")).toBeVisible();
    await page.getByLabel("Group", { exact: true }).last().fill(moved);
    await page.getByRole("button", { name: "Apply" }).last().click();
    await expect(page.getByRole("status")).toHaveText("Done: 2 users updated.");

    await page.goto(`/admin/users?group=${moved}`);
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(2);
    await page.getByLabel(`Select Junior ${group}`).check();
    await page.getByLabel("Action", { exact: true }).selectOption("block");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Apply" }).last().click();
    await expect(page.getByRole("status")).toHaveText("Done: 1 users updated.");
    await page.goto(`/admin/users?group=${moved}&status=blocked`);
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(1);
    await expect(page.locator(".admin-table")).toContainText(`Junior ${group}`);
  });
});
