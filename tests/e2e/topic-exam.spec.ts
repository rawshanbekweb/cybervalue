import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
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
const PATH = "/intermediate/exam/ssh-crypto-tls";

test("visitors are sent to sign in for the SSH, cryptography and TLS exam", async ({
  browser,
}) => {
  const page = await (
    await browser.newContext({ storageState: english })
  ).newPage();
  await page.goto(PATH);
  await expect(page).toHaveURL(/\/student\/login/);
});

test.describe("the SSH, cryptography and TLS exam", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");
  test.skip(!process.env.E2E_ADMIN_EMAIL, "Requires E2E admin credentials");

  const studentId = `e2e_${randomUUID()}`;
  const name = `Topic ${studentId.slice(4, 12)}`;
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
  // A beginner: topic exams don't need the Intermediate level.
  test.beforeAll(() =>
    sql((c) =>
      c.query(
        `INSERT INTO "Student" (id, name, level, "updatedAt", "codeHash")
         VALUES ($1, $2, 'beginner', now(), $3)`,
        [studentId, name, createHash("sha256").update(code).digest("hex")],
      ),
    ),
  );
  test.afterAll(() =>
    sql((c) => c.query(`DELETE FROM "Student" WHERE id = $1`, [studentId])),
  );

  test("40 questions, sent to the teacher, approved with explanations", async ({
    browser,
  }) => {
    test.setTimeout(120000);
    const page = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = () => Promise.resolve();
      document.hasFocus = () => true;
    });
    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);
    await expect(
      page.getByRole("link", { name: /SSH, cryptography and TLS exam/ }),
    ).toHaveAttribute("href", PATH);
    await page.goto(PATH);
    await expect(
      page.getByRole("heading", {
        name: "SSH, cryptography, HTTPS/TLS and HTTP",
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(/40 questions on 5 topics, 45 minutes/),
    ).toBeVisible();
    await page.getByRole("button", { name: "Start the exam" }).click();
    await expect(page.getByRole("timer")).toHaveText(/^(45|44):\d\d$/);
    const questions = page.locator("fieldset.rx-question");
    await expect(questions).toHaveCount(40);

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
        ["tsx", "tests/e2e/exam-answers.ts", "ssh-crypto-tls", String(seed)],
        { encoding: "utf8" },
      ),
    );
    // Get the first one wrong, the rest right: 39 of 40.
    await questions
      .nth(0)
      .getByRole("radio")
      .nth((answers[0] + 1) % 4)
      .check();
    for (let i = 1; i < 40; i++)
      await questions.nth(i).getByRole("radio").nth(answers[i]).check();
    await expect(page.getByText("40 of 40 answered")).toBeVisible();
    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await page.getByRole("button", { name: "Yes, submit" }).click();
    await expect(
      page.getByRole("heading", { name: "Your result is with your teacher" }),
    ).toBeVisible();

    const staff = await (await browser.newContext()).newPage();
    await staff.goto("/admin/login");
    await staff.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
    await staff
      .getByLabel("Parol", { exact: true })
      .fill(process.env.E2E_ADMIN_PASSWORD!);
    await staff.getByRole("button", { name: "Tizimga kirish" }).click();
    await expect(staff).toHaveURL(/\/admin$/);
    await staff.goto("/teacher/domain-exams?domain=ssh-crypto-tls");
    const row = staff.getByRole("row").filter({ hasText: name });
    await row.getByRole("link", { name }).click();
    await expect(staff.getByText("Jami: 39/40")).toBeVisible();
    await staff
      .getByRole("button", { name: "Tasdiqlash va o‘quvchiga ko‘rsatish" })
      .click();
    await expect(
      staff.getByRole("row").filter({ hasText: name }),
    ).toContainText("Tasdiqlangan");

    await page.reload();
    await expect(page.locator(".rx-score")).toContainText("39 of 40");
    await expect(page.locator(".rx-score")).toContainText("Passed");
    await expect(page.locator(".rx-review .rx-explain")).toHaveCount(40);
  });
});
