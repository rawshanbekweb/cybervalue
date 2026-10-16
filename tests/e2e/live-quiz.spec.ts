import { randomUUID } from "node:crypto";
import { test, expect, type Browser, type Page } from "@playwright/test";
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

async function player(browser: Browser, code: string, name: string) {
  const page = await (
    await browser.newContext({ storageState: english })
  ).newPage();
  await page.goto(`/live?code=${code}`);
  await expect(page.getByLabel("Game code")).toHaveValue(code);
  await page.getByLabel("Your name").fill(name);
  await page.getByRole("button", { name: "Join", exact: true }).click();
  await expect(page.getByText("You are in.")).toBeVisible();
  return page;
}

test("the join form explains a wrong code", async ({ page }) => {
  await page.goto("/live");
  await expect(
    page.getByRole("heading", { level: 1, name: /Live quiz/ }),
  ).toBeVisible();
  await page.getByLabel("Game code").fill("000 000");
  await page.getByLabel("Your name").fill("Nobody");
  await page.getByRole("button", { name: "Join", exact: true }).click();
  await expect(page.locator(".live-error")).toHaveText(
    "No game is open with this code. Check the screen.",
  );
  await audit(page, "live join");
});

test.describe("a live game", () => {
  test.skip(
    !process.env.DATABASE_URL || !email || !password,
    "Requires DATABASE_URL and a seeded admin account",
  );

  test("players join with the code, answer and see the ranking", async ({
    page,
    browser,
  }) => {
    const id = Date.now().toString(36);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query(
      `INSERT INTO "StudentMaterial" (id, slug, kind, title, quiz, "updatedAt")
       VALUES ($1, $2, 'QUIZ', $3, $4, now())`,
      [
        `e2e_${randomUUID()}`,
        `e2e-live-${id}`,
        `Live test ${id}`,
        JSON.stringify([
          {
            prompt: "Default HTTPS port?",
            options: ["80", "443"],
            answer: 1,
            explain: "443 carries TLS.",
          },
          { prompt: "SSH port?", options: ["22", "25", "53"], answer: 0 },
        ]),
      ],
    );
    await client.end();

    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page
      .getByRole("navigation", { name: "Admin sections" })
      .getByRole("link", { name: "Live quiz" })
      .click();
    await page
      .getByLabel("Test", { exact: true })
      .selectOption({ label: `Live test ${id} · 2 questions` });
    await page.getByLabel("Seconds per question").selectOption("30");
    await page.getByRole("button", { name: "Open the game" }).click();
    await expect(page).toHaveURL(/\/admin\/live\/[^/]+$/);
    const code = (
      (await page.locator(".live-code").textContent()) ?? ""
    ).replace(/\D/g, "");
    expect(code).toMatch(/^\d{6}$/);
    await audit(page, "host lobby");

    const ali = await player(browser, code, "Ali");
    const vali = await player(browser, code, "Vali");
    // A second "Ali" is turned away.
    const copy = await (
      await browser.newContext({ storageState: english })
    ).newPage();
    await copy.goto(`/live?code=${code}`);
    await copy.getByLabel("Your name").fill("Ali");
    await copy.getByRole("button", { name: "Join", exact: true }).click();
    await expect(copy.locator(".live-error")).toContainText("already uses");
    await copy.context().close();

    await expect(page.getByText("2 players joined")).toBeVisible();
    await page.getByRole("button", { name: "Start the game" }).click();
    await expect(
      page.getByRole("heading", { name: "Default HTTPS port?" }),
    ).toBeVisible();
    // The answer is not on the screen before the reveal.
    await expect(page.locator(".live-option.is-right")).toHaveCount(0);

    await ali.getByRole("button", { name: /443/ }).click();
    await expect(ali.getByText("Answer B sent.")).toBeVisible();
    await audit(ali, "player question");
    await vali.getByRole("button", { name: /80/ }).click();

    // Everyone answered, so the screen reveals by itself.
    await expect(page.locator(".live-option.is-right")).toContainText("443");
    await expect(page.getByText("443 carries TLS.")).toBeVisible();
    await expect(ali.locator(".live-verdict")).toContainText("Correct! +");
    await expect(vali.locator(".live-verdict")).toHaveText("Not this time.");
    await expect(vali.getByText("Right answer: B. 443")).toBeVisible();

    await page.getByRole("button", { name: "Next question" }).click();
    await expect(
      page.getByRole("heading", { name: "SSH port?" }),
    ).toBeVisible();
    await vali.getByRole("button", { name: /22/ }).click();
    // Ali does not answer; the teacher reveals by hand.
    await page.getByRole("button", { name: "Show the answer" }).click();
    await expect(ali.locator(".live-verdict")).toHaveText(
      "No answer this time.",
    );
    await page.getByRole("button", { name: "Show the results" }).click();
    await expect(
      page.getByRole("heading", { name: "Final results" }),
    ).toBeVisible();
    await expect(page.locator(".live-podium li")).toHaveCount(2);
    await expect(ali.getByRole("heading", { name: "Game over" })).toBeVisible();
    await expect(ali.getByText(/You placed \d of 2/)).toBeVisible();
    await audit(page, "host results");
    await ali.context().close();
    await vali.context().close();
  });
});
