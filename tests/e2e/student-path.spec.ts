import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";

const english = {
  cookies: [
    {
      name: "cybervalue-locale",
      value: "en",
      domain: "localhost",
      path: "/",
      expires: -1,
      httpOnly: true,
      secure: false,
      sameSite: "Lax" as const,
    },
  ],
  origins: [],
};

test.describe("My path on the student page", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");
  const made: string[] = [];

  async function student(browser: Browser, level: string) {
    const code = [...randomBytes(16)]
      .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
      .join("");
    const id = `e2e_${randomUUID()}`;
    made.push(id);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "Student" (id, name, level, "codeHash", "updatedAt")
       VALUES ($1, 'Path Pupil', $2, $3, now())`,
      [id, level, createHash("sha256").update(code).digest("hex")],
    );
    await client.query(
      `INSERT INTO "StudentLabProgress" ("studentId", lab, lessons, "updatedAt")
       VALUES ($1, 'linux', '{1,2,3}', now())`,
      [id],
    );
    await client.end();
    const page = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);
    return page;
  }

  test.afterAll(async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(`DELETE FROM "Student" WHERE id = ANY($1)`, [made]);
    await client.end();
  });

  test("a beginner sees their labs with checkpoints, and Intermediate locked", async ({
    browser,
  }) => {
    const page = await student(browser, "beginner");
    const path = page.getByRole("region", { name: "My path" });
    const linux = path
      .locator(".student-path-card")
      .filter({ hasText: "Linux foundations lab" });
    await expect(linux).toContainText("3 of 16 lessons");
    await expect(linux).toContainText("Checkpoint: Linux basics");
    await expect(linux.getByRole("link", { name: /Continue/ })).toBeVisible();
    // The started lab is the next step, marked on its card too.
    await expect(linux).toContainText("Next step");
    await expect(path).toContainText("Scam simulator");
    // Intermediate labs are not listed; the lock explains how they open.
    await expect(path).not.toContainText("HTTP in depth");
    await expect(path.locator(".student-path-locked")).toContainText(
      "Intermediate level",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations.map((v) => v.id)).toEqual([]);
    await page.context().close();
  });

  test("an Intermediate student sees the Intermediate labs", async ({
    browser,
  }) => {
    const page = await student(browser, "intermediate");
    const path = page.getByRole("region", { name: "My path" });
    for (const name of [
      "HTTP in depth",
      "Untrusted input",
      "Browser-side risks",
    ])
      await expect(path).toContainText(name);
    await expect(path.locator(".student-path-locked")).toHaveCount(0);
    await page.context().close();
  });
});
