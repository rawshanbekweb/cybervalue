import { createHash, randomBytes, randomUUID } from "node:crypto";
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

async function audit(page: Page, label: string, include?: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21aa",
  ]);
  if (include) builder = builder.include(include);
  const result = await builder.analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    label,
  ).toEqual([]);
}

async function answerAll(page: Page, card: ReturnType<Page["locator"]>) {
  const questions = card.locator(".cp-form li");
  const count = await questions.count();
  for (let i = 0; i < count; i++)
    await questions.nth(i).getByRole("radio").first().check();
  return count;
}

test("anyone can take a checkpoint; the server grades it", async ({ page }) => {
  await page.goto("/akademiya/network-basics");
  await page.getByRole("link", { name: "Checkpoints" }).click();
  const section = page.locator("#checkpoints");
  await expect(section).toContainText("Sign in to the student area first");
  const card = section.getByRole("article", {
    name: "Checkpoint: IP, mask and gateway",
  });
  await card.getByRole("button", { name: "Take the test" }).click();
  await expect(card.locator(".cp-form li")).toHaveCount(12);
  expect(await answerAll(page, card)).toBe(12);
  await expect(card).toContainText("12/12 answered");
  await card.getByRole("button", { name: "Submit" }).click();
  const result = card.getByRole("status");
  await expect(result).toContainText(/\d+\/12 · \d+%/);
  await expect(result).not.toContainText("Result saved");
  // The right answers are shown only after grading.
  await expect(card.locator(".cp-right")).toHaveCount(12);
  await audit(page, "network checkpoint", "#checkpoints");

  await page.goto("/akademiya/linux-basics");
  const linux = page.getByRole("article", { name: "Checkpoint: Linux basics" });
  await linux.getByRole("button", { name: "Take the test" }).click();
  await expect(linux.locator(".cp-form li")).toHaveCount(10);
});

test("the API keeps answers on the server and rejects forged attempts", async ({
  request,
}) => {
  const start = await request.post("/student/api/checkpoint", {
    data: { action: "start", id: "network-2" },
  });
  expect(start.ok()).toBe(true);
  const body = await start.json();
  expect(body.questions).toHaveLength(10);
  expect(JSON.stringify(body.questions)).not.toContain('"answer"');
  const forged = `${body.token.split(".")[0]}.AAAA`;
  const bad = await request.post("/student/api/checkpoint", {
    data: { action: "submit", token: forged, answers: [] },
  });
  expect(bad.status()).toBe(400);
  const unknown = await request.post("/student/api/checkpoint", {
    data: { action: "start", id: "nope" },
  });
  expect(unknown.status()).toBe(400);
});

test.describe("saved results", () => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );

  test("a student's checkpoint shows on their page, in the ranking and in the class panel", async ({
    page,
    browser,
  }) => {
    const group = `cp-${Date.now().toString(36)}`;
    const name = `Malika ${group}`;
    const code = [...randomBytes(16)]
      .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
      .join("");
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    for (const [id, who, hash] of [
      [
        `e2e_${randomUUID()}`,
        name,
        createHash("sha256").update(code).digest("hex"),
      ],
      [`e2e_${randomUUID()}`, "Classmate One", randomUUID()],
    ])
      await client.query(
        `INSERT INTO "Student" (id, name, "group", "codeHash", "updatedAt")
         VALUES ($1, $2, $3, $4, now())`,
        [id, who, group, hash],
      );
    await client.end();

    await page.goto("/student/login");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page).toHaveURL(/\/student$/);
    await expect(page.getByLabel("Your rank")).toContainText("Trainee");
    await expect(page.getByLabel("Your rank")).toContainText("0 XP");

    await page.goto("/akademiya/network-basics#checkpoints");
    const section = page.locator("#checkpoints");
    await expect(section).toContainText("Malika, your result goes to");
    const card = section.getByRole("article", {
      name: "Checkpoint: where addresses come from",
    });
    await card.getByRole("button", { name: "Take the test" }).click();
    await answerAll(page, card);
    await card.getByRole("button", { name: "Submit" }).click();
    await expect(card.getByRole("status")).toContainText("Result saved.");
    await expect(card.locator(".cp-best")).toContainText("1 try");

    await page.goto("/student");
    const achievements = page.getByRole("region", { name: "Achievements" });
    await expect(achievements).toContainText(`Group ${group} ranking`);
    await expect(achievements.locator(".student-ranking li")).toHaveCount(2);
    await expect(achievements.locator(".student-ranking li.me")).toContainText(
      "Malika c.",
    );
    await expect(
      achievements.getByRole("link", {
        name: /Checkpoint: where addresses come from/,
      }),
    ).toContainText(/Passed|Best/);
    await audit(page, "student page with achievements");

    const admin = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await admin.goto("/admin/login");
    await admin.getByLabel("Email").fill(email!);
    await admin.getByLabel("Password").fill(password!);
    await admin.getByRole("button", { name: "Sign in" }).click();
    await expect(admin).toHaveURL(/\/admin$/);
    await admin.goto(`/admin/class?group=${group}`);
    await expect(
      admin.getByRole("heading", { level: 1, name: "Class" }),
    ).toBeVisible();
    const row = admin.getByRole("row", { name: new RegExp(name) });
    await expect(row.locator(".admin-chip").nth(1)).toContainText("%");
    // The classmate never did anything.
    await expect(admin.locator(".admin-attention")).toContainText(
      "Classmate One",
    );
    await audit(admin, "class panel");
    const csv = await admin.request.get(`/admin/class/export?group=${group}`);
    expect(await csv.text()).toContain(name);
    await admin.getByRole("link", { name }).first().click();
    await expect(admin.locator(".admin-table").first()).toContainText(
      "Checkpoint: where addresses come from",
    );
    await admin.context().close();
  });
});
