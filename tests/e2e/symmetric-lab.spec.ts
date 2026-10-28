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
    page.locator("#crypto").getByRole("link", { name: /Symmetric encryption/ }),
  ).toHaveAttribute("href", "/intermediate/symmetric");
  await page.goto("/intermediate/symmetric");
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
       VALUES ($1, 'Aes Pupil', 'intermediate', $2, now())`,
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

  test("ECB shows the picture, a reused nonce leaks, a tag stops a change", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/symmetric#lesson/3");
    await expect(page.locator(".nl-card .nl-fail")).toContainText(
      "the outline shows through",
    );
    await page.getByLabel("CTR").check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "the picture is hidden",
    );
    await pass(page);
    await audit(page, "ecb");

    await page.goto("/intermediate/symmetric#lesson/4");
    await expect(page.locator(".sy-msg.bad")).toContainText("Seyf kodi 4721");
    await page.getByLabel("A fresh nonce for each message").check();
    await expect(page.locator(".sy-msg.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "nonce");

    await page.goto("/intermediate/symmetric#lesson/5");
    await expect(page.locator(".ac-reply")).toContainText("sum=900000");
    await page.getByLabel("Add an authentication tag (AES-GCM)").check();
    await expect(page.locator(".ac-reply")).toContainText("Refused");
    await pass(page);
    await audit(page, "tag");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/symmetric");
  await expect(page).toHaveTitle(/Simmetrik shifrlash/);
});
