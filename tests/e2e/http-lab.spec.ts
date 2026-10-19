import { test, expect } from "@playwright/test";
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

test("the HTTP lab sends raw requests to its training server", async ({
  page,
}) => {
  await page.goto("/akademiya/intermediate");
  await page
    .getByRole("link", { name: /HTTP in depth/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/akademiya\/http/);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "What an HTTP request looks like",
    }),
  ).toBeVisible();

  const raw = page.getByLabel("Raw HTTP request");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator(".nl-fail")).toContainText("Host");
  await raw.fill("GET / HTTP/1.1\nHost: shop.cybervalue.uz\n");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator(".hl-response")).toContainText("HTTP/1.1 200 OK");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".nl-pass")).toContainText("Lesson completed");

  // Signing in returns a session cookie; the profile then answers 200.
  await page.goto("/akademiya/http#lesson/4");
  await raw.fill(
    "POST /login HTTP/1.1\nHost: shop.cybervalue.uz\n\nuser=ali&pass=kuchli-parol-2026",
  );
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator(".hl-response")).toContainText(
    "Set-Cookie: session=",
  );
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".nl-pass")).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations.map((v) => v.id)).toEqual([]);

  // Same-origin sorting is checked answer by answer.
  await page.goto("/akademiya/http#lesson/7");
  const answers = [true, false, false, false, true];
  const groups = page.locator(".hl-choice fieldset");
  for (const [i, same] of answers.entries())
    await groups
      .nth(i)
      .getByLabel(same ? "Same origin" : "Different origin")
      .check();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator(".nl-pass").first()).toContainText(
    "Lesson completed",
  );
});
