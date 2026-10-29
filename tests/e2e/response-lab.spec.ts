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
    page.locator("#forensics").getByRole("link", { name: /Incident response/ }),
  ).toHaveAttribute("href", "/intermediate/response");
  await page.goto("/intermediate/response");
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
       VALUES ($1, 'Responder Pupil', 'intermediate', $2, now())`,
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

  test("triage the queue and contain ransomware", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    // Start: laptop, deface, exfil, ransom. Reverse it.
    await page.goto("/intermediate/response#lesson/2");
    for (const n of [4, 3, 2, 4, 3, 4])
      await page.getByRole("button", { name: `Move incident ${n} up` }).click();
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "Ransomware first",
    );
    await pass(page);
    await audit(page, "triage");

    await page.goto("/intermediate/response#lesson/3");
    await page.getByLabel("Post an update in the company chat").check();
    await expect(page.locator(".ir-outcomes li.bad")).toHaveCount(1);
    await page.getByLabel("Post an update in the company chat").uncheck();
    for (const name of [
      "Cut the infected hosts",
      "Capture the memory",
      "Disable the compromised",
    ])
      await page.getByLabel(name).check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "Spread stopped",
    );
    await pass(page);
    await audit(page, "contain");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/response");
  await expect(page).toHaveTitle(/Hodisaga javob/);
});
