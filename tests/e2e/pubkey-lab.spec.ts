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
    page
      .locator("#crypto")
      .getByRole("link", { name: /Public-key cryptography/ }),
  ).toHaveAttribute("href", "/intermediate/pubkey");
  await page.goto("/intermediate/pubkey");
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
       VALUES ($1, 'Rsa Pupil', 'intermediate', $2, now())`,
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

  test("Diffie–Hellman, an RSA key and a man in the middle", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/pubkey#lesson/2");
    await expect(page.locator(".ac-reply")).toContainText("she finds a = 6");
    await page.getByLabel("p = 2⁶¹ − 1").check();
    await expect(page.locator(".ac-reply")).toContainText("no answer");
    await pass(page);
    await audit(page, "dh");

    await page.goto("/intermediate/pubkey#lesson/3");
    await page
      .getByRole("button", { name: "Encrypt 42 and decrypt it" })
      .click();
    await expect(page.locator(".pk-step.ok")).toContainText("= 42");
    await expect(page.locator(".nl-card .nl-fail")).toContainText("53 × 61");
    await pass(page);
    await audit(page, "rsa");

    await page.goto("/intermediate/pubkey#lesson/5");
    await expect(page.locator(".ac-reply")).toContainText(
      "share a key with Mallory",
    );
    await page
      .getByLabel("Bob signs his value with a key Alice trusts")
      .check();
    await expect(page.locator(".ac-reply")).toContainText("She stops");
    await pass(page);
    await audit(page, "mitm");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/pubkey");
  await expect(page).toHaveTitle(/Ochiq kalitli kriptografiya/);
});
