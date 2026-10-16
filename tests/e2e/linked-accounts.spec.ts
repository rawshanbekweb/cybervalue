import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type Browser, type Page } from "@playwright/test";
import { Client } from "pg";
import { createJunior } from "./junior-member";

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

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function student(browser: Browser, code: string) {
  const page = await (
    await browser.newContext({ storageState: english })
  ).newPage();
  await page.goto("/student/login");
  await page.getByLabel("Access code").fill(code);
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(page).toHaveURL(/\/student$/);
  return page;
}

async function newStudent(name: string, group: string) {
  const code = [...randomBytes(16)]
    .map((b) => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[b & 31])
    .join("");
  const id = `e2e_${randomUUID()}`;
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(
    `INSERT INTO "Student" (id, name, "group", "updatedAt", "codeHash")
     VALUES ($1, $2, $3, now(), $4)`,
    [id, name, group, createHash("sha256").update(code).digest("hex")],
  );
  await client.end();
  return { id, code };
}

test.describe("linked accounts", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );

  test("a Junior member moves to the Academy with XP and a certificate", async ({
    page,
    browser,
  }) => {
    const id = Date.now().toString(36);
    const member = await createJunior({
      name: `Kamol ${id}`,
      group: `j-${id}`,
      progress: {
        missions: {
          password: true,
          phishing: true,
          cipher: true,
          footprint: true,
          ctf: true,
          ethics: true,
        },
      },
    });
    await signIn(page);
    await page.goto(`/admin/junior/${member.id}`);
    await page.getByLabel("Academy group").fill(`a-${id}`);
    await page
      .getByRole("button", { name: "Create the Academy account" })
      .click();
    const code = (await page.locator("code.student-code").textContent())!;
    expect(code).toMatch(/^[0-9A-Z]{4}(-[0-9A-Z]{4}){3}$/);
    await page.reload();
    await expect(page.getByText("Moved to the Academy:")).toBeVisible();

    const academy = await student(browser, code);
    await expect(academy.locator(".student-label")).toContainText(
      `Group a-${id}`,
    );
    await expect(academy.getByLabel("Your rank")).toContainText("600 XP");
    await expect(
      academy.getByRole("link", {
        name: /Academy Junior: kiberxavfsizlik asoslari/,
      }),
    ).toBeVisible();
    await academy.context().close();

    // The Junior account was closed.
    const junior = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await junior.goto("/junior");
    await junior.getByLabel(/Access code|Kirish kodi/).fill(member.code);
    await junior.getByRole("button", { name: /^(Enter|Kirish)$/ }).click();
    await expect(
      junior.getByText("This access code is not valid or no longer active."),
    ).toBeVisible();
    await junior.context().close();
  });

  test("finishing a lab and its checkpoint issues a certificate by itself", async ({
    browser,
  }) => {
    const id = Date.now().toString(36);
    const { id: studentId, code } = await newStudent(`Lola ${id}`, `c-${id}`);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "StudentCheckpoint" (id, "studentId", checkpoint, seed, score, total)
       VALUES ($1, $2, 'linux-1', 1, 9, 10)`,
      [`e2e_${randomUUID()}`, studentId],
    );
    await client.end();
    const page = await student(browser, code);
    const almost = await page.request.put("/student/api/progress", {
      data: {
        lab: "linux",
        lessons: Array.from({ length: 15 }, (_, i) => i + 1),
      },
    });
    expect((await almost.json()).certificates).toEqual([]);
    const done = await page.request.put("/student/api/progress", {
      data: {
        lab: "linux",
        lessons: Array.from({ length: 16 }, (_, i) => i + 1),
      },
    });
    expect((await done.json()).certificates).toEqual(["Linux asoslari"]);
    // Only once.
    const again = await page.request.put("/student/api/progress", {
      data: {
        lab: "linux",
        lessons: Array.from({ length: 16 }, (_, i) => i + 1),
      },
    });
    expect((await again.json()).certificates).toEqual([]);
    await page.reload();
    await expect(
      page.getByRole("link", { name: /Linux asoslari/ }),
    ).toBeVisible();
    await page.context().close();
  });

  test("a group's students start the HTML exam from their own page", async ({
    page,
    browser,
  }) => {
    test.skip(!process.env.E2E_HTML_ASSESSMENT, "Requires E2E_HTML_ASSESSMENT");
    const id = Date.now().toString(36);
    const group = `h-${id}`;
    const { code } = await newStudent(`Nodir ${id}`, group);
    await signIn(page);
    await page.goto("/admin/assessments");
    await page.getByLabel("Test name").fill(`HTML ${id}`);
    await page
      .getByLabel(
        "Student-area group (they start from their own page, no code)",
      )
      .selectOption(group);
    await page
      .getByRole("button", { name: "Create the test and personal codes" })
      .click();
    await expect(
      page.getByText("1 students of the group start the exam"),
    ).toBeVisible();

    const pupil = await student(browser, code);
    const card = pupil.locator(".student-html-exam", { hasText: `HTML ${id}` });
    await expect(card).toContainText("45 minutes, one attempt");
    await card.getByRole("button", { name: "Start the exam" }).click();
    await expect(pupil).toHaveURL(/\/akademiya\/html-basics\/assessment$/);
    await expect(pupil.getByRole("button", { name: "Save now" })).toBeVisible();
    // Back on the student page the same exam continues.
    await pupil.goto("/student");
    await expect(
      card.getByRole("button", { name: "Continue the exam" }),
    ).toBeVisible();
    await pupil.context().close();
  });
});
