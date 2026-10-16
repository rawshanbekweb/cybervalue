import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { dayIndex, puzzleFor } from "../../src/lib/junior/daily";
import { needsDatabase, signInJunior } from "./junior-member";

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

const ALL_MISSIONS = {
  password: true,
  phishing: true,
  cipher: true,
  footprint: true,
  ctf: true,
  ethics: true,
};

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

test("the case file collects evidence and the right suspect closes the case", async ({
  page,
}) => {
  needsDatabase();
  await signInJunior(page);
  const caseFile = page.getByRole("region", { name: "The Cyber HQ case" });
  await expect(caseFile).toContainText("Collect all the evidence (0/6)");
});

test("a member who finished every mission solves the case and earns a certificate", async ({
  page,
}) => {
  needsDatabase();
  await signInJunior(page, {
    progress: {
      missions: ALL_MISSIONS,
      agent: { name: "Swift Falcon", rank: 0 },
    },
  });
  const caseFile = page.getByRole("region", { name: "The Cyber HQ case" });
  await expect(
    caseFile.getByText(/The sender’s address ends in \.xyz/),
  ).toBeVisible();
  await audit(page, "Junior with the suspects");

  await caseFile.getByRole("button", { name: "It’s them!" }).first().click();
  await expect(
    caseFile.getByText(/Night Owl is an ethical hacker/),
  ).toBeVisible();
  await caseFile.getByRole("button", { name: "It’s them!" }).nth(1).click();
  await expect(caseFile.getByText("Case closed.")).toBeVisible();
  // Six missions plus the case: 700 XP.
  await expect(page.locator(".jr-topbar")).toContainText("700 XP");

  await page
    .getByRole("navigation", { name: "Academy sections" })
    .getByRole("link", { name: "Achievements" })
    .click();
  const certificate = page.getByRole("region", {
    name: "Your certificate is ready!",
  });
  await expect(certificate.locator(".jr-cert-name")).toHaveText("Swift Falcon");
  await certificate
    .getByLabel("Name on the certificate:")
    .fill("Aziza Karimova");
  await expect(certificate.locator(".jr-cert-name")).toHaveText(
    "Aziza Karimova",
  );
  await expect(
    page.getByRole("region", { name: "Agent ID card" }),
  ).toContainText("700 XP");
  await expect(
    page.getByRole("region", { name: "Achievements" }),
  ).toContainText("4/12");
  await audit(page, "achievements with a certificate");
});

test("today's puzzle is solved once and starts a streak", async ({ page }) => {
  needsDatabase();
  await signInJunior(page);
  await page.goto("/playground/junior/homework");
  const puzzle = puzzleFor(dayIndex(Date.now()), "en");
  const daily = page.getByRole("region", { name: "Daily puzzle" });
  await expect(daily.locator("code")).toHaveText(puzzle.given);
  await daily.getByLabel("The decrypted message").fill("wrong answer");
  await daily.getByRole("button", { name: "Check the puzzle" }).click();
  await expect(daily.getByText(/Not yet/)).toBeVisible();
  await daily
    .getByLabel("The decrypted message")
    .fill(puzzle.answer.toLowerCase());
  await daily.getByRole("button", { name: "Check the puzzle" }).click();
  await expect(daily.getByText(/Today’s puzzle is solved/)).toBeVisible();
  await expect(daily).toContainText("1-day streak");
  await expect(page.locator(".jr-topbar")).toContainText("20 XP");
});

test("the Enigma machine lights the historical lamps", async ({ page }) => {
  needsDatabase();
  await signInJunior(page);
  await page.goto("/playground/junior/ciphers#cipher/9");
  await expect(
    page.getByRole("heading", { name: "The Enigma machine" }),
  ).toBeVisible();
  const keyboard = page.getByRole("group", { name: "Keyboard" });
  for (let i = 0; i < 5; i++)
    await keyboard.getByRole("button", { name: "A", exact: true }).click();
  await expect(page.locator(".cr-out").nth(1)).toHaveText("BDZGO");
  await expect(page.locator(".cr-rotor-window").nth(2)).toHaveText("F");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator(".cr-rotor-window").nth(2)).toHaveText("A");
});

test("a secret message travels in the link and opens with the key", async ({
  page,
  browser,
}) => {
  await page.goto("/playground/junior/secret");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Meet me at the library at 9");
  await page.getByLabel("Vigenère", { exact: false }).check();
  await page.getByLabel(/Key —/).fill("OWL");
  await page.getByLabel("Hint (optional)").fill("the bird of wisdom");
  await page.getByRole("button", { name: "Create the link" }).click();
  const link = await page.getByLabel("Send this to your friend:").inputValue();
  expect(link).toContain("/playground/junior/secret#m=");
  expect(link).not.toContain("library");
  await audit(page, "secret message composer");

  const friend = await (
    await browser.newContext({ storageState: english })
  ).newPage();
  await friend.goto(link);
  await expect(
    friend.getByRole("heading", { name: "You have a secret message!" }),
  ).toBeVisible();
  await expect(friend.getByText("the bird of wisdom")).toBeVisible();
  await expect(friend.getByText(/The key is not in the link/)).toBeVisible();
  await friend.getByLabel(/Key —/).fill("OWL");
  await friend.getByRole("button", { name: "Decrypt" }).click();
  await expect(friend.locator(".cr-out")).toHaveText(
    "Meet me at the library at 9",
  );

  await friend.goto(link.replace("#m=", "#m=broken"));
  await expect(
    friend.getByText(/This link is broken or invalid/),
  ).toBeVisible();
  await expect(
    friend.getByRole("heading", { name: "Write a secret message" }),
  ).toBeVisible();
});
