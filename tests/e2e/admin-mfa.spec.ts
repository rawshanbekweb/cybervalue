import { test, expect, type Page } from "@playwright/test";
import { timeStep, totpAt } from "../../src/lib/totp";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
}

async function enterCode(page: Page, code: string) {
  await page.getByLabel("Authentication code").fill(code);
  await page.getByRole("button", { name: "Verify" }).click();
}

test.describe("admin two-factor authentication", () => {
  // Turns 2FA on and off and revokes sessions, so it needs its own account.
  test.skip(
    !process.env.DATABASE_URL ||
      !email ||
      !password ||
      !process.env.AUTH_SECRET ||
      process.env.E2E_ISOLATED_ACCOUNT !== "true",
    "Requires an isolated seeded admin account, DATABASE_URL and AUTH_SECRET",
  );
  test.describe.configure({ mode: "serial" });

  test("enrol, reject a replayed code, sign in with TOTP and a recovery code, then disable", async ({
    page,
  }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto("/admin/account");
    await page.getByRole("button", { name: "Set up 2FA" }).click();
    const key = (await page.locator(".admin-secret").innerText()).replace(
      /\s/g,
      "",
    );
    await expect(
      page.getByAltText("QR code for your authenticator app"),
    ).toBeVisible();
    const enrolStep = timeStep();
    await page.getByLabel("Code from the app").fill(totpAt(key, enrolStep));
    await page.getByRole("button", { name: "Turn on 2FA" }).click();
    await expect(page.locator(".admin-codes code")).toHaveCount(8);
    const codes = await page.locator(".admin-codes code").allInnerTexts();
    expect(codes).toHaveLength(8);
    await expect(page.getByText("8 of 8 recovery codes remain.")).toBeVisible();

    // The password alone no longer opens a session.
    await signOut(page);
    await signIn(page);
    await expect(page.getByLabel("Authentication code")).toBeVisible();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
    // A reload keeps the pending challenge instead of asking for the password.
    await expect(page.getByLabel("Authentication code")).toBeVisible();

    // The code used for enrolment cannot be replayed.
    await enterCode(page, totpAt(key, enrolStep));
    await expect(page.getByText("That code is not valid.")).toBeVisible();
    await enterCode(page, totpAt(key, enrolStep + 1));
    await expect(page).toHaveURL(/\/admin$/);

    // Recovery codes work once.
    await signOut(page);
    await signIn(page);
    await enterCode(page, codes[0].toUpperCase());
    await expect(page).toHaveURL(/\/admin$/);
    await signOut(page);
    await signIn(page);
    await enterCode(page, codes[0]);
    await expect(page.getByText("That code is not valid.")).toBeVisible();
    await enterCode(page, codes[1]);
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto("/admin/audit");
    const log = page.locator("table");
    for (const action of [
      "mfa.enable",
      "login.mfa_failure",
      "login.recovery_code",
      "logout",
    ])
      await expect(
        log.getByText(action, { exact: true }).first(),
      ).toBeVisible();

    await page.goto("/admin/account");
    await expect(page.getByText("6 of 8 recovery codes remain.")).toBeVisible();
    await page.getByLabel("Current password").first().fill(password!);
    await page.locator("#mfa-disable-code").fill(codes[2]);
    await page.getByRole("button", { name: "Turn off 2FA" }).click();
    await expect(
      page.getByRole("button", { name: "Set up 2FA" }),
    ).toBeVisible();

    await signOut(page);
    await signIn(page);
    await expect(page).toHaveURL(/\/admin$/);
  });
});
