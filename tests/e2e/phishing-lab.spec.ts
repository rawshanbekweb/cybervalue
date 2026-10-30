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
    page.locator("#blueteam").getByRole("link", { name: /Phishing analysis/ }),
  ).toHaveAttribute("href", "/intermediate/phishing");
  await page.goto("/intermediate/phishing");
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
       VALUES ($1, 'Analyst Pupil', 'intermediate', $2, now())`,
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

  test("trace the headers and unmask the links", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/phishing#lesson/3");
    await page
      .getByLabel("The first server’s IP address")
      .fill("198.51.100.20");
    await page
      .getByRole("radio", { name: "navrozbank.example", exact: true })
      .check();
    await expect(page.locator(".nl-card .nl-fail")).toBeVisible();
    await page.getByLabel("The first server’s IP address").fill("203.0.113.99");
    await page.getByRole("radio", { name: "mailbox.example" }).check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText("Phishing.");
    await pass(page);
    await audit(page, "headers");

    await page.goto("/intermediate/phishing#lesson/5");
    const links = page.locator(".ph-link");
    await expect(links).toHaveCount(6);
    await links.nth(0).getByLabel("Show the real address").check();
    await expect(links.nth(0).locator(".ph-domain")).toContainText(
      "secure-login.example",
    );
    const bad = [true, false, true, true, true, false];
    for (let i = 0; i < bad.length; i++)
      await links
        .nth(i)
        .getByLabel(bad[i] ? "Suspicious" : "Safe")
        .check();
    await expect(page.locator(".nl-card > .nl-pass")).toContainText(
      "Four traps",
    );
    await pass(page);
    await audit(page, "links");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/phishing");
  await expect(page).toHaveTitle(/Fishing tahlili/);
});
