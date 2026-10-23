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
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");

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

test("the lab is locked for visitors and listed on the roadmap", async ({
  page,
}) => {
  await page.goto("/intermediate");
  await expect(
    page.locator("#webappsec").getByRole("link", { name: /Untrusted input/ }),
  ).toHaveAttribute("href", "/intermediate/input");
  await page.goto("/intermediate/input");
  await expect(
    page.getByRole("heading", { name: "This lab is part of Intermediate." }),
  ).toBeVisible();
  await expect(page.getByLabel("Username")).toHaveCount(0);
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
       VALUES ($1, 'Input Pupil', 'intermediate', $2, now())`,
      [id, hash(code)],
    );
    await client.end();
  });

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = $1`, [id]);
    await client.end();
  });

  test("breaks the pretend back end and fixes it", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);

    await page.goto("/intermediate/input#lesson/2");
    await expect(
      page.getByRole("heading", { level: 1, name: /Untrusted input/ }),
    ).toBeVisible();
    await page.getByLabel("Username").fill("'");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator(".cb-card .nl-fail")).toContainText(
      "Database error",
    );
    await pass(page);
    await audit(page, "sql");

    await page.goto("/intermediate/input#lesson/3");
    await page.getByLabel("Username").fill("ali");
    await page.getByLabel("Password").fill("olma-2026");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator(".cb-card .nl-pass")).toContainText(
      "Signed in as ali",
    );
    await page.getByLabel("Username").fill("admin'--");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator(".cb-card .nl-fail")).toContainText(
      "Signed in as admin",
    );
    await pass(page);

    await page.goto("/intermediate/input#lesson/4");
    await page.getByLabel("Parameterized query").check();
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator(".ui-params")).toContainText("admin'--");
    await expect(page.locator(".cb-card .cb-out")).toContainText(
      "Wrong username or password.",
    );
    await pass(page);

    await page.goto("/intermediate/input#lesson/5");
    await page.getByLabel("File name").fill("../app/config.env");
    await page.getByRole("button", { name: "Download" }).click();
    await expect(page.locator(".ui-compare")).toContainText("DB_PASSWORD");
    await expect(page.locator(".ui-compare")).toContainText("403 Forbidden");
    await pass(page);
    await audit(page, "path");

    await page.goto("/intermediate/input#lesson/6");
    await page.getByLabel("File name").fill("../app/config.env");
    await page.getByRole("button", { name: "Download" }).click();
    await page.getByRole("button", { name: "Check", exact: true }).click();
    await expect(page.locator(".nl-task .nl-fail")).toBeVisible();
    await page.getByLabel("File name").fill("....//app/config.env");
    await page.getByRole("button", { name: "Download" }).click();
    await pass(page);

    await page.goto("/intermediate/input#lesson/7");
    await page.getByLabel("Regular expression").fill("[a-z0-9_]{3,16}");
    await expect(page.locator(".ui-cases tr.bad")).not.toHaveCount(0);
    await page.getByLabel("Regular expression").fill("^[a-z0-9_]{3,16}$");
    await expect(page.locator(".ui-cases tbody tr.bad")).toHaveCount(0);
    await pass(page);
    await audit(page, "regex");

    await page.goto("/intermediate/input#lesson/8");
    await page.getByLabel("Name").fill('" autofocus="');
    await expect(page.locator(".ui-encode td.bad")).toHaveCount(2);
    await pass(page);
    await audit(page, "encode");

    // The Intermediate labs read the lab dictionaries.
    await page.context().addCookies([
      {
        name: "cybervalue-locale",
        value: "uz",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.reload();
    await expect(
      page.getByRole("columnheader", { name: "Kodlash" }),
    ).toBeVisible();
    await page.goto("/intermediate/http");
    await expect(
      page.getByRole("heading", { level: 1, name: /HTTP chuqurroq/ }),
    ).toBeVisible();
  });
});

test("the module shows in Uzbek", async ({ page, context }) => {
  await context.addCookies([
    { name: "cybervalue-locale", value: "uz", domain: "localhost", path: "/" },
  ]);
  await page.goto("/intermediate/input");
  await expect(page).toHaveTitle(/Kiritilgan ma’lumot xavfi/);
});
