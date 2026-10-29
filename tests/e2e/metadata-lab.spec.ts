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
    page.locator("#stego").getByRole("link", { name: /Metadata/ }),
  ).toHaveAttribute("href", "/intermediate/metadata");
  await page.goto("/intermediate/metadata");
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
       VALUES ($1, 'Exif Pupil', 'intermediate', $2, now())`,
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

  test("locate the photo and strip its tags", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/metadata#lesson/2");
    await page.getByRole("button", { name: /Convert the GPS/ }).click();
    await expect(page.locator(".nl-card .cb-out")).toContainText(
      "39.6548, 66.9756",
    );
    await page.getByLabel(/Tashkent/).check();
    await expect(page.locator(".nl-card .nl-fail")).toBeVisible();
    await page.getByLabel(/Samarkand/).check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText("Registan");
    await pass(page);
    await audit(page, "exif");

    await page.goto("/intermediate/metadata#lesson/4");
    await page.getByLabel("Orientation").check();
    await expect(page.locator(".ac-reply")).toContainText("breaks");
    await page.getByLabel("Orientation").uncheck();
    for (const name of [
      "GPS Latitude",
      "Artist",
      "Lens Serial Number",
      "Date/Time Original",
    ])
      await page.getByLabel(name).check();
    await expect(page.locator(".nl-card .cb-out")).toContainText("-gps:all=");
    await expect(page.locator(".ac-reply")).toHaveClass(/ok/);
    await pass(page);
    await audit(page, "strip");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/metadata");
  await expect(page).toHaveTitle(/Metama’lumotlar/);
});
