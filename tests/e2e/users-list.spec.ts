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

test.describe("users list", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );

  const prefix = `Lst${Date.now().toString(36)}`;
  const ids: string[] = [];

  test.beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    // 55 students: two pages of 50. Names sort as Lst… 00 … 54; groups
    // count down so the group order is the reverse of the name order.
    for (let i = 0; i < 55; i++) {
      const id = `e2e_${randomUUID()}`;
      ids.push(id);
      await client.query(
        `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash")
         VALUES ($1, $2, $3, now(), $4)`,
        [
          id,
          `${prefix} ${String(i).padStart(2, "0")}`,
          `g-${String(99 - i).padStart(2, "0")}`,
          createHash("sha256").update(id).digest("hex"),
        ],
      );
    }
    await client.end();
  });

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = ANY($1)`, [ids]);
    await client.end();
  });

  test("the list pages, sorts by column and downloads as CSV", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(`/admin/users?q=${prefix}`);
    const names = page.locator("tbody tr td:nth-child(2) a");
    await expect(names).toHaveCount(50);
    await expect(names.first()).toHaveText(`${prefix} 00`);
    await expect(page.getByText("Page 1 of 2")).toBeVisible();
    await audit(page, "users list");

    await page.getByRole("link", { name: "Next" }).click();
    await expect(names).toHaveCount(5);
    await expect(names.last()).toHaveText(`${prefix} 54`);

    await page
      .getByRole("columnheader", { name: /Group/ })
      .getByRole("link")
      .click();
    await expect(page).toHaveURL(/sort=group/);
    await expect(
      page.getByRole("columnheader", { name: /Group/ }),
    ).toHaveAttribute("aria-sort", "ascending");
    // Lowest group belongs to the last name.
    await expect(names.first()).toHaveText(`${prefix} 54`);
    await page
      .getByRole("columnheader", { name: /Group/ })
      .getByRole("link")
      .click();
    await expect(page).toHaveURL(/dir=desc/);
    await expect(names.first()).toHaveText(`${prefix} 00`);

    const href = await page
      .getByRole("link", { name: "Download CSV" })
      .getAttribute("href");
    expect(href).toContain(`q=${prefix}`);
    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/csv");
    const csv = await response.text();
    expect(csv.startsWith("﻿")).toBe(true);
    const lines = csv.trim().split("\r\n");
    expect(lines).toHaveLength(56);
    expect(lines[0]).toContain('"Name","Type","Group"');
    expect(lines[1]).toContain(`"${prefix} 00","Student","g-99"`);
  });

  test("a CSV file fills the roster before codes are created", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/students");
    await page.getByLabel(/Or load a CSV file/).setInputFiles({
      name: "sinf.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(
        "﻿Familiya;Ism;Sinf\nKarimova;Lola;7-A\nAliyev;Sardor;7-A\n",
      ),
    });
    await expect(page.getByRole("status")).toContainText("2 names loaded");
    await expect(page.locator("#roster")).toHaveValue(
      "Karimova Lola | 7-A\nAliyev Sardor | 7-A",
    );
  });
});
