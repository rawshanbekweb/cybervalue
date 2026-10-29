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
    page.locator("#netsec").getByRole("link", { name: /Intrusion detection/ }),
  ).toHaveAttribute("href", "/intermediate/ids");
  await page.goto("/intermediate/ids");
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
       VALUES ($1, 'Ids Pupil', 'intermediate', $2, now())`,
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

  test("a normalized content match and a tuned threshold", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/ids#lesson/3");
    const caption = page.locator(".ui-cases caption");
    await expect(caption).toContainText("Caught 1 of 4");
    await page.getByLabel("Match on the normalized URI").check();
    await expect(caption).toContainText("Caught 3 of 4");
    await expect(page.locator(".id-rule")).toContainText("http.uri;");
    await page.getByLabel("Ignore upper and lower case").check();
    await expect(caption).toContainText("Caught 4 of 4 attacks, 0 false");
    await pass(page);
    await audit(page, "content");

    await page.goto("/intermediate/ids#lesson/4");
    await expect(page.locator(".ui-cases tr.bad")).not.toHaveCount(0);
    await page.getByRole("radio", { name: "300" }).check();
    await page.getByLabel(/count: failed logins/).fill("6");
    await expect(page.locator(".id-rule")).toContainText(
      "count 6, seconds 300",
    );
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "threshold");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/ids");
  await expect(page).toHaveTitle(/Hujumni aniqlash/);
});
