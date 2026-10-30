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
    page.locator("#syssec").getByRole("link", { name: /Windows basics/ }),
  ).toHaveAttribute("href", "/intermediate/windows");
  await page.goto("/intermediate/windows");
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
       VALUES ($1, 'Windows Pupil', 'intermediate', $2, now())`,
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

  test("trim the access list and read the log", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/windows#lesson/3");
    for (const who of ["Everyone", "CORP\\Domain Users"])
      await page
        .getByLabel(`${who} shouldn’t have this`, { exact: true })
        .check();
    await expect(page.locator(".nl-card .nl-pass")).toContainText(
      "Remove Everyone and Domain Users",
    );
    await pass(page);
    await audit(page, "acl");

    await page.goto("/intermediate/windows#lesson/6");
    const picks: [number, string][] = [
      [4625, "A failed logon"],
      [4624, "A successful logon"],
      [4720, "A user account was created"],
      [4732, "A member was added to a security group"],
      [1102, "The audit log was cleared"],
    ];
    await page
      .getByLabel(/^Event 1102/)
      .selectOption({ label: "A successful logon" });
    await expect(page.locator(".sd-bad")).toHaveCount(1);
    for (const [id, label] of picks)
      await page.getByLabel(new RegExp(`^Event ${id}`)).selectOption({ label });
    await expect(page.locator(".nl-card .nl-pass")).toContainText("The story");
    await pass(page);
    await audit(page, "events");
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/windows");
  await expect(page).toHaveTitle(/Windows asoslari/);
});
