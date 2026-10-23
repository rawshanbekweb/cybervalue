import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { enterCode, needsDatabase, signInJunior } from "./junior-member";

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

test("the home page leads to Junior's sign-in page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Enter Junior/ }).click();
  await expect(page).toHaveURL(/\/junior$/);
  await expect(
    page.getByRole("heading", { name: "Welcome to the academy.", level: 1 }),
  ).toBeVisible();
  // Every academy page is behind the code; only the secret page is public.
  for (const path of ["ciphers", "homework", "achievements"]) {
    await page.goto(`/junior/${path}`);
    await expect(page.getByLabel("Access code")).toBeVisible();
  }
  await page.getByLabel("Access code").fill("ZZZZ-ZZZZ");
  await page.getByRole("button", { name: "Enter" }).click();
  await expect(
    page.getByText("This access code is not valid or no longer active."),
  ).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("a student finishes every mission and unlocks the next steps", async ({
  page,
}) => {
  needsDatabase();
  const member = await signInJunior(page);
  await expect(page.getByText("0 / 8 missions complete")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  // The first-visit tour walks through four steps once, then stays away.
  const tour = page.locator(".jr-tour");
  await expect(tour).toContainText("Missions in four steps");
  for (let step = 0; step < 3; step++)
    await tour.getByRole("button", { name: "Next" }).click();
  await expect(tour).toContainText("Your agent card");
  await tour.getByRole("button", { name: "Start" }).click();
  await expect(tour).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  await page.reload();
  await expect(page.getByText("0 / 8 missions complete")).toBeVisible();
  await expect(tour).toHaveCount(0);

  // 1 · Password
  await page.getByLabel("Test password").fill("parol123");
  await expect(page.getByText("Time to crack: instantly")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Finish the mission" }),
  ).toBeDisabled();
  await page.getByLabel("Test password").fill("olma bulut kok tosh daryo");
  await page.getByRole("button", { name: "Finish the mission" }).click();
  await expect(page.getByText("Mission complete!")).toBeVisible();

  // 2 · Phishing (fail first, then answer correctly)
  await page.getByRole("button", { name: /Spot the phish/ }).click();
  await expect(page).toHaveURL(/#mission\/2$/);
  const phishing = ["Phishing", "Safe", "Phishing", "Safe", "Phishing"];
  const cards = page.locator(".jr-card");
  for (const [index, answer] of phishing.entries())
    await cards.nth(index).getByLabel(answer, { exact: true }).check();
  await page.getByRole("button", { name: "Check my answers" }).click();
  await expect(page.getByText("Score: 5 / 5")).toBeVisible();
  await page.getByRole("button", { name: "Finish the mission" }).click();

  // 3 · Cipher
  await page.getByRole("button", { name: /The secret cipher/ }).click();
  await page.getByLabel("Shift back by:").fill("7");
  await expect(page.locator(".jr-live").first()).toHaveText(
    "MY SECRET WORD IS FIREWALL",
  );
  await page.getByLabel("The hidden word in the message:").fill("nothing");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText("Not yet.")).toBeVisible();
  await page.getByLabel("The hidden word in the message:").fill("Firewall");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText(/The shift was 7/)).toBeVisible();
  await page.getByRole("button", { name: "Finish the mission" }).click();

  // 4 · Digital footprint
  await page.getByRole("button", { name: /Digital footprint/ }).click();
  for (const name of [
    /school badge/,
    /Location tag/,
    /March 14/,
    /Wi‑Fi password/,
    /Barsik/,
  ])
    await page.getByRole("checkbox", { name }).check();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await expect(page.getByText("All correct!")).toBeVisible();
  await page.getByRole("button", { name: "Finish the mission" }).click();

  // 5 · CTF
  await page.getByRole("button", { name: /Your first CTF/ }).click();
  await page.getByPlaceholder("CV{...}").first().fill("CV{wrong}");
  await page.getByRole("button", { name: "Submit" }).first().click();
  await expect(page.getByText("That’s not the flag.")).toBeVisible();
  await page.getByPlaceholder("CV{...}").first().fill("CV{birinchi_qadam}");
  await page.getByRole("button", { name: "Submit" }).first().click();
  await page.getByLabel("Base64 decoder").fill("Q1Z7YmFzZTY0X3Npcl9lbWFzfQ==");
  await expect(page.getByText("CV{base64_sir_emas}").first()).toBeVisible();
  await page.getByPlaceholder("CV{...}").first().fill("CV{base64_sir_emas}");
  await page.getByRole("button", { name: "Submit" }).first().click();
  await page.getByPlaceholder("CV{...}").first().fill("CV{teskari_dunyo}");
  await page.getByRole("button", { name: "Submit" }).first().click();
  await expect(page.getByText("Flags found: 3 / 3")).toBeVisible();
  await page.getByRole("button", { name: "Finish the mission" }).click();

  // 6 · Ethics
  await page
    .getByRole("button", { name: /The ethical hacker’s rules/ })
    .click();
  const ethics = ["Not okay", "Okay", "Not okay", "Okay", "Okay"];
  const ethicsCards = page.locator(".jr-card");
  for (const [index, answer] of ethics.entries())
    await ethicsCards.nth(index).getByLabel(answer, { exact: true }).check();
  await page.getByRole("button", { name: "Check my answers" }).click();
  await page.getByRole("button", { name: "Finish the mission" }).click();
  await expect(page.getByText("6 / 8 missions complete")).toBeVisible();

  // 7 · App permissions
  await page.getByRole("button", { name: /Permission hunter/ }).click();
  const permissions = [
    "Allow",
    "Deny",
    "Deny",
    "Deny",
    "Allow",
    "Deny",
    "Deny",
  ];
  const permissionCards = page.locator(".jr-card");
  await permissionCards.nth(1).getByLabel("Allow", { exact: true }).check();
  // Every permission must be answered before checking.
  await expect(
    page.getByRole("button", { name: "Check my answers" }),
  ).toBeDisabled();
  for (const [index, answer] of permissions.entries())
    await permissionCards
      .nth(index)
      .getByLabel(answer, { exact: true })
      .check();
  await page.getByRole("button", { name: "Check my answers" }).click();
  await page.getByRole("button", { name: "Finish the mission" }).click();

  // 8 · Wi-Fi
  await page.getByRole("button", { name: /The Wi-Fi trap/ }).click();
  const wifi = [
    "Safe to do",
    "Risky",
    "Risky",
    "Safe to do",
    "Safe to do",
    "Risky",
  ];
  const wifiCards = page.locator(".jr-card");
  for (const [index, answer] of wifi.entries())
    await wifiCards.nth(index).getByLabel(answer, { exact: true }).check();
  await page.getByRole("button", { name: "Check my answers" }).click();
  await page.getByRole("button", { name: "Finish the mission" }).click();

  await expect(page.getByText("8 / 8 missions complete")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Congratulations, cyber recruit!" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Story CTF/ })).toHaveAttribute(
    "href",
    "/akademiya/ctf",
  );

  // Progress lives on the server: it survives a reload, signing out and
  // signing in again from another browser.
  await expect(page.locator(".jr-topbar")).toContainText("800 XP");
  await page.reload();
  await expect(page.getByText("8 / 8 missions complete")).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByLabel("Access code")).toBeVisible();
  await page.context().clearCookies({ name: "cv_junior" });
  await enterCode(page, member.code);
  await expect(page.getByText("8 / 8 missions complete")).toBeVisible();
});

test("Uzbek is the default language", async ({ browser }) => {
  needsDatabase();
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  });
  const page = await context.newPage();
  await page.goto("/junior");
  await expect(
    page.getByRole("heading", { name: "Akademiyaga xush kelibsiz.", level: 1 }),
  ).toBeVisible();
  await signInJunior(page);
  await expect(page.getByText("0 / 8 missiya bajarildi")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Parol ustasi" }),
  ).toBeVisible();
  await context.close();
});

test("the home page shows the two directions with one way into each", async ({
  page,
}) => {
  await page.goto("/");
  const junior = page.getByRole("region", {
    name: "Cybervalue Academy Junior",
  });
  const academy = page.getByRole("region", { name: "Cybervalue Academy" });
  await expect(
    junior.getByRole("link", { name: /Enter Junior/ }),
  ).toHaveAttribute("href", "/junior");
  await expect(
    academy.getByRole("link", { name: /Open the labs/ }),
  ).toHaveAttribute("href", "/akademiya");
  await expect(
    academy.getByRole("link", { name: "Student portal" }),
  ).toHaveAttribute("href", "/student");
  // The practice gateways moved to the Academy page.
  await page.goto("/akademiya");
  await expect(
    page.getByRole("heading", {
      name: "Write the code. Then let a bot attack it.",
    }),
  ).toHaveCount(1);
});

test("the main navigation marks only the most specific section as current", async ({
  page,
}) => {
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await page.goto("/junior");
  await expect(nav.locator('[aria-current="page"]')).toHaveText(
    "Academy Junior",
  );
  await page.goto("/akademiya/ctf");
  await expect(nav.locator('[aria-current="page"]')).toHaveText("Academy");
  await page.goto("/");
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(0);
});
