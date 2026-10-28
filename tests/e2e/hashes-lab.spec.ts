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
    page.locator("#crypto").getByRole("link", { name: /Hashes and passwords/ }),
  ).toHaveAttribute("href", "/intermediate/hashes");
  await page.goto("/intermediate/hashes");
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
       VALUES ($1, 'Hash Pupil', 'intermediate', $2, now())`,
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

  test("a salt, a bcrypt cost and an HMAC signature", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/hashes#lesson/2");
    await expect(page.locator(".ui-cases tbody tr.bad")).toHaveCount(3);
    await page.getByLabel("A salt for each user").check();
    await expect(page.locator(".ui-cases tbody tr.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "salt");

    await page.goto("/intermediate/hashes#lesson/3");
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(1);
    await page.getByLabel("bcrypt").check();
    await expect(page.getByText("Cost: 10")).toBeVisible();
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "cost");

    await page.goto("/intermediate/hashes#lesson/5");
    const forged = page.locator(".br-attempt").nth(1);
    await expect(forged).toContainText("marks the order paid");
    await page.getByLabel("Sign with HMAC (a secret key)").check();
    await expect(forged).toContainText("signature does not match");
    await pass(page);
    await audit(page, "hmac");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/hashes");
  await expect(page).toHaveTitle(/Xesh va parollar/);
});
