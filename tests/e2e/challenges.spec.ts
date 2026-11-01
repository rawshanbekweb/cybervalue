import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// CTF Challenges accounts: sign-up, the email link, sign-in, password reset
// and account settings. Mail is read from EMAIL_OUTBOX, where the server
// writes messages when no mail provider is configured.
const outbox = process.env.EMAIL_OUTBOX;
test.skip(
  !process.env.DATABASE_URL || !outbox,
  "Needs a database and EMAIL_OUTBOX",
);

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

const unique = () =>
  `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6)}`;
const PASSWORD = "tog-ustida-uch-qarga";

/** The path of the newest link mailed to `to` that leads to `page`. */
async function mailedLink(to: string, page: string) {
  let found = "";
  await expect
    .poll(
      () => {
        const lines = readFileSync(outbox!, "utf8").trim().split("\n");
        for (const line of lines.reverse()) {
          const mail = JSON.parse(line) as { to: string; text: string };
          const match = mail.text.match(/https?:\/\/\S+/);
          if (mail.to === to && match && match[0].includes(page)) {
            const url = new URL(match[0]);
            found = url.pathname + url.search;
            return found;
          }
        }
        return "";
      },
      { timeout: 15_000 },
    )
    .not.toBe("");
  return found;
}

async function signUp(page: Page, email: string, username: string) {
  await page.goto("/challenges/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Repeat the password").fill(PASSWORD);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create an account" }).click();
}

test("a player signs up, confirms the email and manages the account", async ({
  page,
}) => {
  const id = unique();
  const email = `player-${id}@example.com`;
  await signUp(page, email, `p_${id}`);
  await expect(page).toHaveURL(/\/challenges\?welcome=1$/);
  await expect(
    page.getByText(`We sent a confirmation link to ${email}`),
  ).toBeVisible();

  // The link opens a page; only the button spends it.
  await page.goto(await mailedLink(email, "/challenges/verify"));
  await page.getByRole("button", { name: "Confirm my email" }).click();
  await expect(page.getByText("Email confirmed")).toBeVisible();
  await page.goto("/challenges");
  await expect(page.getByText("Confirm your email")).toHaveCount(0);

  // A used link does not work twice.
  await page.goto(await mailedLink(email, "/challenges/verify"));
  await page.getByRole("button", { name: "Confirm my email" }).click();
  await expect(page.getByText("This link is not valid")).toBeVisible();

  await page.goto("/challenges/account");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`p_${id}`);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  await page.getByRole("textbox", { name: "Username" }).fill(`P_${id}_new`);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Username saved.")).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.goto("/challenges/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Wrong email or password.")).toBeVisible();
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/challenges$/);
  await expect(page.getByRole("link", { name: `P_${id}_new` })).toBeVisible();
});

test("a taken email gives the same answer; the password can be reset", async ({
  page,
  browser,
}) => {
  const id = unique();
  const email = `reset-${id}@example.com`;
  await signUp(page, email, `r_${id}`);
  await expect(page).toHaveURL(/welcome=1/);

  // Signing up again with the same address does not reveal that it is taken.
  const other = await browser.newContext({
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
  const stranger = await other.newPage();
  await signUp(stranger, email, `s_${id}`);
  await expect(
    stranger.getByRole("heading", { name: "Check your email" }),
  ).toBeVisible();

  await stranger.goto("/challenges/forgot");
  await stranger.getByLabel("Email").fill(email);
  await stranger.getByRole("button", { name: "Send a reset link" }).click();
  await expect(
    stranger.getByRole("heading", { name: "Check your email" }),
  ).toBeVisible();
  await stranger.goto(await mailedLink(email, "/challenges/reset"));
  await stranger.getByLabel("New password").fill("qwerty12345");
  await stranger.getByLabel("Repeat the password").fill("qwerty12345");
  await stranger.getByRole("button", { name: "Set the new password" }).click();
  await expect(stranger.getByText("too easy to guess")).toBeVisible();
  await stranger.getByLabel("New password").fill("yangi-parol-bahor-2026");
  await stranger
    .getByLabel("Repeat the password")
    .fill("yangi-parol-bahor-2026");
  await stranger.getByRole("button", { name: "Set the new password" }).click();
  await expect(stranger.getByText("Every device was signed out")).toBeVisible();
  await other.close();

  // The first browser was signed out by the reset.
  await page.goto("/challenges/account");
  await expect(page).toHaveURL(/\/challenges\/login\?next=/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("yangi-parol-bahor-2026");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/challenges\/account$/);
});

test("the CTF pages pass the accessibility checks", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/challenges",
    "/challenges/register",
    "/challenges/login",
    "/challenges/rules",
    "/challenges/forgot",
  ]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([]);
  }
});

test("the admin finds a player and blocks the account", async ({
  page,
  browser,
}) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    "Needs the seeded admin account",
  );
  const id = unique();
  const email = `blocked-${id}@example.com`;
  await signUp(page, email, `b_${id}`);
  await expect(page).toHaveURL(/welcome=1/);

  const admin = await (await browser.newContext()).newPage();
  await admin.goto("/admin/login");
  await admin.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
  await admin.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
  await admin.getByRole("button", { name: /Sign in|Tizimga kirish/ }).click();
  await expect(admin).toHaveURL(/\/admin$/);
  await admin.goto(`/admin/ctf/players?q=${encodeURIComponent(email)}`);
  const row = admin.getByRole("row", { name: new RegExp(`b_${id}`) });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: /Block|Bloklash/ }).click();
  await expect(
    row.getByRole("button", { name: /Unblock|Blokdan/ }),
  ).toBeVisible();

  // Blocking ended the player's session and stops a new sign-in.
  await page.goto("/challenges/account");
  await expect(page).toHaveURL(/\/challenges\/login/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("This account is blocked")).toBeVisible();
});

/** A new player with a confirmed email, signed in on its own page. */
async function confirmedPlayer(browser: import("@playwright/test").Browser) {
  const context = await browser.newContext({
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
  const page = await context.newPage();
  const id = unique();
  const email = `team-${id}@example.com`;
  const username = `t_${id}`;
  await signUp(page, email, username);
  await expect(page).toHaveURL(/welcome=1/);
  await page.goto(await mailedLink(email, "/challenges/verify"));
  await page.getByRole("button", { name: "Confirm my email" }).click();
  await expect(page.getByText("Email confirmed")).toBeVisible();
  return { page, username, close: () => context.close() };
}

test("players build a team with an invite code and hand over the captaincy", async ({
  browser,
}) => {
  const captain = await confirmedPlayer(browser);
  const member = await confirmedPlayer(browser);
  const team = `Team ${unique()}`.slice(0, 32);

  await captain.page.goto("/challenges/team");
  await captain.page.getByLabel("Team name").fill(team);
  await captain.page.getByRole("button", { name: "Create the team" }).click();
  await expect(
    captain.page.getByRole("heading", { level: 1, name: team }),
  ).toBeVisible();
  const code = (await captain.page.locator(".ctf-code").textContent())!.trim();
  const axe = await new AxeBuilder({ page: captain.page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  expect(code).toMatch(/^[0-9A-Z]{5}-[0-9A-Z]{5}$/);

  // A wrong code is refused; the right one, typed loosely, works.
  await member.page.goto("/challenges/team");
  await member.page.getByLabel("Invite code").fill("AAAAA-AAAAA");
  await member.page.getByRole("button", { name: "Join the team" }).click();
  await expect(
    member.page.getByText("This invite code is not valid."),
  ).toBeVisible();
  await member.page
    .getByLabel("Invite code")
    .fill(code.toLowerCase().replace("-", " "));
  await member.page.getByRole("button", { name: "Join the team" }).click();
  await expect(
    member.page.getByRole("heading", { level: 1, name: team }),
  ).toBeVisible();
  await expect(member.page.getByText("2 of 10 players")).toBeVisible();
  // A member sees the code but cannot manage the team.
  await expect(
    member.page.getByRole("button", { name: "New code" }),
  ).toHaveCount(0);
  await expect(member.page.getByRole("button", { name: "Remove" })).toHaveCount(
    0,
  );

  // The captain hands over the team and leaves; the member is now captain.
  captain.page.on("dialog", (dialog) => dialog.accept());
  await captain.page.reload();
  await captain.page.getByRole("button", { name: "Make captain" }).click();
  await expect(captain.page.getByText("You are the captain.")).toHaveCount(0);
  await captain.page.getByRole("button", { name: "Leave the team" }).click();
  await expect(
    captain.page.getByRole("heading", { name: "Create a team" }),
  ).toBeVisible();

  await member.page.reload();
  await expect(
    member.page.getByText("1 of 10 players · You are the captain."),
  ).toBeVisible();
  // A new code replaces the old one.
  member.page.on("dialog", (dialog) => dialog.accept());
  await member.page.getByRole("button", { name: "New code" }).click();
  await expect(member.page.locator(".ctf-code")).not.toHaveText(code);
  await captain.page.getByLabel("Invite code").fill(code);
  await captain.page.getByRole("button", { name: "Join the team" }).click();
  await expect(
    captain.page.getByText("This invite code is not valid."),
  ).toBeVisible();

  // The last member leaving deletes the team, so its name is free again.
  await member.page.getByRole("button", { name: "Leave the team" }).click();
  await expect(
    member.page.getByRole("heading", { name: "Create a team" }),
  ).toBeVisible();
  await captain.page.getByLabel("Team name").fill(team.toUpperCase());
  await captain.page.getByRole("button", { name: "Create the team" }).click();
  await expect(captain.page.getByRole("heading", { level: 1 })).toHaveText(
    team.toUpperCase(),
  );
  await captain.close();
  await member.close();
});
