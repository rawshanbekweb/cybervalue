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
    page.locator("#netsec").getByRole("link", { name: /Secure connections/ }),
  ).toHaveAttribute("href", "/intermediate/connections");
  await page.goto("/intermediate/connections");
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
       VALUES ($1, 'Vpn Pupil', 'intermediate', $2, now())`,
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

  test("Wi-Fi, a full tunnel and host keys", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/connections#lesson/2");
    const reply = page.locator(".ac-reply");
    await expect(reply).toHaveClass(/bad/);
    await expect(reply).toContainText("days");
    await page.getByLabel("Wi-Fi password").fill("password");
    await expect(reply).toContainText("1 s");
    await page.getByLabel("WPA3-SAE").check();
    await expect(reply).toHaveClass(/ok/);
    await pass(page);
    await audit(page, "wifi");

    await page.goto("/intermediate/connections#lesson/4");
    const dns = page.getByLabel("Send DNS queries through the tunnel");
    await expect(dns).toBeDisabled();
    await page.getByLabel("Split tunnel (office only)").check();
    await dns.check();
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(2);
    await page.getByLabel("Full tunnel (everything)").check();
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "vpn");

    await page.goto("/intermediate/connections#lesson/5");
    const connects = page.locator(".cn-connect");
    await connects.nth(0).getByLabel("Connect").check();
    await connects.nth(1).getByLabel("Stop").check();
    await connects.nth(2).getByLabel("Connect").check();
    await expect(connects.nth(2).locator(".nl-fail")).toBeVisible();
    await connects.nth(2).getByLabel("Stop").check();
    await expect(connects.nth(2).locator(".nl-pass")).toBeVisible();
    await pass(page);
    await audit(page, "hostkey");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/connections");
  await expect(page).toHaveTitle(/Xavfsiz ulanishlar/);
});
