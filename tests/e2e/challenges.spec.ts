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

/** A datetime-local value in Tashkent time, `minutes` from now. */
const tashkent = (minutes: number) =>
  new Date(Date.now() + minutes * 60_000 + 5 * 3_600_000)
    .toISOString()
    .slice(0, 16);

test("a competition runs end to end: admin setup, registration, files, hints, flags and the scoreboard", async ({
  browser,
}) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    "Needs the seeded admin account",
  );
  const slug = `kuz-${unique()}`.slice(0, 40);
  const adminContext = await browser.newContext({
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
  const admin = await adminContext.newPage();
  await admin.goto("/admin/login");
  await admin.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
  await admin.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
  await admin.getByRole("button", { name: "Sign in" }).click();
  await expect(admin).toHaveURL(/\/admin$/);

  // A running competition with one challenge, a file and a paid hint.
  await admin.goto("/admin/ctf/events");
  await admin.getByLabel("Title").fill("Kuzgi CTF");
  await admin.getByLabel(/Address/).fill(slug);
  await admin.getByLabel("Short description").fill("Sinov musobaqasi");
  await admin.getByLabel("Starts (Tashkent time)").fill(tashkent(-10));
  await admin.getByLabel("Ends (Tashkent time)").fill(tashkent(120));
  await admin.getByLabel("Team size (1–10)").fill("3");
  await admin.getByLabel(/Published/).check();
  await admin.getByRole("button", { name: "Create" }).click();
  await expect(admin.getByText("Competition created.")).toBeVisible();

  await admin.getByText("New challenge").click();
  await admin.getByLabel("Title").first().fill("Base64 xat");
  await admin.getByLabel("Category").selectOption("Crypto");
  await admin
    .getByLabel("Task (Markdown)")
    .fill("Xatni oching: `Q1Z7c2Fsb219`");
  await admin.getByLabel("Flag", { exact: true }).fill("CV{salom}");
  await admin.getByLabel("Starting value").fill("500");
  await admin.getByLabel("Minimum value").fill("100");
  await admin.getByLabel("Solves to reach the minimum").fill("2");
  await admin.getByRole("button", { name: "Create" }).click();
  await expect(admin.getByText("Challenge created.")).toBeVisible();
  await admin.getByLabel("New hint (Markdown)").fill("Base64 ni oching.");
  await admin.getByLabel("Cost in points").fill("50");
  await admin.getByRole("button", { name: "Add the hint" }).click();
  await expect(admin.getByText("Hint added.")).toBeVisible();
  await admin.getByLabel("Add files (up to 4 MiB each)").setInputFiles({
    name: "xat.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Q1Z7c2Fsb219"),
  });
  await expect(admin.getByRole("link", { name: "xat.txt" })).toBeVisible();

  // Two solo players: one opens the hint, both solve; the first wins.
  const first = await confirmedPlayer(browser);
  const second = await confirmedPlayer(browser);
  for (const p of [first, second]) {
    await p.page.goto(`/challenges/${slug}`);
    await p.page.getByRole("button", { name: "Play on my own" }).click();
    await expect(
      p.page.getByText("You are registered on your own."),
    ).toBeVisible();
  }

  const board = first.page;
  await board.goto(`/challenges/${slug}/board`);
  await board.getByText("Base64 xat").click();
  const download = board.waitForEvent("download");
  await board.getByRole("link", { name: "xat.txt" }).click();
  expect((await download).suggestedFilename()).toBe("xat.txt");
  await board.getByPlaceholder("CV{...}").fill("CV{nope}");
  await board.getByRole("button", { name: "Submit" }).click();
  await expect(board.getByText("Not this flag. Try again.")).toBeVisible();
  await board.getByPlaceholder("CV{...}").fill("  CV{salom} ");
  await board.getByRole("button", { name: "Submit" }).click();
  await expect(board.getByText(/Solved/).first()).toBeVisible();

  const late = second.page;
  late.on("dialog", (dialog) => dialog.accept());
  await late.goto(`/challenges/${slug}/board`);
  await late.getByText("Base64 xat").click();
  await late.getByRole("button", { name: "Open a hint (−50 points)" }).click();
  await expect(late.getByText("Base64 ni oching.")).toBeVisible();
  await late.getByPlaceholder("CV{...}").fill("CV{salom}");
  await late.getByRole("button", { name: "Submit" }).click();
  await expect(late.getByText(/Solved/).first()).toBeVisible();

  // Two solves, decay 2: the value fell from 500 to 400 for both. The
  // second player paid 50 for the hint.
  await late.goto(`/challenges/${slug}/scoreboard`);
  const rows = late.locator(".ctf-table tbody tr");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText(first.username);
  await expect(rows.nth(0).locator("td").nth(2)).toHaveText("400");
  await expect(rows.nth(1)).toContainText(second.username);
  await expect(rows.nth(1).locator("td").nth(2)).toHaveText("350");
  const axe = await new AxeBuilder({ page: late })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);

  // The admin blocks the leader, who drops off the scoreboard.
  await admin.goto("/admin/ctf/events");
  await admin.getByRole("link", { name: "Kuzgi CTF" }).first().click();
  const row = admin.getByRole("row", { name: new RegExp(first.username) });
  await row.getByRole("button", { name: "Block" }).click();
  await expect(admin.getByText("Entrant blocked.")).toBeVisible();
  await late.reload();
  await expect(rows).toHaveCount(1);
  await expect(rows.nth(0)).toContainText(second.username);

  // The admin ends the competition; the winner's certificate opens from the
  // final scoreboard.
  await admin.locator("#ctf-ends").fill(tashkent(-1));
  await admin.getByRole("button", { name: "Save" }).click();
  await expect(admin.getByText("Saved.")).toBeVisible();
  await late.reload();
  await rows.first().getByRole("link", { name: "certificate" }).click();
  await expect(late.getByRole("heading", { level: 1 })).toHaveText(
    "Winner’s certificate",
  );
  await expect(late.getByText("Place 1 of 1")).toBeVisible();
  // The blocked solve no longer counts, so the challenge is worth 500 again.
  await expect(
    late.getByText("450 points · 1 challenges solved"),
  ).toBeVisible();
  // Flags are no longer accepted after the end.
  await late.goto(`/challenges/${slug}/board`);
  await expect(late.getByPlaceholder("CV{...}")).toHaveCount(0);

  await adminContext.close();
  await first.close();
  await second.close();
});

test("a captain registers the team; the team is locked while the competition runs", async ({
  browser,
}) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    "Needs the seeded admin account",
  );
  const slug = `jamoa-${unique()}`.slice(0, 40);
  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await admin.goto("/admin/login");
  await admin.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
  await admin.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
  await admin.getByRole("button", { name: /Sign in|Tizimga kirish/ }).click();
  await expect(admin).toHaveURL(/\/admin$/);
  await admin.goto("/admin/ctf/events");
  await admin.locator("#ctf-title").fill("Jamoaviy CTF");
  await admin.locator("#ctf-slug").fill(slug);
  await admin.locator("#ctf-starts").fill(tashkent(-5));
  await admin.locator("#ctf-ends").fill(tashkent(60));
  await admin.locator("#ctf-size").fill("2");
  await admin.locator('input[name="allowSolo"]').uncheck();
  await admin.locator('input[name="published"]').check();
  await admin.locator('form button[type="submit"]').last().click();
  await expect(admin).toHaveURL(/\/admin\/ctf\/events\/[^/?]+\?ok=/);
  await adminContext.close();

  const captain = await confirmedPlayer(browser);
  const member = await confirmedPlayer(browser);
  const team = `Jamoa ${unique()}`.slice(0, 32);
  await captain.page.goto("/challenges/team");
  await captain.page.getByLabel("Team name").fill(team);
  await captain.page.getByRole("button", { name: "Create the team" }).click();
  const code = (await captain.page.locator(".ctf-code").textContent())!.trim();
  await member.page.goto("/challenges/team");
  await member.page.getByLabel("Invite code").fill(code);
  await member.page.getByRole("button", { name: "Join the team" }).click();
  await expect(member.page.getByText("2 of 10 players")).toBeVisible();

  // Teams only: a member cannot register, the captain can.
  await member.page.goto(`/challenges/${slug}`);
  await expect(
    member.page.getByText("Only the captain can register the team."),
  ).toBeVisible();
  await expect(
    member.page.getByRole("button", { name: "Play on my own" }),
  ).toHaveCount(0);
  await captain.page.goto(`/challenges/${slug}`);
  await captain.page.getByRole("button", { name: "Register my team" }).click();
  await expect(
    captain.page.getByText(`Your team ${team} is registered.`),
  ).toBeVisible();
  await member.page.reload();
  await expect(
    member.page.getByRole("link", { name: "Open the challenges" }),
  ).toBeVisible();

  // While it runs, nobody can leave or be removed.
  member.page.on("dialog", (dialog) => dialog.accept());
  await member.page.goto("/challenges/team");
  await member.page.getByRole("button", { name: "Leave the team" }).click();
  await expect(
    member.page.getByText(
      "cannot change while one of its competitions is running",
    ),
  ).toBeVisible();
  await captain.close();
  await member.close();
});

test("authoring tools: several flags, answer test, prerequisites, attempt limits, export, import and copy", async ({
  browser,
}) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    "Needs the seeded admin account",
  );
  const slug = `muallif-${unique()}`.slice(0, 40);
  const adminContext = await browser.newContext({
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
  const admin = await adminContext.newPage();
  admin.on("dialog", (dialog) => dialog.accept());
  await admin.goto("/admin/login");
  await admin.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
  await admin.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
  await admin.getByRole("button", { name: "Sign in" }).click();
  await expect(admin).toHaveURL(/\/admin$/);

  // A hand-written file: the second challenge opens after the first and
  // allows two wrong answers.
  const file = {
    version: 1,
    event: {
      slug,
      title: "Muallif CTF",
      startsAt: tashkent(-10),
      endsAt: tashkent(120),
      maxTeamSize: 2,
    },
    challenges: [
      {
        key: "a",
        title: "Birinchi",
        category: "Web",
        flags: [{ flag: "CV{bir}" }],
      },
      {
        key: "b",
        title: "Ikkinchi",
        category: "Web",
        requires: "a",
        maxAttempts: 2,
        flags: [{ flag: "CV{ikki}" }],
      },
    ],
  };
  await admin.goto("/admin/ctf/events");
  await admin.getByLabel("Import a competition (JSON)").setInputFiles({
    name: "ctf.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(file)),
  });
  await expect(
    admin.getByText("Imported as an unpublished draft."),
  ).toBeVisible();
  await expect(admin.getByRole("heading", { level: 1 })).toHaveText(
    "Muallif CTF",
  );
  await expect(admin.getByText("after Birinchi")).toBeVisible();

  // A second accepted flag, then the answer test.
  await admin.getByRole("link", { name: "Birinchi" }).click();
  await admin.getByLabel("Another accepted flag").fill("CV{one}");
  await admin.getByLabel("Accept the flag in any letter case").check();
  await admin.getByRole("button", { name: "Add the flag" }).click();
  await expect(admin.getByText("Flag added.")).toBeVisible();
  await admin.getByLabel("Test an answer").fill("cv{ONE}");
  await admin.getByRole("button", { name: "Check" }).click();
  await expect(admin.getByText("This answer is accepted.")).toBeVisible();
  // Each result changes the address, so every check waits for its own answer.
  await admin.getByLabel("Test an answer").fill("CV{BIR}");
  await admin.getByRole("button", { name: "Check" }).click();
  await expect(admin.getByText("No flag accepts this answer.")).toBeVisible();
  await admin.getByLabel("Test an answer").fill("CV{bir} ");
  await admin.getByRole("button", { name: "Check" }).click();
  await expect(admin.getByText("This answer is accepted.")).toBeVisible();

  // Publish it.
  await admin.getByRole("link", { name: "Muallif CTF" }).click();
  await admin.locator('input[name="published"]').check();
  await admin.getByRole("button", { name: "Save" }).click();
  await expect(admin.getByText("Saved.")).toBeVisible();

  // The export carries the prerequisite and digests, never a flag's text.
  const exportResponse = await admin.request.get(
    (await admin
      .getByRole("link", { name: "Export (JSON)" })
      .getAttribute("href"))!,
  );
  const exported = await exportResponse.json();
  expect(exported.challenges).toHaveLength(2);
  expect(exported.challenges[1].requires).toBe(exported.challenges[0].key);
  expect(JSON.stringify(exported)).not.toContain("CV{");

  // A player: the second challenge stays locked until the first is solved,
  // and two wrong answers use up its attempts.
  const player = await confirmedPlayer(browser);
  await player.page.goto(`/challenges/${slug}`);
  await player.page.getByRole("button", { name: "Play on my own" }).click();
  await player.page.goto(`/challenges/${slug}/board`);
  await player.page.locator("summary", { hasText: "Ikkinchi" }).click();
  await expect(
    player.page.getByText("Opens after you solve “Birinchi”."),
  ).toBeVisible();
  await player.page.locator("summary", { hasText: "Birinchi" }).click();
  await player.page.getByPlaceholder("CV{...}").first().fill("cv{one}");
  await player.page.getByRole("button", { name: "Submit" }).first().click();
  await expect(
    player.page.locator("summary", { hasText: "Birinchi" }),
  ).toContainText("Solved");
  await player.page.reload();
  await player.page.locator("summary", { hasText: "Ikkinchi" }).click();
  await expect(player.page.getByText("Attempts left: 2")).toBeVisible();
  for (const wrong of ["CV{x}", "CV{y}"]) {
    await player.page.getByPlaceholder("CV{...}").fill(wrong);
    await player.page.getByRole("button", { name: "Submit" }).click();
    await expect(
      player.page.getByText("Not this flag. Try again."),
    ).toBeVisible();
  }
  await player.page.reload();
  await player.page.locator("summary", { hasText: "Ikkinchi" }).click();
  await expect(player.page.getByText("Attempts left: 0")).toBeVisible();
  await expect(player.page.getByPlaceholder("CV{...}")).toHaveCount(0);

  // A copy is an unpublished draft with the same challenges.
  await admin.getByRole("button", { name: "Copy as a draft" }).click();
  await expect(admin.getByText("Copied as an unpublished draft")).toBeVisible();
  await expect(admin.getByRole("heading", { level: 1 })).toHaveText(
    "Muallif CTF (copy)",
  );
  await expect(admin.getByText("after Birinchi")).toBeVisible();

  await player.close();
  await adminContext.close();
});

test("competition-day tools: score adjustments, entrant page, live feed, CSV and the CTFtime feed", async ({
  browser,
}) => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
    "Needs the seeded admin account",
  );
  const slug = `kun-${unique()}`.slice(0, 40);
  const adminContext = await browser.newContext({
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
  const admin = await adminContext.newPage();
  await admin.goto("/admin/login");
  await admin.getByLabel("Email").fill(process.env.E2E_ADMIN_EMAIL!);
  await admin.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD!);
  await admin.getByRole("button", { name: "Sign in" }).click();
  await expect(admin).toHaveURL(/\/admin$/);
  await admin.goto("/admin/ctf/events");
  await admin.getByLabel("Import a competition (JSON)").setInputFiles({
    name: "ctf.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        event: {
          slug,
          title: "Kun CTF",
          startsAt: tashkent(-10),
          endsAt: tashkent(120),
        },
        challenges: [
          {
            key: "a",
            title: "Oddiy",
            category: "Misc",
            initialPoints: 200,
            minimumPoints: 200,
            flags: [{ flag: "CV{oddiy}" }],
          },
        ],
      }),
    ),
  });
  await expect(admin.getByRole("heading", { level: 1 })).toHaveText("Kun CTF");
  await admin.locator('input[name="published"]').check();
  await admin.getByRole("button", { name: "Save" }).click();
  await expect(admin.getByText("Saved.")).toBeVisible();

  const player = await confirmedPlayer(browser);
  await player.page.goto(`/challenges/${slug}`);
  await player.page.getByRole("button", { name: "Play on my own" }).click();
  await player.page.goto(`/challenges/${slug}/board`);
  await player.page.locator("summary", { hasText: "Oddiy" }).click();
  await player.page.getByPlaceholder("CV{...}").fill("CV{xato}");
  await player.page.getByRole("button", { name: "Submit" }).click();
  await expect(
    player.page.getByText("Not this flag. Try again."),
  ).toBeVisible();
  await player.page.getByPlaceholder("CV{...}").fill("CV{oddiy}");
  await player.page.getByRole("button", { name: "Submit" }).click();
  await expect(
    player.page.locator("summary", { hasText: "Oddiy" }),
  ).toContainText("Solved");

  // The organiser sees both attempts live and adds a bonus.
  await admin.reload();
  const feed = admin.getByRole("table").filter({ hasText: "Result" });
  await expect(feed.getByRole("row")).toHaveCount(3);
  await expect(feed).toContainText("Wrong");
  await expect(feed).toContainText("Correct");
  await admin.getByLabel("Points (negative for a penalty)").fill("25");
  await admin.getByLabel("Reason").fill("Eng chiroyli yechim");
  await admin.getByRole("button", { name: "Adjust the score" }).click();
  await expect(admin.getByText("Score adjusted.")).toBeVisible();

  // 200 for the challenge + 25 bonus, on the scoreboard, the entrant page,
  // the CTFtime feed and the organiser's CSV.
  await player.page.goto(`/challenges/${slug}/scoreboard`);
  const row = player.page.locator(".ctf-table tbody tr").first();
  await expect(row.locator("td").nth(2)).toHaveText("225");
  await row.getByRole("link", { name: player.username }).click();
  await expect(player.page.getByText("Eng chiroyli yechim")).toBeVisible();
  await expect(player.page.getByText("Place 1 of 1")).toBeVisible();
  const feedJson = await (
    await player.page.request.get(`/challenges/${slug}/ctftime`)
  ).json();
  expect(feedJson).toEqual({
    standings: [{ pos: 1, team: player.username, score: 225 }],
  });
  const csv = await (
    await admin.request.get(
      (await admin
        .getByRole("link", { name: "Results (CSV)" })
        .getAttribute("href"))!,
    )
  ).text();
  expect(csv).toContain(`"1","${player.username}","solo","225","1"`);

  await player.close();
  await adminContext.close();
});
