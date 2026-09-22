import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID, randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import {
  ASSESSMENT_PATH,
  type AttemptView,
} from "../../src/lib/html-assessment/contract";
import {
  hashCredential,
  newCode,
  startAttempt,
  accessAttempt,
  finalizeExpired,
} from "../../src/lib/html-assessment/service";
import { questionsFor } from "../../src/lib/html-assessment/challenge";
import { completedHtml } from "../fixtures/html-assessment";

const api = `${ASSESSMENT_PATH}/api`;
const origin = "http://localhost:3000";
const isolated = process.env.E2E_HTML_ASSESSMENT === "true";
const prefix = process.env.E2E_HTML_PREFIX ?? `html-${randomUUID()}`;

test("assessment entry is accessible and private endpoints reject anonymous writes", async ({
  page,
  request,
}) => {
  await page.goto(ASSESSMENT_PATH);
  await expect(
    page.getByRole("button", { name: "Kodni tekshirish" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  expect((await request.get(api)).headers()["cache-control"]).toBe("no-store");
  expect(
    (
      await request.patch(api, { headers: { origin }, data: { submit: true } })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post(api, {
        headers: { origin: "https://foreign.example" },
        data: { action: "start", code: "ABC" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (await request.get("/admin/assessments/missing/export")).status(),
  ).toBe(401);
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/html-assessment-entry-${width}.png`,
      fullPage: true,
    });
  }
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test.describe("isolated assessment", () => {
  test.skip(
    !isolated,
    "Run npm run test:assessment with a local test database",
  );
  let db: PrismaClient;
  test.beforeAll(() => {
    const connectionString = process.env.DATABASE_URL!;
    if (new URL(connectionString).hostname !== "127.0.0.1")
      throw new Error("Local test database required");
    db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  });
  test.afterAll(async () => {
    if (db) {
      await db.htmlExam.deleteMany({
        where: { title: { startsWith: prefix } },
      });
      await db.$disconnect();
    }
  });

  test("teacher creates codes, pupil completes one attempt, teacher grades explanations and exports results", async ({
    page,
    browser,
    request,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
    await page
      .getByLabel("Password", { exact: true })
      .fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/assessments");
    await page.getByLabel("Sinov nomi").fill(`${prefix}-class`);
    await page
      .getByLabel("O‘quvchilar:", { exact: false })
      .fill("001 | Sinov O‘quvchisi\n001 | Takrorlangan ID");
    await page
      .getByRole("button", { name: "Sinov va shaxsiy kodlarni yaratish" })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "takrorlanmasligi" }),
    ).toBeVisible();
    await page
      .getByLabel("O‘quvchilar:", { exact: false })
      .fill("001 | Sinov O‘quvchisi");
    await page
      .getByRole("button", { name: "Sinov va shaxsiy kodlarni yaratish" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Sinov yaratildi" }),
    ).toBeVisible();
    await page.getByText("Kodlarni ko‘rish", { exact: true }).click();
    const code = (await page.locator("pre").innerText()).split(" | ").at(-1)!;
    const detailUrl = (await page
      .getByRole("link", { name: "Natijalar sahifasiga o‘tish" })
      .getAttribute("href"))!;
    const context = await browser.newContext();
    try {
      const student = await context.newPage();
      await student.goto(ASSESSMENT_PATH);
      await student.getByLabel("O‘qituvchi bergan kod").fill(code);
      await student.getByRole("button", { name: "Kodni tekshirish" }).click();
      await expect(
        student.getByText("45 daqiqa", { exact: true }),
      ).toBeVisible();
      await student.getByRole("checkbox").check();
      await student.getByRole("button", { name: "Sinovni boshlash" }).click();
      await expect(student.getByLabel("HTML muharriri")).toBeVisible();
      const initial = (await (await context.request.get(api)).json())
        .attempt as AttemptView;
      expect(initial.challenge.questions.every((q) => !("correct" in q))).toBe(
        true,
      );
      expect(
        (
          await request.post(api, {
            headers: { origin },
            data: { action: "start", code },
          })
        ).status(),
      ).toBe(409);
      const html = completedHtml(initial.challenge.variant);
      await student.getByLabel("HTML muharriri").fill(html);
      await student.getByLabel("HTML muharriri").dispatchEvent("paste");
      await expect(
        student.getByText(/Tayyor matn yoki fayl joylash o‘chirilgan/),
      ).toBeVisible();
      await expect(student.getByLabel("HTML muharriri")).toHaveValue(html);
      await student.evaluate(async () => {
        if (document.fullscreenElement) await document.exitFullscreen();
      });
      for (const width of [375, 1280]) {
        await student.setViewportSize({ width, height: 900 });
        expect(
          await student.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
      await student.evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
        window.scrollTo(0, 0);
      });
      await student.screenshot({
        path: "test-results/html-assessment-working.png",
        fullPage: true,
      });
      const workingAccessibility = await new AxeBuilder({ page: student })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(workingAccessibility.violations).toEqual([]);
      await student
        .getByRole("button", { name: "Ko‘rinishni yangilash" })
        .click();
      await expect(student.locator("iframe")).toHaveAttribute("sandbox", "");
      await student
        .getByRole("button", { name: /02 · Fikrlash testi/ })
        .click();
      for (const q of questionsFor(initial.challenge.variant))
        await student
          .locator(`input[name="${q.id}"][value="${q.correct}"]`)
          .check();
      await student.getByRole("button", { name: /03 · Yechim izohi/ }).click();
      for (const textarea of await student.locator("textarea").all())
        await textarea.fill(
          "Label for va input id bir xil bo‘lishi kerak. for=email va id=email qilib tuzatdim, shunda labelni bosgan foydalanuvchi email maydoniga o‘tadi.",
        );
      await student.getByRole("button", { name: "Hozir saqlash" }).click();
      await expect(
        student.getByRole("status").filter({ hasText: "Serverga saqlangan" }),
      ).toBeVisible();
      await student.reload();
      await expect(student.getByLabel("HTML muharriri")).toHaveValue(html);
      const resumed = (await (await context.request.get(api)).json())
        .attempt as AttemptView;
      expect(resumed.deadline).toBe(initial.deadline);
      expect(resumed.draft.signals.paste).toBe(1);
      student.on("dialog", (dialog) => dialog.accept());
      await student
        .getByRole("button", { name: "Ishni yakunlash va topshirish" })
        .click();
      await expect(
        student.getByRole("heading", { name: "Ish topshirildi." }),
      ).toBeVisible();
      await expect(student.locator(".exam-result-score")).toHaveText("90/90");
      const saved = await db.htmlCandidate.findUniqueOrThrow({
        where: { id: initial.id },
      });
      expect(saved.autoScore).toBe(90);
      const repeated = await context.request.patch(api, {
        headers: { origin },
        data: { draft: { ...resumed.draft, code: "" }, submit: true },
      });
      expect((await repeated.json()).attempt.autoScore).toBe(90);
      await page.goto(`${detailUrl}?student=${initial.id}`);
      await page.getByLabel("Izohlar bali").fill("8");
      await page
        .getByLabel("O‘quvchiga fikr-mulohaza")
        .fill("Yaxshi tahlil, ro‘yxat tanlovini yanada aniq izohlang.");
      await page.getByRole("button", { name: "Bahoni saqlash" }).click();
      await expect(page.getByRole("status")).toContainText("Baho saqlandi");
      const csv = await page.request.get(`${detailUrl}/export`);
      expect(csv.status()).toBe(200);
      expect(await csv.text()).toContain('"98"');
      await student.reload();
      await expect(student.locator(".exam-result-score")).toHaveText("98/100");
      await page
        .getByRole("button", { name: "Yangi kirishlarni yopish" })
        .click();
      await expect(
        page.getByText("Yangi urinish boshlash yopilgan.", { exact: false }),
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("server serializes starts and writes, ignores late payloads and finalizes a closed browser", async () => {
    const code = newCode();
    const exam = await db.htmlExam.create({
      data: {
        title: `${prefix}-race`,
        minutes: 45,
        candidates: {
          create: {
            name: "Concurrency",
            studentId: "race",
            codeHash: hashCredential(code),
            variant: 0,
          },
        },
      },
    });
    const tokens = [
      randomBytes(32).toString("hex"),
      randomBytes(32).toString("hex"),
    ];
    const starts = await Promise.allSettled(
      tokens.map((token) => startAttempt(db, code, token)),
    );
    expect(starts.filter((s) => s.status === "fulfilled")).toHaveLength(1);
    const token = tokens[starts.findIndex((s) => s.status === "fulfilled")];
    const candidate = await accessAttempt(db, token);
    const draft = {
      revision: 0,
      code: completedHtml(0),
      answers: {},
      explanations: ["", ""] as [string, string],
      signals: { hidden: 0, paste: 0, fullscreen: 0 },
    };
    const writes = await Promise.allSettled([
      accessAttempt(db, token, draft),
      accessAttempt(db, token, { ...draft, code: "late conflicting code" }),
    ]);
    expect(writes.filter((s) => s.status === "fulfilled")).toHaveLength(1);
    const accepted = await accessAttempt(db, token);
    await db.htmlCandidate.update({
      where: { id: candidate.id },
      data: { deadline: new Date(Date.now() - 1000) },
    });
    const late = await accessAttempt(
      db,
      token,
      { ...draft, revision: accepted.revision, code: "late replacement" },
      true,
    );
    expect(late.code).toBe(accepted.code);
    expect(late.finishReason).toBe("timeout");
    expect(late.submittedAt).not.toBeNull();
    expect((await accessAttempt(db, token)).autoScore).toBe(late.autoScore);
    await db.htmlExam.delete({ where: { id: exam.id } });
  });

  test("browser countdown submits automatically and teacher reads finalize abandoned attempts", async ({
    page,
    context,
  }) => {
    const code = newCode();
    const secondCode = newCode();
    const exam = await db.htmlExam.create({
      data: {
        title: `${prefix}-timeout`,
        minutes: 15,
        candidates: {
          create: [
            {
              name: "Timer Student",
              studentId: "timer",
              codeHash: hashCredential(code),
              variant: 0,
            },
            {
              name: "Closed Browser",
              studentId: "closed",
              codeHash: hashCredential(secondCode),
              variant: 1,
            },
          ],
        },
      },
    });
    const response = await context.request.post(api, {
      headers: { origin },
      data: { action: "start", code },
    });
    const started = (await response.json()).attempt as AttemptView;
    expect(response.status()).toBe(200);
    await db.htmlCandidate.update({
      where: { id: started.id },
      data: { deadline: new Date(Date.now() + 4500) },
    });
    await page.goto(ASSESSMENT_PATH);
    await expect(page.getByLabel("HTML muharriri")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Vaqt tugadi." }),
    ).toBeVisible({ timeout: 12000 });
    const token = randomBytes(32).toString("hex");
    const abandoned = await startAttempt(db, secondCode, token);
    await db.htmlCandidate.update({
      where: { id: abandoned.id },
      data: { deadline: new Date(Date.now() - 1000) },
    });
    await finalizeExpired(db, exam.id);
    const final = await db.htmlCandidate.findUniqueOrThrow({
      where: { id: abandoned.id },
    });
    expect(final.finishReason).toBe("timeout");
    expect(final.submittedAt).not.toBeNull();
    const unusedCode = newCode();
    await db.htmlCandidate.create({
      data: {
        examId: exam.id,
        studentId: "unused",
        name: "Unused Code",
        variant: 0,
        codeHash: hashCredential(unusedCode),
      },
    });
    await db.htmlExam.update({
      where: { id: exam.id },
      data: { closed: true },
    });
    await expect(
      startAttempt(db, unusedCode, randomBytes(32).toString("hex")),
    ).rejects.toThrow("kirishni yopgan");
  });
});
