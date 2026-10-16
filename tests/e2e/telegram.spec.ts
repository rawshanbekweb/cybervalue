import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createServer, type Server } from "node:http";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";

// Assertions use the English interface copy.
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
test.use({ storageState: english });

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
// The server under test sends to TELEGRAM_API_URL; this spec stands in for it.
const api = process.env.TELEGRAM_API_URL;

async function audit(page: Page, label: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
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

const serverKey = (purpose: string) =>
  createHash("sha256")
    .update(`${purpose}:${process.env.AUTH_SECRET || process.env.DATABASE_URL}`)
    .digest("hex");

test.describe("Telegram notifications and parent reports", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password || !api,
    "Requires DATABASE_URL, an admin account and TELEGRAM_API_URL",
  );
  test.describe.configure({ mode: "serial" });

  const sent: { chat_id: string; text: string }[] = [];
  let server: Server;
  const id = Date.now().toString(36);
  const group = `tg-${id}`;
  const code = [...randomBytes(16)]
    .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
    .join("");
  const studentId = `e2e_${randomUUID()}`;
  // Chat ids unique to this run.
  const base = Number(String(Date.now()).slice(-8));
  const chats = { teacher: base + 1, student: base + 2, parent: base + 3 };

  test.beforeAll(async () => {
    server = createServer((request, response) => {
      let body = "";
      request.on("data", (chunk) => (body += chunk));
      request.on("end", () => {
        if (request.url?.endsWith("/sendMessage")) {
          const data = JSON.parse(body);
          sent.push({ chat_id: String(data.chat_id), text: data.text });
        }
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ ok: true, result: {} }));
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(Number(new URL(api!).port), "127.0.0.1", resolve),
    );
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash")
       VALUES ($1, $2, $3, now(), $4)`,
      [
        studentId,
        `Malika ${id}`,
        group,
        createHash("sha256").update(code).digest("hex"),
      ],
    );
    await client.end();
  });

  test.afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  async function webhook(page: Page, chatId: number, text: string) {
    const response = await page.request.post("/api/telegram/webhook", {
      headers: {
        "X-Telegram-Bot-Api-Secret-Token": serverKey("telegram-webhook").slice(
          0,
          64,
        ),
      },
      data: {
        message: {
          chat: { id: chatId, type: "private", first_name: "Tester" },
          text,
        },
      },
    });
    expect(response.ok()).toBe(true);
    return (await response.json()) as { text: string };
  }

  const start = (href: string | null) =>
    `/start ${new URL(href!).searchParams.get("start")}`;

  async function signIn(page: Page) {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  }

  test("the webhook only answers Telegram", async ({ request }) => {
    const response = await request.post("/api/telegram/webhook", {
      headers: { "X-Telegram-Bot-Api-Secret-Token": "wrong" },
      data: { message: { chat: { id: 1, type: "private" }, text: "/start" } },
    });
    expect(response.status()).toBe(403);
    expect((await request.get("/api/cron/daily")).status()).toBe(401);
  });

  test("teacher, student and parent link their chats and get messages", async ({
    page,
    browser,
  }) => {
    await signIn(page);
    await page.goto("/admin/telegram");
    await expect(page.getByRole("heading", { name: /^Bot @/ })).toBeVisible();
    await audit(page, "telegram admin");
    const teacher = await webhook(
      page,
      chats.teacher,
      start(
        await page
          .getByRole("link", { name: "Link my Telegram" })
          .getAttribute("href"),
      ),
    );
    expect(teacher.text).toContain("Ulandi");
    // A forged payload is refused with the help text.
    expect(
      (await webhook(page, chats.teacher, "/start s123forged")).text,
    ).toContain("bildirishnomalar boti");

    // The student links from their own page.
    const student = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await student.goto("/student/login");
    await student.getByLabel("Access code").fill(code);
    await student.getByRole("button", { name: "Enter" }).click();
    await expect(student).toHaveURL(/\/student$/);
    const link = student.getByRole("link", {
      name: "Get assignment reminders in Telegram",
    });
    expect(
      (
        await webhook(
          page,
          chats.student,
          start(await link.getAttribute("href")),
        )
      ).text,
    ).toContain("eslatma");
    await student.context().close();

    // A new assignment for the group reaches the student's chat.
    await page.goto("/admin/assignments");
    await page.getByLabel("Title", { exact: true }).fill(`Lab check ${id}`);
    await page.getByLabel("Group").first().selectOption(group);
    await page
      .getByLabel("What to do")
      .selectOption({ value: "checkpoint:linux-1" });
    await page.getByRole("button", { name: "Create assignment" }).click();
    await expect(page.getByRole("status")).toHaveText("Assignment created.");
    expect(
      sent.find(
        (m) =>
          m.chat_id === String(chats.student) &&
          m.text.includes(`Yangi topshiriq:</b> Lab check ${id}`),
      ),
    ).toBeTruthy();

    // The parent report link and the parent's Telegram link.
    await page.goto(`/admin/students/${studentId}`);
    await page.getByRole("button", { name: "Create report link" }).click();
    const reportUrl = await page.getByLabel("Report link").inputValue();
    expect(reportUrl).toMatch(/\/report\/[A-Za-z0-9_-]{24}$/);
    const parentLink = await page
      .getByLabel("Weekly report in Telegram")
      .inputValue();
    expect(
      (await webhook(page, chats.parent, start(parentLink))).text,
    ).toContain("farzandingiz");
    await page.reload();
    await expect(
      page.getByText("1 parent chats receive the weekly summary."),
    ).toBeVisible();

    const parent = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await parent.goto(new URL(reportUrl).pathname);
    await expect(
      parent.getByRole("heading", {
        level: 1,
        name: new RegExp(`Malika ${id}`),
      }),
    ).toBeVisible();
    await expect(parent.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(
      parent.getByRole("heading", { name: "Assignments" }),
    ).toBeVisible();
    await expect(parent.getByText(`Lab check ${id}`)).toBeVisible();
    await audit(parent, "parent report");
    // Turning the link off closes the page.
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Turn off" }).click();
    await expect(
      page.getByRole("button", { name: "Create report link" }),
    ).toBeVisible();
    expect((await parent.goto(new URL(reportUrl).pathname))?.status()).toBe(
      404,
    );
    await parent.context().close();

    // The daily job reminds once about work due within a day.
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "StudentAssignment" (id, title, "group", target, "dueAt")
       VALUES ($1, $2, $3, 'lab:html', now() + interval '6 hours')`,
      [`e2e_${randomUUID()}`, `Soon ${id}`, group],
    );
    await client.end();
    const cron = () =>
      page.request.get("/api/cron/daily", {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      });
    expect((await cron()).ok()).toBe(true);
    const reminders = () =>
      sent.filter(
        (m) =>
          m.chat_id === String(chats.student) &&
          m.text.includes(`“Soon ${id}”`),
      ).length;
    expect(reminders()).toBe(1);
    expect((await cron()).ok()).toBe(true);
    expect(reminders()).toBe(1);

    // /stop unlinks the chat.
    expect((await webhook(page, chats.student, "/stop")).text).toContain(
      "to‘xtatildi",
    );
    await page.goto("/admin/telegram");
    await expect(page.locator("tr", { hasText: `Malika ${id}` })).toHaveCount(
      0,
    );
    await webhook(page, chats.teacher, "/stop");
  });
});
