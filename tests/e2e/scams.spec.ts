import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

test("the home page leads to the scam simulator", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Open the scam simulator/ }).click();
  await expect(page).toHaveURL(/\/firibgarlik$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Scam simulator/ }),
  ).toBeVisible();
});

test("a scam is answered, then every red flag is found", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/firibgarlik#lesson/1");
  const check = page.getByRole("button", { name: "Check", exact: true });

  // A wrong move is explained and does not pass.
  await page.getByRole("button", { name: /Read out the code/ }).click();
  await expect(page.locator(".sc-card .nl-fail")).toContainText(
    "That very code",
  );
  await check.first().click();
  await expect(page.locator(".nl-task .nl-fail")).toBeVisible();

  await page.getByRole("button", { name: /Hang up and call/ }).click();
  await expect(page.locator(".sc-count")).toContainText("0 of 4 red flags");
  // A harmless part is not a red flag.
  await page.getByRole("button", { name: "Hello," }).click();
  await expect(page.locator(".sc-explain")).toContainText("Nothing suspicious");
  for (const part of [
    /QulayBank security team/,
    /being sent from your card/,
    /must cancel it immediately/,
    /6-digit code/,
  ])
    await page.getByRole("button", { name: part }).click();
  await expect(page.locator(".sc-count")).toContainText("4 of 4 red flags");
  await check.first().click();
  await expect(page.locator(".nl-task .nl-pass")).toContainText(
    "Lesson completed",
  );
  await audit(page, "simulator");

  // A real bank text: the right answer is that it is safe.
  await page.goto("/firibgarlik#lesson/2");
  await page.getByRole("button", { name: /I bought bread/ }).click();
  await expect(page.locator(".sc-safe")).toBeVisible();
  await check.first().click();
  await expect(page.locator(".nl-task .nl-pass")).toBeVisible();
});

test("the checker flags a pasted scam and passes an ordinary message", async ({
  page,
}) => {
  await page.goto("/firibgarlik");
  const box = page.getByLabel("Message text");
  const run = page
    .locator(".sc-checker")
    .getByRole("button", { name: "Check" });
  await box.fill(
    "QulayBank xavfsizlik xizmati: kartangiz bloklanadi! SMS kodni ayting.",
  );
  await run.click();
  await expect(page.locator(".sc-verdict")).toContainText("Very likely a scam");
  await expect(page.locator(".sc-verdict")).toContainText(
    "It asks for a code from an SMS",
  );
  await box.fill("Salom! Ertaga darsga kelasanmi?");
  await run.click();
  await expect(page.locator(".sc-verdict")).toContainText(
    "No common scam signs found.",
  );
  await audit(page, "checker");
});

test("the simulator is in Uzbek by default", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto("/firibgarlik");
  await expect(
    page.getByRole("heading", { level: 1, name: /Firibgarlik simulyatori/ }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/Firibgarlik simulyatori/);
  await context.close();
});
