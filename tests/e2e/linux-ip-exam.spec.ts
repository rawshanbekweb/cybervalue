import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type Browser, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";

const ANSWERS: [string, number][] = [
  ["l1", 1],
  ["l2", 2],
  ["l3", 3],
  ["l4", 0],
  ["l5", 3],
  ["l6", 1],
  ["l7", 2],
  ["l8", 0],
  ["l9", 1],
  ["l10", 3],
  ["l11", 1],
  ["l12", 0],
  ["l13", 2],
  ["l14", 2],
  ["l15", 1],
  ["l16", 2],
  ["l17", 3],
  ["l18", 0],
  ["l19", 1],
  ["l20", 2],
  ["n1", 1],
  ["n2", 2],
  ["n3", 1],
  ["n4", 3],
  ["n5", 1],
  ["n6", 0],
  ["n7", 2],
  ["n8", 1],
  ["n9", 2],
  ["n10", 3],
  ["n11", 1],
  ["n12", 1],
  ["n13", 1],
  ["n14", 2],
  ["n15", 1],
  ["n16", 2],
  ["n17", 3],
  ["n18", 2],
  ["n19", 0],
  ["n20", 3],
];

const OPENS: [string, string][] = [
  ["o1", "tail -n 5 /etc/passwd"],
  ["o2", "30"],
  ["o3", "chmod 750 script.sh"],
  ["o4", 'grep -c "Failed password" /var/log/auth.log'],
  ["o5", "172.16.32.0"],
  ["o6", "192.168.1.95"],
  ["o7", "2001:db8::ff00:42:8329"],
  ["o8", "/22"],
  ["o9", "ss -tlnp | grep 8080"],
  ["o10", 'find . -name "*.log" -mtime +7 -delete'],
];

// Headless Chromium enters and leaves full screen and loses focus on its
// own, which the guard would count as leaving; the test decides instead
// (window.away) and dispatches the events itself.
const noFullscreen = (page: Page) =>
  page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.resolve();
    const w = window as Window & { away?: boolean };
    document.hasFocus = () => !w.away;
  });

test("Resources links to the exam, which asks a visitor to sign in", async ({
  page,
  request,
}) => {
  await page.goto("/resources");
  await page
    .getByRole("link", { name: "Linux va IP imtihonini boshlash" })
    .click();
  await expect(page).toHaveURL(/\/resources\/linux-ip-exam$/);
  await expect(
    page.getByRole("heading", { name: /Linux va IP manzil imtihoni/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "O‘quvchi hisobi bilan kiring" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Kirish va imtihonni boshlash" }),
  ).toHaveAttribute("href", /\/student\/continue\?to=/);
  await expect(
    page.getByRole("button", { name: "Imtihonni boshlash" }),
  ).toHaveCount(0);

  const response = await request.post("/resources/linux-ip-exam/api", {
    headers: { origin: new URL(page.url()).origin },
    data: { action: "start" },
  });
  expect([401, 503]).toContain(response.status());
});

test.describe("a student's attempt waits for the teacher", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");
  test.skip(!process.env.E2E_ADMIN_EMAIL, "Requires E2E admin credentials");

  const studentId = `e2e_${randomUUID()}`;
  const name = `Imtihon ${studentId.slice(4, 12)}`;
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
        `INSERT INTO "Student" (id, name, "updatedAt", "codeHash")
         VALUES ($1, $2, now(), $3)`,
        [studentId, name, createHash("sha256").update(code).digest("hex")],
      ),
    ),
  );
  test.afterAll(() =>
    sql((c) => c.query(`DELETE FROM "Student" WHERE id = $1`, [studentId])),
  );

  async function student(browser: Browser) {
    const page = await (await browser.newContext()).newPage();
    await noFullscreen(page);
    await page.goto("/resources/linux-ip-exam");
    await page
      .getByRole("link", { name: "Kirish va imtihonni boshlash" })
      .click();
    await page.getByLabel("Kirish kodi").fill(code);
    await page.getByRole("button", { name: "Kirish" }).click();
    await expect(page).toHaveURL(/\/resources\/linux-ip-exam$/);
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
    await page.goto("/teacher/linux-ip-exam");
    return page;
  }

  test("guarded, saved on the server, approved by the teacher, then retaken", async ({
    browser,
  }) => {
    test.setTimeout(120000);
    const page = await student(browser);
    await page.getByRole("button", { name: "Imtihonni boshlash" }).click();
    await expect(page.getByRole("timer")).toHaveText(/^[12]:\d\d:\d\d$/);

    // Copy, paste and the context menu are cancelled.
    const blocked = await page.evaluate(() =>
      ["copy", "paste", "contextmenu"].map(
        (type) =>
          !document.dispatchEvent(
            new Event(type, { bubbles: true, cancelable: true }),
          ),
      ),
    );
    expect(blocked).toEqual([true, true, true]);
    await expect(page.locator(".lip-guard")).toHaveCSS("user-select", "none");

    // Leaving the window hides the questions and is counted (after the
    // moment of switching to full screen, which doesn't count).
    await page.waitForTimeout(1700);
    await page.evaluate(() => {
      (window as Window & { away?: boolean }).away = true;
      window.dispatchEvent(new Event("blur"));
    });
    await expect(
      page
        .getByRole("alertdialog")
        .getByText("Siz imtihon oynasidan chiqdingiz"),
    ).toBeVisible();
    await expect(page.locator(".lip-body")).toBeHidden();
    await page.evaluate(() => {
      (window as Window & { away?: boolean }).away = false;
    });
    await page.getByRole("button", { name: "Imtihonga qaytish" }).click();
    await page.waitForTimeout(1700);
    await expect(page.locator(".lip-leaves")).toContainText(
      /oynadan chiqish: [1-9]/,
    );

    // Answers are saved on the server: a reload resumes them.
    const saved = page.waitForResponse(
      (r) =>
        r.url().endsWith("/resources/linux-ip-exam/api") &&
        (r.request().postData() ?? "").includes('"save"'),
    );
    await page.locator('input[name="l1"]').nth(1).check();
    expect((await saved).ok()).toBe(true);
    await page.reload();
    await page.getByRole("button", { name: "Davom ettirish" }).click();
    await expect(page.locator('input[name="l1"]').nth(1)).toBeChecked();

    for (const [id, index] of ANSWERS)
      await page.locator(`input[name="${id}"]`).nth(index).check();
    for (const [id, value] of OPENS)
      await page.locator(`#lip-in-${id}`).fill(value);
    await expect(page.getByText("50 / 50 javob berildi")).toBeVisible();

    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations.map((v) => v.id)).toEqual([]);

    await page.getByRole("button", { name: "Topshirish" }).click();
    await page.getByRole("button", { name: "Ha, topshirish" }).click();
    await expect(
      page.getByRole("heading", { name: "Natija o‘qituvchi tekshiruvida" }),
    ).toBeVisible();
    // No score until the teacher approves, even after a reload.
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Natija o‘qituvchi tekshiruvida" }),
    ).toBeVisible();
    await expect(page.locator(".rx-score")).toHaveCount(0);

    // The teacher sees the attempt, takes a point off o1 and approves.
    const staff = await teacher(browser);
    const row = staff.getByRole("row").filter({ hasText: name });
    await expect(row).toContainText("Tekshirish kutilmoqda");
    await expect(row).toContainText("100");
    await row.getByRole("link", { name }).click();
    await staff.locator('input[name="score-o1"]').fill("1");
    await staff
      .getByLabel("O‘quvchiga izoh")
      .fill("Yaxshi ish, -n ni unutmang.");
    await staff
      .getByRole("button", { name: "Tasdiqlash va o‘quvchiga ko‘rsatish" })
      .click();
    await expect(
      staff.getByRole("row").filter({ hasText: name }),
    ).toContainText("Tasdiqlangan");
    await expect(
      staff.getByText("Jami: 99/100", { exact: false }),
    ).toBeVisible();

    // Now the student sees the result with an explanation under every question.
    await page.reload();
    await expect(page.getByText("NATIJA", { exact: true })).toBeVisible();
    await expect(page.locator(".rx-score")).toContainText("99 / 100");
    await expect(page.getByText("Yaxshi ish, -n ni unutmang.")).toBeVisible();
    await expect(page.locator(".rx-review")).toHaveCount(50);
    await expect(page.locator(".rx-review .rx-explain")).toHaveCount(50);
    await expect(
      page.getByText("Ball o‘qituvchi tomonidan qo‘yilgan."),
    ).toBeVisible();
    await expect(page.getByText(/print working directory/)).toBeVisible();

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
    await page.getByRole("button", { name: "Imtihonni boshlash" }).click();
    await page.getByRole("button", { name: "Topshirish" }).click();
    await page.getByRole("button", { name: "Ha, topshirish" }).click();
    await expect(
      page.getByRole("heading", { name: "Natija o‘qituvchi tekshiruvida" }),
    ).toBeVisible();
    const { rows } = await sql((c) =>
      c.query(
        `SELECT "autoScore", "finishReason" FROM "LinuxIpAttempt" WHERE "studentId" = $1`,
        [studentId],
      ),
    );
    expect(rows).toEqual([{ autoScore: 0, finishReason: "submitted" }]);
  });
});
