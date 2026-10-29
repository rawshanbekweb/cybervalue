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
    page.locator("#stego").getByRole("link", { name: /Inside images/ }),
  ).toHaveAttribute("href", "/intermediate/lsb");
  await page.goto("/intermediate/lsb");
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
       VALUES ($1, 'Pixel Pupil', 'intermediate', $2, now())`,
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

  test("flip a bit, read the LSBs, find the plane", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/lsb#lesson/2");
    await expect(page.locator(".nl-card .cb-out")).toContainText("128 steps");
    await page.getByRole("radio", { name: "0", exact: true }).check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText("Off by 1");
    await pass(page);
    await audit(page, "flip");

    await page.goto("/intermediate/lsb#lesson/3");
    await page.getByLabel("Show each pixel’s red value in binary").check();
    await expect(page.locator(".ls-bytes")).toContainText("01001000 → H");
    await page.getByLabel("The hidden message").fill("Hi!");
    await pass(page);
    await audit(page, "row");

    await page.goto("/intermediate/lsb#lesson/5");
    await page.getByLabel("Blue").check();
    await page.getByLabel(/Bit plane/).fill("0");
    await expect(page.locator(".ls-pair figcaption").nth(1)).toHaveText(
      "Blue, bit 0",
    );
    await page.getByLabel("The hidden word").fill("cv26");
    await pass(page);
    await audit(page, "planes");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/lsb");
  await expect(page).toHaveTitle(/Rasm ichida/);
});
