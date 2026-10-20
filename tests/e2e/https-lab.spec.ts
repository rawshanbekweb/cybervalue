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

async function pass(page: Page) {
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.locator(".nl-task .nl-pass")).toContainText(
    "Lesson completed",
  );
}

test("the HTTPS lab shows the eavesdropper, the cipher and the chain", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/akademiya/https");
  await expect(
    page.getByRole("heading", { level: 2, name: "Café Wi-Fi" }),
  ).toBeVisible();

  // Over HTTP the password shows; over HTTPS only gibberish.
  await page.getByRole("button", { name: "Send the password" }).click();
  await expect(page.locator(".hs-spy-view")).toContainText("pass=Qwerty-2026");
  await page.getByLabel("https://bank.uz").check();
  await page.getByRole("button", { name: "Send the password" }).click();
  await expect(page.locator(".hs-spy-view")).toContainText("17 03 03");
  await expect(page.locator(".hs-spy-view")).not.toContainText("Qwerty");
  await pass(page);
  await audit(page, "wifi");

  // The right key opens the intercepted message.
  await page.goto("/akademiya/https#lesson/2");
  await page.getByRole("slider").fill("7");
  await expect(page.locator(".hs-open")).toContainText("parol kuchli bolsin");
  await pass(page);
  await audit(page, "cipher");

  // The handshake plays to the end.
  await page.goto("/akademiya/https#lesson/4");
  await page.getByRole("button", { name: "Play" }).click();
  await expect(page.locator(".al-log li")).toHaveCount(7);
  await pass(page);

  // The chain is checked from the site up to the root.
  await page.goto("/akademiya/https#lesson/7");
  for (let i = 0; i < 3; i++)
    await page.locator(".hs-link.next button").click();
  await expect(page.locator(".hs-secure")).toBeVisible();
  await pass(page);
  await audit(page, "chain");
});
