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
    page.locator("#webappsec").getByRole("link", { name: /Access control/ }),
  ).toHaveAttribute("href", "/intermediate/access");
  await page.goto("/intermediate/access");
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
       VALUES ($1, 'Access Pupil', 'intermediate', $2, now())`,
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

  test("an order, a forged token and a second factor", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/access#lesson/2");
    const reply = page.locator(".ac-reply");
    await expect(reply).toContainText("HTTP 200");
    await page.getByLabel("Order number").fill("1042");
    await expect(reply).toContainText("vali");
    await expect(reply).toContainText("another person’s order");
    await page.getByLabel("Check the owner on the server").check();
    await expect(reply).toContainText("HTTP 404");
    await pass(page);
    await audit(page, "idor");

    await page.goto("/intermediate/access#lesson/5");
    const edited = page.locator(".br-attempt").nth(1);
    await expect(edited).toContainText("Accepted.");
    await page.getByLabel("Verify the signature").check();
    await expect(edited).toContainText("Refused.");
    await expect(page.locator(".br-attempt").nth(2)).toContainText("Accepted.");
    await page
      .getByLabel("Take the algorithm from the token (alg: none too)")
      .uncheck();
    await expect(page.locator(".br-attempt.bad")).toHaveCount(0);
    await expect(page.locator(".br-attempt").first()).toContainText(
      "Accepted.",
    );
    await pass(page);
    await audit(page, "jwt");

    await page.goto("/intermediate/access#lesson/7");
    await page.getByLabel("Password + SMS code").check();
    await expect(page.locator(".ui-cases tbody tr.bad")).toHaveCount(2);
    await page.getByLabel("Password + security key (passkey)").check();
    await expect(page.locator(".ui-cases tbody tr.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "mfa");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/access");
  await expect(page).toHaveTitle(/Kirish nazorati/);
});
