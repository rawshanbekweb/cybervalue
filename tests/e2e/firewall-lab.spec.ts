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
      .locator("#netsec")
      .getByRole("link", { name: /Firewalls and segmentation/ }),
  ).toHaveAttribute("href", "/intermediate/firewall");
  await page.goto("/intermediate/firewall");
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
       VALUES ($1, 'Firewall Pupil', 'intermediate', $2, now())`,
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

  test("rule order, a stateful firewall and a narrow rule", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    // Start: F, E, D, A, B, C. Move D to the top, then E above F.
    await page.goto("/intermediate/firewall#lesson/2");
    await page.getByRole("button", { name: "Move rule D up" }).click();
    await page.getByRole("button", { name: "Move rule D up" }).click();
    await page.getByRole("button", { name: "Move rule E up" }).click();
    await expect(page.locator(".fw-rule .fw-id")).toHaveText([
      "D",
      "E",
      "F",
      "A",
      "B",
      "C",
    ]);
    await expect(page.locator(".ui-cases caption")).not.toContainText("8 of 8");
    await page.getByLabel("DENY").check();
    await expect(page.locator(".ui-cases caption")).toContainText("8 of 8");
    await pass(page);
    await audit(page, "order");

    await page.goto("/intermediate/firewall#lesson/3");
    await expect(page.locator(".nl-fail")).toBeVisible();
    await page.getByLabel("Track connections").check();
    await page
      .getByLabel("Allow anything inbound from source port 443")
      .uncheck();
    await expect(page.locator(".nl-card .nl-pass")).toBeVisible();
    await pass(page);
    await audit(page, "stateful");

    await page.goto("/intermediate/firewall#lesson/4");
    await expect(page.locator(".ac-reply")).toContainText("opens: 6");
    await page.getByLabel("Source").selectOption("web");
    await page.getByLabel("Destination").selectOption("db");
    await page.getByLabel("Port").selectOption("5432");
    await expect(page.locator(".ac-reply")).toHaveClass(/ok/);
    await expect(page.locator(".ac-reply")).toContainText("opens: 0");
    await pass(page);
    await audit(page, "narrow");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/firewall");
  await expect(page).toHaveTitle(/Firewall va segmentlash/);
});
