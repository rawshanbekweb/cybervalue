import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Assertions use the English interface copy.
test.use({
  storageState: {
    cookies: [
      {
        name: "cybervalue-locale",
        value: "en",
        domain: "localhost",
        path: "/",
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ],
    origins: [],
  },
});

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

test("Junior links to the Cipher Room and keeps the agent's codename", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/playground/junior");
  await expect(
    page.getByRole("region", { name: "Agent ID card" }),
  ).toContainText("New recruit");
  await page.getByRole("button", { name: "Pick a codename" }).click();
  await page.getByLabel("Codename").fill("Night Owl");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Night Owl")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Night Owl")).toBeVisible();

  await page.getByRole("link", { name: /The Cipher Room/ }).click();
  await expect(page).toHaveURL(/\/playground\/junior\/ciphers$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "The Cipher Room" }),
  ).toBeVisible();
  await expect(page.getByText("Night Owl")).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Cipher timeline" })
      .getByRole("button"),
  ).toHaveCount(10);
  await audit(page, "cipher room");
  expect(errors).toEqual([]);
});

test("solving homework earns XP that survives a reload", async ({ page }) => {
  await page.goto("/playground/junior/ciphers#cipher/4");
  await expect(
    page.getByRole("heading", { name: "The Caesar cipher" }),
  ).toBeVisible();
  // The wheel works the example out: XIVA shifted by 3.
  await page.getByLabel("Message", { exact: true }).fill("XIVA");
  await expect(page.locator(".cr-out").first()).toHaveText("ALYD");

  const first = page.locator(".cr-ex").first();
  await first.getByLabel("Your answer").fill("ALYX");
  await first.getByRole("button", { name: "Check" }).click();
  await expect(first.getByText(/Not yet/)).toBeVisible();
  await first.getByLabel("Your answer").fill("alyd");
  await first.getByRole("button", { name: "Check" }).click();
  await expect(first.getByText(/Correct!/)).toBeVisible();
  await expect(page.getByText("15 XP", { exact: false }).first()).toBeVisible();

  await page.reload();
  await expect(page.locator(".cr-ex").first()).toHaveClass(/solved/);
  await expect(
    page.getByRole("navigation", { name: "Cipher timeline" }),
  ).toContainText("1/6");

  // Extra exercises can be generated on demand.
  await page.getByRole("button", { name: "New exercise" }).click();
  await expect(page.locator(".cr-ex")).toHaveCount(7);
});

test("every cipher's workbench runs, and the paint lesson asks questions", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/playground/junior/ciphers#cipher/1");
  for (let n = 1; n <= 10; n++) {
    await page.goto(`/playground/junior/ciphers#cipher/${n}`);
    await page.reload();
    await expect(page.locator(".cr-bench")).toBeVisible();
  }
  // Frequency analysis cracks the sample by itself.
  await page.goto("/playground/junior/ciphers#cipher/5");
  await page.reload();
  await page.getByRole("button", { name: "Crack it" }).click();
  await expect(page.locator(".cr-out")).toContainText("quick brown fox");

  await page.goto("/playground/junior/ciphers#cipher/10");
  await page.reload();
  const card = page.locator(".cr-ex").nth(1);
  await card
    .getByLabel("You cannot pull the secret colour back out of a mixture")
    .check();
  await card.getByRole("button", { name: "Check" }).click();
  await expect(card.getByText(/Correct!/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("a printable homework sheet is built with optional answers", async ({
  page,
}) => {
  await page.goto("/playground/junior/ciphers");
  const sheet = page.getByRole("region", { name: "Homework sheet" });
  await sheet.getByLabel("Each:").selectOption("2");
  await sheet.getByRole("button", { name: "Make a sheet" }).click();
  // Atbash, Caesar and Morse are picked by default: 3 × 2 exercises.
  await expect(sheet.locator(".cr-print li")).toHaveCount(6);
  await expect(sheet.locator(".cr-print-answer")).toHaveCount(0);
  await sheet.getByLabel("Show answers").check();
  await expect(sheet.locator(".cr-print-answer")).toHaveCount(6);
  await expect(sheet.getByRole("button", { name: "Print" })).toBeVisible();
});
