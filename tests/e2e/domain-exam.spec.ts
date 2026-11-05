import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type Browser, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";
import { execFileSync } from "node:child_process";

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

// Headless Chromium enters and leaves full screen and loses focus on its
// own, which the guard would count as leaving; the test decides instead.
const noFullscreen = (page: Page) =>
  page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.resolve();
    const w = window as Window & { away?: boolean };
    document.hasFocus = () => !w.away;
  });

test("the roadmap links each domain's final exam, which visitors can't open", async ({
  browser,
}) => {
  const page = await (
    await browser.newContext({ storageState: english })
  ).newPage();
  await page.goto("/intermediate");
  await expect(
    page.locator("#crypto").getByRole("link", { name: /Final exam/ }),
  ).toHaveAttribute("href", "/intermediate/exam/crypto");
  await page.goto("/intermediate/exam/crypto");
  await expect(
    page.getByRole("heading", { name: "This lab is part of Intermediate." }),
  ).toBeVisible();
  const missing = await page.goto("/intermediate/exam/nope");
  expect(missing?.status()).toBe(404);
});

test.describe("a student's final exam waits for the teacher", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");
  test.skip(!process.env.E2E_ADMIN_EMAIL, "Requires E2E admin credentials");

  const studentId = `e2e_${randomUUID()}`;
  const name = `Exam ${studentId.slice(4, 12)}`;
  const code = [...randomBytes(16)]
    .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
    .join("");
  const sql = async <T>(fn: (c: Client) => Promise<T>) => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      return await fn(client);
    } finally {
      await client.end();
    }
  };
  test.beforeAll(() =>
    sql((c) =>
      c.query(
        `INSERT INTO "Student" (id, name, level, "updatedAt", "codeHash")
         VALUES ($1, $2, 'intermediate', now(), $3)`,
        [studentId, name, createHash("sha256").update(code).digest("hex")],
      ),
    ),
  );
  test.afterAll(() =>
    sql((c) => c.query(`DELETE FROM "Student" WHERE id = $1`, [studentId])),
  );

  async function student(browser: Browser) {
    const page = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await noFullscreen(page);
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);
    await page.goto("/intermediate/exam/crypto");
    return page;
  }
  async function teacher(browser: Browser) {
    const page = await (await browser.newContext()).newPage();
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
    await page
      .getByLabel("Parol", { exact: true })
      .fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Tizimga kirish" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/teacher/domain-exams?domain=crypto");
    return page;
  }

  test("saved on the server, approved by the teacher, then retaken", async ({
    browser,
  }) => {
    test.setTimeout(120000);
    const page = await student(browser);
    await expect(
      page.getByRole("heading", { name: "Cryptography", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText(/20 questions from all 5 modules/),
    ).toBeVisible();
    await page.getByRole("button", { name: "Start the exam" }).click();
    await expect(page.getByRole("timer")).toHaveText(/^(30|29):\d\d$/);
    const questions = page.locator("fieldset.rx-question");
    await expect(questions).toHaveCount(20);

    // Copy and the context menu are cancelled while the exam runs.
    const blocked = await page.evaluate(() =>
      ["copy", "contextmenu"].map(
        (type) =>
          !document.dispatchEvent(
            new Event(type, { bubbles: true, cancelable: true }),
          ),
      ),
    );
    expect(blocked).toEqual([true, true]);

    // Answers are saved on the server: a reload resumes them.
    const saved = page.waitForResponse(
      (r) =>
        r.url().endsWith("/intermediate/exam/crypto/api") &&
        (r.request().postData() ?? "").includes('"save"'),
    );
    await questions.nth(0).getByRole("radio").nth(1).check();
    expect((await saved).ok()).toBe(true);
    await page.reload();
    await page.getByRole("button", { name: "Continue the exam" }).click();
    await expect(questions.nth(0).getByRole("radio").nth(1)).toBeChecked();

    // The right answers, rebuilt from the attempt's seed as the server does.
    const {
      rows: [{ seed }],
    } = await sql((c) =>
      c.query(`SELECT seed FROM "DomainExamAttempt" WHERE "studentId" = $1`, [
        studentId,
      ]),
    );
    const answers: number[] = JSON.parse(
      execFileSync(
        "npx",
        ["tsx", "tests/e2e/exam-answers.ts", "crypto", String(seed)],
        {
          encoding: "utf8",
        },
      ),
    );
    for (let i = 0; i < 20; i++)
      await questions.nth(i).getByRole("radio").nth(answers[i]).check();
    await expect(page.getByText("20 of 20 answered")).toBeVisible();

    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations.map((v) => v.id)).toEqual([]);

    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await page.getByRole("button", { name: "Yes, submit" }).click();
    await expect(
      page.getByRole("heading", { name: "Your result is with your teacher" }),
    ).toBeVisible();
    // No score until the teacher approves, even after a reload.
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Your result is with your teacher" }),
    ).toBeVisible();
    await expect(page.locator(".rx-review")).toHaveCount(0);

    const { rows } = await sql((c) =>
      c.query(
        `SELECT score, total, "finishReason" FROM "DomainExamAttempt" WHERE "studentId" = $1`,
        [studentId],
      ),
    );
    expect(rows).toEqual([{ score: 20, total: 20, finishReason: "submitted" }]);

    // The teacher sees the attempt, adds a note and approves.
    const staff = await teacher(browser);
    const row = staff.getByRole("row").filter({ hasText: name });
    await expect(row).toContainText("Baholanishi kutilmoqda");
    await row.getByRole("link", { name }).click();
    await expect(staff.getByText("Jami: 20/20")).toBeVisible();
    await staff.getByLabel("O‘quvchiga izoh").fill("Review the TLS module.");
    await staff
      .getByRole("button", { name: "Tasdiqlash va o‘quvchiga ko‘rsatish" })
      .click();
    await expect(
      staff.getByRole("row").filter({ hasText: name }),
    ).toContainText("Tasdiqlangan");

    // Now the student sees the result, with an explanation under every
    // question and a link back to its module.
    await page.reload();
    await expect(page.getByText("RESULT APPROVED")).toBeVisible();
    await expect(page.locator(".rx-score")).toContainText("20 of 20");
    await expect(page.locator(".rx-score")).toContainText("Passed");
    await expect(page.getByText("Review the TLS module.")).toBeVisible();
    await expect(page.locator(".rx-review")).toHaveCount(20);
    await expect(page.locator(".rx-review .rx-explain")).toHaveCount(20);
    await expect(
      page.getByRole("link", { name: /Revisit: Classical ciphers/ }).first(),
    ).toHaveAttribute("href", "/intermediate/classic");

    // The approved pass earned the domain's certificate.
    await page.getByRole("link", { name: "Open your certificate" }).click();
    await expect(page).toHaveURL(/\/student\/certificate\/[0-9A-Z]{12}$/);
    await expect(
      page.getByText("Kriptografiya (Academy Intermediate)"),
    ).toBeVisible();
    const { rows: certificates } = await sql((c) =>
      c.query(
        `SELECT rule, level FROM "StudentCertificate" WHERE "studentId" = $1`,
        [studentId],
      ),
    );
    expect(certificates).toEqual([
      { rule: "exam-crypto", level: "intermediate" },
    ]);
    await page.goto("/intermediate/exam/crypto");

    // A retake deletes the attempt and opens the exam again.
    await staff
      .getByRole("button", {
        name: "Urinishni o‘chirish va qayta topshirishga ruxsat berish",
      })
      .click();
    await expect(staff.getByRole("row").filter({ hasText: name })).toHaveCount(
      0,
    );
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Start the exam" }),
    ).toBeVisible();
  });
});
