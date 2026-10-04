import { test, expect, type Page } from "@playwright/test";

// Every learning module renders fully in both languages, without the old
// "only available in one language" notice.
const modules = [
  {
    path: "/playground/web-security-lab",
    uz: "Bitta so‘rovning sayohati",
    en: "The journey of a single request",
  },
  {
    path: "/playground/missions",
    uz: "Qo‘shnining hisob-fakturasi",
    en: "The invoice next door",
  },
  {
    path: "/playground/studio",
    uz: "Eshitiladigan xabar",
    en: "A report that gets heard",
  },
  {
    path: "/resources/exam",
    uz: "RESURSLAR / IMTIHON 1",
    en: "RESOURCES / EXAM 1",
  },
  {
    path: "/playground/html-basics/assessment",
    uz: "Shaxsiy kod bilan kirish",
    en: "Sign in with your personal code",
  },
];

async function useLocale(page: Page, locale: "uz" | "en") {
  await page.context().addCookies([
    {
      name: "cybervalue-locale",
      value: locale,
      domain: "localhost",
      path: "/",
    },
  ]);
}

for (const locale of ["uz", "en"] as const)
  test(`learning modules render in ${locale === "uz" ? "Uzbek" : "English"}`, async ({
    page,
  }) => {
    await useLocale(page, locale);
    for (const entry of modules) {
      await page.goto(entry.path);
      await expect(
        page.getByText(entry[locale], { exact: true }).first(),
      ).toBeVisible();
      await expect(
        page.getByText(entry[locale === "uz" ? "en" : "uz"], { exact: true }),
      ).toHaveCount(0);
      await expect(page.locator(".content-language-note")).toHaveCount(0);
    }
  });
