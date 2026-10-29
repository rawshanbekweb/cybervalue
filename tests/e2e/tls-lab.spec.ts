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
    page.locator("#crypto").getByRole("link", { name: /TLS and certificates/ }),
  ).toHaveAttribute("href", "/intermediate/tls");
  await page.goto("/intermediate/tls");
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
       VALUES ($1, 'Tls Pupil', 'intermediate', $2, now())`,
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

  test("a trusted chain, an A+ and HSTS with preload", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/tls#lesson/3");
    await expect(page.locator(".nl-card .nl-fail")).toContainText(
      "ERR_CERT_AUTHORITY_INVALID",
    );
    await page.getByLabel("Let’s Encrypt (a public CA)").check();
    await page
      .getByLabel("Send the intermediate certificate (fullchain.pem)")
      .check();
    await page.getByLabel("Renew the certificate (valid for 90 days)").check();
    await expect(page.locator(".nl-card .nl-fail")).toContainText(
      "ERR_CERT_COMMON_NAME_INVALID",
    );
    await page.getByLabel("*.shop.uz").check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "The padlock shows",
    );
    await pass(page);
    await audit(page, "chain");

    await page.goto("/intermediate/tls#lesson/5");
    await expect(page.locator(".tl-mark")).toHaveText("C");
    for (const off of ["TLS 1.0", "TLS 1.1", "RC4 / 3DES", "RSA key exchange"])
      await page.getByLabel(off, { exact: true }).uncheck();
    await page.getByLabel("TLS 1.3", { exact: true }).check();
    await expect(page.locator(".tl-mark")).toHaveText("A");
    await page.getByLabel("HSTS", { exact: true }).check();
    await expect(page.locator(".tl-mark")).toHaveText("A+");
    await pass(page);
    await audit(page, "grade");

    await page.goto("/intermediate/tls#lesson/6");
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(2);
    await page
      .getByLabel("Send Strict-Transport-Security: max-age=31536000")
      .check();
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(1);
    await page
      .getByLabel("Add the site to the HSTS preload list (needs HSTS)")
      .check();
    await expect(page.locator(".ui-cases tr.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "hsts");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/tls");
  await expect(page).toHaveTitle(/TLS va sertifikatlar/);
});
