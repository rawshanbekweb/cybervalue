import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
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

test("the lab is locked for visitors, and the old address leads to it", async ({
  page,
}) => {
  await page.goto("/akademiya/http");
  await expect(page).toHaveURL(/\/intermediate\/http$/);
  await expect(
    page.getByRole("heading", { name: "This lab is part of Intermediate." }),
  ).toBeVisible();
  await expect(page.getByLabel("Raw HTTP request")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Sign in with a code" }),
  ).toHaveAttribute("href", "/student/continue?to=%2Fintermediate%2Fhttp");
});

test.describe("an Intermediate student", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");
  test.describe.configure({ mode: "serial" });
  const id = randomUUID();
  const beginnerId = randomUUID();
  const code = newCode();
  const beginnerCode = newCode();

  test.beforeAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    for (const [sid, name, level, secret] of [
      [id, "Intermediate Pupil", "intermediate", code],
      [beginnerId, "Beginner Pupil", "beginner", beginnerCode],
    ])
      await client.query(
        `INSERT INTO "Student" (id, name, level, "codeHash", "updatedAt")
         VALUES ($1, $2, $3, $4, now())`,
        [sid, name, level, hash(secret)],
      );
    await client.end();
  });

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = ANY($1)`, [
      [id, beginnerId],
    ]);
    await client.end();
  });

  test("a beginner is told how Intermediate opens", async ({ page }) => {
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(beginnerCode);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);
    await page.goto("/intermediate/http");
    await expect(
      page.getByRole("heading", {
        name: "Your teacher has not opened Intermediate for you yet.",
      }),
    ).toBeVisible();
  });

  test("the HTTP lab sends raw requests to its training server", async ({
    page,
  }) => {
    await page.goto("/intermediate");
    await page
      .getByRole("link", { name: /HTTP in depth/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/intermediate\/http/);
    // Signing in brings the student back to the lab.
    await page.getByRole("link", { name: "Sign in with a code" }).click();
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/intermediate\/http$/);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "What an HTTP request looks like",
      }),
    ).toBeVisible();

    const raw = page.getByLabel("Raw HTTP request");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.locator(".nl-fail")).toContainText("Host");
    await raw.fill("GET / HTTP/1.1\nHost: shop.cybervalue.uz\n");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.locator(".hl-response")).toContainText("HTTP/1.1 200 OK");
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.locator(".nl-pass")).toContainText("Lesson completed");

    // Signing in returns a session cookie; the profile then answers 200.
    await page.goto("/intermediate/http#lesson/4");
    await raw.fill(
      "POST /login HTTP/1.1\nHost: shop.cybervalue.uz\n\nuser=ali&pass=kuchli-parol-2026",
    );
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.locator(".hl-response")).toContainText(
      "Set-Cookie: session=",
    );
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.locator(".nl-pass")).toBeVisible();

    await page.emulateMedia({ reducedMotion: "reduce" });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations.map((v) => v.id)).toEqual([]);

    // Same-origin sorting is checked answer by answer.
    await page.goto("/intermediate/http#lesson/7");
    const answers = [true, false, false, false, true];
    const groups = page.locator(".hl-choice fieldset");
    for (const [i, same] of answers.entries())
      await groups
        .nth(i)
        .getByLabel(same ? "Same origin" : "Different origin")
        .check();
    await page.getByRole("button", { name: "Check" }).click();
    await expect(page.locator(".nl-pass").first()).toContainText(
      "Lesson completed",
    );
  });

  test("teachers see the student's progress", async ({ page }) => {
    const email = process.env.E2E_ADMIN_EMAIL;
    const password = process.env.E2E_ADMIN_PASSWORD;
    test.skip(!email || !password, "Requires an admin account");
    await page.goto("/teacher/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/teacher$/);
    await page
      .getByRole("navigation", { name: "Admin sections" })
      .getByRole("link", { name: "Academy Intermediate" })
      .click();
    const row = page.getByRole("row", { name: /Intermediate Pupil/ });
    await expect(row).toContainText(/of 10 lessons/);
    await expect(page.getByText("Beginner Pupil")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations.map((v) => v.id)).toEqual([]);
  });
});
