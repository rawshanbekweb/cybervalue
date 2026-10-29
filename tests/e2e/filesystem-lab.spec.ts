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
    page.locator("#forensics").getByRole("link", { name: /File systems/ }),
  ).toHaveAttribute("href", "/intermediate/filesystem");
  await page.goto("/intermediate/filesystem");
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
       VALUES ($1, 'Inode Pupil', 'intermediate', $2, now())`,
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

  test("the MACB table and a timeline across time zones", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/filesystem#lesson/2");
    await page.getByLabel("B changes after: cat report.xlsx").check();
    await page.getByRole("button", { name: "Show mistakes" }).click();
    await expect(page.locator(".fs-grid td.bad")).not.toHaveCount(0);
    await page.getByLabel("B changes after: cat report.xlsx").uncheck();
    for (const [stamp, cmd] of [
      ["A", "cat report.xlsx"],
      ["M", "echo"],
      ["C", "echo"],
      ["C", "chmod"],
      ["C", "mv report.xlsx"],
    ])
      await page.getByLabel(`${stamp} changes after: ${cmd}`).check();
    await page.getByRole("button", { name: "Show mistakes" }).click();
    await expect(page.locator(".fs-grid td.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "macb");

    // Start: shell, miner, cron, upload, cmd. Bring the two web log lines up.
    await page.goto("/intermediate/filesystem#lesson/5");
    await expect(page.locator(".nl-card .nl-fail")).toBeVisible();
    for (const n of [4, 3, 2])
      await page.getByRole("button", { name: `Move event ${n} up` }).click();
    // Now: upload, shell, miner, cron, cmd. Move cmd up twice.
    for (const n of [5, 4])
      await page.getByRole("button", { name: `Move event ${n} up` }).click();
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "six minutes",
    );
    await expect(page.locator(".fs-utc").first()).toContainText("02:11:02 UTC");
    await pass(page);
    await audit(page, "timeline");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/filesystem");
  await expect(page).toHaveTitle(/Fayl tizimlari/);
});
