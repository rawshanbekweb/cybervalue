import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.setTimeout(90000);

test("English CTF translates hints and grading without resetting progress", async ({
  page,
}) => {
  await page.goto("/playground/ctf#challenge/source");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "SILENCE.",
  );
  await page.getByRole("button", { name: /Reveal hint/ }).click();
  await expect(page.locator(".ctf-hints")).toContainText(
    "Inspect the HTML comments",
  );
  const flag = (await page.getByLabel("Evidence text").innerText()).match(
    /CV\{[^}]+\}/,
  )![0];
  await page.getByLabel("Flag", { exact: true }).fill(flag);
  await page.getByRole("button", { name: "Submit flag", exact: true }).click();
  await expect(page.locator(".ctf-feedback")).toHaveText(
    "Flag accepted. Relay reconnected.",
  );
  await expect(
    page.getByRole("region", { name: "Challenge debrief" }),
  ).toContainText("HTML comments cannot keep secrets");
  await page.getByRole("button", { name: "O‘zbekcha", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Topshiriq xulosasi" }),
  ).toContainText("HTML izohi sir saqlash joyi emas");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await expect(page).toHaveURL(/#challenge\/source$/);
});

test("Uzbek is server-rendered by default and both languages persist across routes", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(await response.text()).toContain('<html lang="uz"');
  await page.goto("/resources?q=html#main");
  await expect(page.locator("html")).toHaveAttribute("lang", "uz");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Resurslar.",
  );
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveURL(/\/resources\?q=html#main$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Resources.",
  );
  await expect(
    page.getByRole("link", { name: "Open presentation", exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "en_US",
  );
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("html");
  await page.goto("/playground");
  await expect(
    page.getByRole("heading", { name: "HTML foundations", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "O‘zbekcha", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "uz");
  await page
    .getByRole("searchbox", { name: "Yo‘nalish va darslarni qidirish" })
    .fill("Sarlavhalar");
  await page
    .getByRole("link", { name: /02 · Sarlavhalar va xatboshilar/ })
    .click();
  await expect(page).toHaveURL(/#lesson\/2$/);
  await expect(
    page.getByRole("heading", {
      name: "Sarlavhalar va xatboshilar",
      exact: true,
    }),
  ).toBeVisible();
});

test("switching language preserves an HTML draft, selected lesson, and completed work", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/playground/html-basics#lesson/2");
  await page
    .getByRole("button", { name: "Namuna yechim", exact: true })
    .click();
  await page.getByRole("button", { name: "Tekshirish", exact: true }).click();
  await expect(page.locator(".htb-celebrate")).toBeVisible();
  const code = await page.getByRole("textbox").inputValue();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Headings and paragraphs", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveValue(code);
  await expect(page.locator(".htb-celebrate")).toBeVisible();
  await expect(page).toHaveURL(/#lesson\/2$/);
  await page.reload();
  await expect(page.getByRole("textbox")).toHaveValue(code);
  await expect(page.locator(".htb-progress-label")).toContainText("1 / 12");
  expect(errors).toEqual([]);
});

test("damaged browser records do not break either lesson editor", async ({
  page,
}) => {
  await page.goto("/playground");
  await page.evaluate(() => {
    localStorage.setItem("htmldars:progress:v1", "null");
    localStorage.setItem("htmldars:code:v1", '{"1": {"invalid": true}}');
    localStorage.setItem(
      "sabaq:progress:v1",
      '{"1":true,"2":false,"999":true}',
    );
    localStorage.setItem("sabaq:notes:v1", "null");
  });
  await page.goto("/playground/html-basics");
  await expect(page.getByRole("textbox")).toHaveValue(/<!DOCTYPE html>/);
  await expect(page.locator(".htb-progress-label")).toContainText("0 / 12");
  await page.goto("/playground/web-security-lab");
  await expect(page.locator(".lab-progress-caption")).toContainText("1 / 36");
});

test("both language variants fit small screens and pass accessibility checks", async ({
  page,
}) => {
  for (const language of ["uz", "en"]) {
    await page.goto("/");
    await page
      .getByRole("button", {
        name: language === "uz" ? "O‘zbekcha" : "English",
        exact: true,
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${language} ${width}`,
      ).toBe(true);
      await expect(
        page.getByRole("button", { name: "English", exact: true }),
      ).toBeVisible();
    }
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
});

test("unknown locale cookies safely fall back to Uzbek", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "cybervalue-locale",
      value: "invalid",
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("/search");
  await expect(page.locator("html")).toHaveAttribute("lang", "uz");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Arxivdan qidiring.",
  );
});
