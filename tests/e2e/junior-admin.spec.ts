import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { CIPHERS } from "../../src/lib/junior/cipher-content";
import { createJunior, enterCode } from "./junior-member";

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

test.describe("Academy Junior administration", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD for a seeded admin account",
  );

  test("admin issues codes, follows results and controls access", async ({
    page,
    browser,
  }) => {
    const group = `jr-${Date.now().toString(36)}`;
    const name = `Aziza ${group}`;
    // A classmate who is already ahead, for the group ranking.
    await createJunior({
      name: "Classmate",
      group,
      xp: 450,
    });

    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole("link", { name: /Academy Junior/ }).last(),
    ).toBeVisible();

    await page.goto("/teacher/junior");
    await page.getByLabel(/One member per line/).fill(`${name} | ${group}`);
    await page
      .getByRole("button", { name: "Create members and codes" })
      .click();
    const code = (await page.locator("code.student-code").first().innerText())
      .replace("-", "")
      .trim();
    expect(code).toMatch(/^[0-9A-Z]{8}$/);
    await audit(page, "junior codes");

    // The member signs in and solves one Caesar exercise.
    const member = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await member.goto("/junior/homework#cipher/4");
    await enterCode(member, code);
    await expect(member).toHaveURL(/\/junior\/homework/);
    await member.goto("/junior/homework#cipher/4");
    const first = member.locator(".cr-ex").first();
    await first.getByLabel("Your answer").fill("ALYD");
    await first.getByRole("button", { name: "Check" }).click();
    await expect(member.locator(".jr-topbar")).toContainText("15 XP");

    // The group ranking shows both, the member marked as "you".
    await member.goto("/junior/achievements");
    const ranking = member.locator(".jr-ranking");
    await expect(ranking.locator("li")).toHaveCount(2);
    await expect(ranking.locator("li").first()).toContainText("Classmate");
    await expect(ranking.locator("li.me")).toContainText("Aziza");
    await expect(ranking.locator("li.me")).toContainText("15 XP");

    // The admin sees the result in the group's table and on the member page.
    await page.goto(`/teacher/junior?group=${group}`);
    const row = page.getByRole("row", { name: new RegExp(name) });
    await expect(row).toContainText("15");
    await expect(row).toContainText("1/51");
    await audit(page, "junior list");
    const csv = await page.request.get(`/teacher/junior/export?group=${group}`);
    expect(csv.headers()["content-type"]).toContain("text/csv");
    const text = await csv.text();
    expect(text).toContain(name);
    expect(text).toContain("Classmate");

    await row.getByRole("link", { name }).click();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.locator(".admin-bars").first()).toContainText("1/6");
    await audit(page, "junior member");

    // A new code closes the member's session and the old code stops working.
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Issue a new access code" }).click();
    await expect(page.locator("code.student-code")).toBeVisible();
    await member.reload();
    await expect(member.getByLabel("Access code")).toBeVisible();
    await member.getByLabel("Access code").fill(code);
    await member.getByRole("button", { name: "Enter" }).click();
    await expect(
      member.getByText(/not valid or no longer active/),
    ).toBeVisible();

    // Resetting progress zeroes the results.
    await page.reload();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Reset progress" }).click();
    await expect(page.locator(".admin-cards")).toContainText("0 XP");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete member" }).click();
    await expect(page).toHaveURL(/\/teacher\/junior$/);
    await expect(page.getByText(name)).toHaveCount(0);
    await member.context().close();
  });

  test("teachers and parents see the stage, the level and the skills", async ({
    page,
  }) => {
    const name = `Bobur ${Date.now().toString(36)}`;
    await createJunior({
      name,
      progress: {
        missions: { password: true, phishing: true },
        ciphers: Object.fromEntries(
          CIPHERS.filter((c) => c.level === 1).map((c) => [
            c.id,
            c.exercises.map((_, i) => i),
          ]),
        ),
      },
    });
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/teacher/junior");
    const row = page.getByRole("row", { name: new RegExp(name) });
    await expect(row.getByRole("cell").nth(5)).toContainText("Stage 2");
    await expect(row.getByRole("cell").nth(7)).toContainText("Level 2");
    await row.getByRole("link", { name }).click();
    await expect(
      page.getByRole("heading", { name: "What the member has learned" }),
    ).toBeVisible();
    await expect(
      page.getByText("Builds a strong password and spots a phishing message"),
    ).toBeVisible();
    await audit(page, "junior member stages");

    await page.getByRole("button", { name: "Create report link" }).click();
    const reportUrl = await page.getByLabel("Report link").inputValue();
    await page.goto(new URL(reportUrl).pathname);
    await expect(
      page.getByRole("heading", { name: "What your child has learned" }),
    ).toBeVisible();
    await expect(page.getByText(/Works classic ciphers/)).toBeVisible();
    await expect(page.getByText("stage 2 of 3")).toBeVisible();
    await expect(page.getByText("level 2 of 3")).toBeVisible();
    await audit(page, "junior parent report");
  });
});
