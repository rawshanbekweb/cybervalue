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
      .locator("#forensics")
      .getByRole("link", { name: /Writing the report/ }),
  ).toHaveAttribute("href", "/intermediate/report");
  await page.goto("/intermediate/report");
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
       VALUES ($1, 'Report Pupil', 'intermediate', $2, now())`,
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

  test("order the sections and write one finding", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    // Draft: findings, appendix, timeline, summary, recommendations, scope.
    await page.goto("/intermediate/report#lesson/2");
    const ids = page.locator(".ir-what strong");
    // Bubble each section into place from the top down.
    for (const [title, from, to] of [
      ["Executive summary", 4, 1],
      ["Scope and method", 6, 2],
      ["Timeline", 5, 3],
      ["Findings", 4, 4],
      ["Recommendations", 6, 5],
    ] as const)
      for (let n = from; n > to; n--) {
        await expect(ids.nth(n - 1)).toHaveText(title);
        await page
          .getByRole("button", { name: `Move section ${n} up` })
          .click();
      }
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "The answer first",
    );
    await pass(page);
    await audit(page, "outline");

    await page.goto("/intermediate/report#lesson/4");
    await page.getByLabel("The password the attacker guessed").check();
    await expect(page.locator(".rp-bad")).toHaveCount(1);
    await page.getByLabel("The password the attacker guessed").uncheck();
    for (const name of [
      "What happened",
      "Where the evidence is",
      "The impact in plain words",
      "A recommendation with an owner",
    ])
      await page.getByLabel(name).check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText("Checkable");
    await pass(page);
    await audit(page, "finding");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/report");
  await expect(page).toHaveTitle(/Hisobot yozish/);
});
