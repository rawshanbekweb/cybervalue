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

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
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

async function createKid(name: string) {
  const code = [...randomBytes(8)].map((b) => ALPHABET[b & 31]).join("");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO "KidsMember" (id, name, "codeHash", "updatedAt")
       VALUES ($1, $2, $3, now())`,
      [`e2e_${randomUUID()}`, name, createHash("sha256").update(code).digest("hex")],
    );
  } finally {
    await client.end();
  }
  return code;
}

test.describe("Academy Kids", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");

  test("a child signs in, hacks the game code and keeps the mission", async ({
    page,
  }) => {
    const name = `Lola ${Date.now().toString(36)}`;
    const code = await createKid(name);
    await page.goto("/kids");
    await expect(
      page.getByRole("heading", { level: 1, name: /game hacker/ }),
    ).toBeVisible();
    await audit(page, "kids front door");
    await page.getByLabel("Access code").fill("WRONG123");
    await page.getByRole("button", { name: "Let's play" }).click();
    await expect(page.getByRole("alert")).toContainText("not valid");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Let's play" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: `Hi, ${name}!` }),
    ).toBeVisible();
    await audit(page, "kids hub");

    await page.getByRole("link", { name: /Space escape/ }).click();
    await expect(page).toHaveURL(/\/kids\/kosmos$/);
    await expect(
      page.getByRole("heading", { level: 3, name: "Turbo engine" }),
    ).toBeVisible();
    const editor = page.getByRole("textbox", { name: "Game code" });
    // A typo gets a friendly, line-numbered message.
    await editor.fill("tezlk = 12");
    await expect(page.locator(".kids-problems")).toContainText("Line 1");
    await expect(page.locator(".kids-problems")).toContainText("tezlik");
    await editor.fill("tezlik = 12\nhayotlar = 3");
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.locator(".kids-cheer")).toContainText("Turbo engine");
    await expect(page.locator(".kids-level-chip")).toContainText("20 XP");

    // The secret terminal lists the commands.
    const terminal = page.getByRole("textbox", { name: "Terminal command" });
    await terminal.fill("yordam()");
    await terminal.press("Enter");
    await expect(page.getByRole("log")).toContainText("qalqon()");
    await audit(page, "kids game lab");

    // The mission and the code survive a reload: they are on the account.
    await page.reload();
    await expect(
      page.getByRole("textbox", { name: "Game code" }),
    ).toHaveValue(/tezlik = 12/);
    await expect(
      page.locator(".kids-mission-list li.done"),
    ).toContainText("Turbo engine");
    await page.goto("/kids");
    await expect(page.getByText("1 of 8 missions")).toBeVisible();
  });

  test("the admin creates children with codes", async ({ page }) => {
    test.skip(!email || !password, "Requires an admin account");
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page
      .getByRole("navigation", { name: "Admin sections" })
      .getByRole("link", { name: "Academy Kids" })
      .click();
    const name = `Sardor ${Date.now().toString(36)}`;
    await page.getByLabel(/One child per line/).fill(`${name} | 3-A`);
    await page.getByRole("button", { name: "Create children and codes" }).click();
    const code = await page.locator("code.student-code").first().innerText();
    expect(code).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    await audit(page, "admin kids codes");
    await page.getByRole("link", { name }).click();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.getByText("Best score: 0").first()).toBeVisible();
    await audit(page, "admin kid page");
  });
});
