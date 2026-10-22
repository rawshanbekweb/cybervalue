import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { Client } from "pg";

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

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

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

async function createKid(name: string, done: string[] = []) {
  const code = [...randomBytes(8)].map((b) => ALPHABET[b & 31]).join("");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO "KidsMember" (id, name, "codeHash", progress, "updatedAt")
       VALUES ($1, $2, $3, $4, now())`,
      [
        `e2e_${randomUUID()}`,
        name,
        createHash("sha256").update(code).digest("hex"),
        JSON.stringify({ done }),
      ],
    );
  } finally {
    await client.end();
  }
  return code;
}

test.describe("Academy Kids", () => {
  test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");

  test("a child signs in, hacks the game code and keeps the mission", async ({
    page,
  }) => {
    const name = `Lola ${Date.now().toString(36)}`;
    const code = await createKid(name);
    await page.goto("/kids");
    await expect(
      page.getByRole("heading", { level: 1, name: /game hacker/ }),
    ).toBeVisible();
    await audit(page, "kids front door");
    await page.getByLabel("Access code").fill("WRONG123");
    await page.getByRole("button", { name: "Let's play" }).click();
    await expect(page.locator(".kids-error")).toContainText("not valid");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Let's play" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: `Hi, ${name}!` }),
    ).toBeVisible();
    await audit(page, "kids hub");

    // Today's task, badges, and the later games still locked.
    await expect(
      page.getByRole("heading", { name: "Task of the day" }),
    ).toBeVisible();
    await expect(page.locator(".kids-badges li")).toHaveCount(14);
    await expect(page.locator(".kids-locked")).toHaveCount(5);

    await page.getByRole("link", { name: /Space escape/ }).click();
    await expect(page).toHaveURL(/\/kids\/kosmos$/);
    // The first visit opens a short tour, highlighting each panel.
    const tour = page.getByRole("dialog");
    await expect(tour).toContainText("This is the game");
    await expect(page.locator(".kids-stage.kids-spot")).toBeVisible();
    await tour.getByRole("button", { name: "Next" }).click();
    await expect(page.locator(".kids-code.kids-spot")).toBeVisible();
    await audit(page, "kids tour");
    await tour.getByRole("button", { name: "Skip" }).click();
    await expect(tour).toHaveCount(0);
    await expect(
      page.getByRole("heading", { level: 3, name: "Turbo engine" }),
    ).toBeVisible();
    const editor = page.getByRole("textbox", { name: "Game code" });
    // A typo gets a friendly, line-numbered message.
    await editor.fill("tezlk = 12");
    await expect(page.locator(".kids-problems")).toContainText("Line 1");
    await expect(page.locator(".kids-problems")).toContainText("tezlik");
    await editor.fill("tezlik = 12\nhayotlar = 3");
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.locator(".kids-cheer")).toContainText("Turbo engine");
    await expect(page.locator(".kids-level-chip")).toContainText("20 XP");

    // The secret terminal lists the commands.
    const terminal = page.getByRole("textbox", { name: "Terminal command" });
    await terminal.fill("yordam()");
    await terminal.press("Enter");
    await expect(page.getByRole("log")).toContainText("qalqon()");
    await audit(page, "kids game lab");

    // The mission and the code survive a reload: they are on the account.
    await page.reload();
    await expect(page.getByRole("textbox", { name: "Game code" })).toHaveValue(
      /tezlik = 12/,
    );
    await expect(page.locator(".kids-mission-list li.done")).toContainText(
      "Turbo engine",
    );
    // The tour is shown once.
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.goto("/kids");
    await expect(page.getByText("1 of 15 missions").first()).toBeVisible();
    await expect(
      page.locator(".kids-badges li.earned", { hasText: "First hack" }),
    ).toBeVisible();

    // A locked game says what opens it.
    await page.goto("/kids/ilon");
    await expect(page.locator(".kids-locked-page")).toContainText("Robot jump");
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("finding the leaked password opens developer mode and events", async ({
    page,
  }) => {
    const name = `Bobur ${Date.now().toString(36)}`;
    const stages12 = [
      "turbo",
      "hayot",
      "rang",
      "sekin",
      "korinmas",
      "terminal",
      "ochko",
      "agar",
      "signal",
      "aks",
      "va",
    ].map((id) => `kosmos:${id}`);
    const code = await createKid(name, stages12);
    await page.goto("/kids/kosmos");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Let's play" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Skip" })
      .click();
    await expect(
      page.getByRole("heading", { level: 3, name: "Secret password" }),
    ).toBeVisible();
    const editor = page.getByRole("textbox", { name: "Game code" });
    // Events are locked until developer mode is on.
    await editor.fill("qachon yulduz_olinsa:\n    ochko += 5");
    await expect(page.locator(".kids-problems")).toContainText(
      "developer mode",
    );

    const terminal = page.getByRole("textbox", { name: "Terminal command" });
    const log = page.getByRole("log");
    for (const line of ["fayllar()", 'o\'qi("eslatma.txt")', 'kirish("1234")'])
      await terminal.fill(line).then(() => terminal.press("Enter"));
    await expect(log).toContainText("eslatma.txt");
    await expect(log).toContainText("orbita7");
    await expect(log).toContainText("Access denied");
    await terminal.fill('kirish("orbita7")');
    await terminal.press("Enter");
    await expect(log).toContainText("Access granted");
    await expect(page.locator(".kids-dev-chip")).toBeVisible();
    await expect(page.locator(".kids-problems")).toHaveCount(0);

    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.locator(".kids-cheer")).toContainText("Star bonus");
    await page.getByText("Code guide").click();
    await expect(page.locator(".kids-events")).toContainText("yulduz_olinsa");
    await audit(page, "kids developer mode");

    // Enter after a line ending in ":" indents the next line.
    await editor.fill("");
    await editor.pressSequentially("qachon urilsa:");
    await editor.press("Enter");
    await editor.pressSequentially('xabar("Ehtiyot!")');
    await expect(editor).toHaveValue('qachon urilsa:\n    xabar("Ehtiyot!")');
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.locator(".kids-cheer")).toContainText("Warning");

    // Both are saved on the account.
    await page.reload();
    await expect(page.locator(".kids-dev-chip")).toBeVisible();
    await expect(
      page.locator(".kids-mission-list li.done", { hasText: "Star bonus" }),
    ).toBeVisible();
  });

  test("the cyber guard turns defences on with code and catches phishing", async ({
    page,
  }) => {
    const spaceStage1 = [
      "turbo",
      "hayot",
      "rang",
      "sekin",
      "korinmas",
      "terminal",
      "ochko",
    ].map((id) => `kosmos:${id}`);
    const code = await createKid(
      `Aziz ${Date.now().toString(36)}`,
      spaceStage1,
    );
    await page.goto("/kids/qorovul");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Let's play" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Skip" })
      .click();
    await expect(
      page.getByRole("heading", { level: 3, name: "Long password" }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "Game code" })
      .fill(
        "parol_uzunligi = 14\nikki_bosqichli = ha\nfirewall = ha\nyangilanishlar = ha\nantivirus_kuchi = 9",
      );
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.locator(".kids-mission-list li.done")).toHaveCount(5);

    // Start the round, then the radar from the terminal.
    await page.getByRole("button", { name: "Phishing!" }).click();
    const terminal = page.getByRole("textbox", { name: "Terminal command" });
    await terminal.fill("fishing_radar()");
    await terminal.press("Enter");
    await expect(page.getByRole("log")).toContainText("Done!");
    await expect(page.locator(".kids-cheer")).toContainText("Phishing radar");
    await audit(page, "kids cyber guard");
  });

  test("the maze runs the child's program and keeps solved levels", async ({
    page,
  }) => {
    const stage1 = [
      ...[
        "turbo",
        "hayot",
        "rang",
        "sekin",
        "korinmas",
        "terminal",
        "ochko",
      ].map((id) => `kosmos:${id}`),
      ...["baland", "oy", "ikki", "rang", "muz", "uchish", "ochko"].map(
        (id) => `robot:${id}`,
      ),
    ];
    const code = await createKid(`Malika ${Date.now().toString(36)}`, stage1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/kids/labirint");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Let's play" }).click();
    await expect(
      page.getByRole("heading", { level: 2, name: "Straight ahead" }),
    ).toBeVisible();
    const editor = page.getByRole("textbox", { name: "Robot program" });
    await editor.fill("oldinga(2)");
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.locator(".kids-maze-result")).toContainText(
      "ran out before the exit",
    );
    await editor.fill("oldinga(4)");
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(page.locator(".kids-maze-result")).toContainText("You did it");
    await expect(page.locator(".kids-mission-list li.done")).toHaveCount(1);
    await audit(page, "kids maze");

    // Stage 2 levels stay locked; the solved level is on the account.
    await expect(
      page.getByRole("button", { name: "Staircase", exact: true }),
    ).toBeDisabled();
    await page.reload();
    await expect(
      page.locator(".kids-mission-list li.done", { hasText: "Straight ahead" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "First turn" }),
    ).toBeVisible();
  });

  test("the cipher chest opens when the decoding program reads the clue", async ({
    page,
  }) => {
    const stage1 = [
      ...[
        "turbo",
        "hayot",
        "rang",
        "sekin",
        "korinmas",
        "terminal",
        "ochko",
      ].map((id) => `kosmos:${id}`),
      ...[
        "uzun_parol",
        "mfa",
        "firewall",
        "yangilash",
        "antivirus",
        "radar",
        "ochko",
      ].map((id) => `qorovul:${id}`),
    ];
    const code = await createKid(`Jasur ${Date.now().toString(36)}`, stage1);
    await page.goto("/kids/shifr");
    await page.getByLabel("Access code").fill(code);
    await page.getByRole("button", { name: "Let's play" }).click();
    await expect(page.locator(".kids-cipher-text")).toHaveText("YBAJOB");
    const editor = page.getByRole("textbox", { name: "Decoding program" });
    await editor.fill("sur(2)");
    await expect(page.locator(".kids-cipher-steps")).toContainText("WZYHMZ");
    await page.getByRole("button", { name: "Open the chest" }).click();
    await expect(page.locator(".kids-maze-result")).toContainText("Not yet");
    await editor.fill("sur(1)");
    await expect(page.locator(".kids-maze-result")).toContainText("It reads!");
    await page.getByRole("button", { name: "Open the chest" }).click();
    await expect(page.locator(".kids-mission-list li.done")).toHaveCount(1);
    await expect(page.locator(".kids-chests li.done")).toHaveCount(1);
    await audit(page, "kids cipher");
  });

  test("the admin creates children with codes", async ({ page }) => {
    test.skip(!email || !password, "Requires an admin account");
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.getByRole("link", { name: "Teacher panel" }).first().click();
    await expect(page).toHaveURL(/\/teacher$/);
    await page
      .getByRole("navigation", { name: "Admin sections" })
      .getByRole("link", { name: "Academy Kids" })
      .click();
    const name = `Sardor ${Date.now().toString(36)}`;
    await page.getByLabel(/One child per line/).fill(`${name} | 3-A`);
    await page
      .getByRole("button", { name: "Create children and codes" })
      .click();
    const code = await page.locator("code.student-code").first().innerText();
    expect(code).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    await audit(page, "admin kids codes");
    await page.getByRole("link", { name }).first().click();
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.getByText("Best score: 0").first()).toBeVisible();
    await expect(page.getByText("No stage finished yet")).toBeVisible();
    await audit(page, "admin kid page");

    // A parent report link opens the Kids report.
    await page.getByRole("button", { name: "Create report link" }).click();
    const reportUrl = await page.getByLabel("Report link").inputValue();
    const parent = await page.context().newPage();
    await parent.goto(new URL(reportUrl).pathname);
    await expect(
      parent.getByText("Academy Kids · progress report"),
    ).toBeVisible();
    await expect(parent.getByText("Snake")).toBeVisible();
    await parent.close();

    // Moving on to Academy Junior gives a Junior code.
    await page
      .getByRole("button", { name: "Create the Junior account" })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Junior account created",
    );
    await page.reload();
    await expect(page.getByText("Moved to Academy Junior:")).toBeVisible();

    // The admin search finds the child.
    await page.goto(`/teacher/search?q=${encodeURIComponent(name)}`);
    await expect(page.getByRole("link", { name }).first()).toBeVisible();
  });

  test("the teacher sees stages and skills, the parent what was learned", async ({
    page,
  }) => {
    test.skip(!email || !password, "Requires an admin account");
    const name = `Nodira ${Date.now().toString(36)}`;
    await createKid(
      name,
      ["turbo", "hayot", "rang", "sekin", "korinmas", "terminal", "ochko"].map(
        (id) => `kosmos:${id}`,
      ),
    );
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/teacher/kids");
    const row = page.getByRole("row", { name: new RegExp(name) });
    // Space escape is on stage 2; the robot game is open; the maze is not.
    await expect(row.getByRole("cell").nth(5)).toContainText("Stage 2");
    await expect(row.getByRole("cell").nth(6)).toContainText("Stage 1");
    await expect(row.getByRole("cell").nth(9)).toContainText("Locked");
    await audit(page, "admin kids stages");
    await row.getByRole("link", { name }).click();
    await expect(
      page.getByRole("heading", { name: "What the child has learned" }),
    ).toBeVisible();
    await expect(
      page.getByText("Changes game settings with code"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Create report link" }).click();
    const reportUrl = await page.getByLabel("Report link").inputValue();
    await page.goto(new URL(reportUrl).pathname);
    await expect(
      page.getByRole("heading", { name: "What your child has learned" }),
    ).toBeVisible();
    await expect(
      page.getByText("Changes game settings with code"),
    ).toBeVisible();
    await expect(page.getByText("stage 2 of 3")).toBeVisible();
    await expect(page.getByText("not opened yet").first()).toBeVisible();
    await audit(page, "kids parent report");
  });

  test("the admin deletes chosen users and sees the clean-up page", async ({
    page,
  }) => {
    test.skip(!email || !password, "Requires an admin account");
    const name = `Gone ${Date.now().toString(36)}`;
    await createKid(name);
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto(`/admin/users?kind=kids&q=${encodeURIComponent(name)}`);
    await page.getByRole("checkbox", { name: `Select ${name}` }).check();
    await page.locator("#bulk-action").selectOption("delete");
    const confirm = page.getByLabel("Type DELETE to confirm");
    await confirm.fill("DELETE");
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", { name: "Move to trash", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("1 users updated");
    await page.goto(`/admin/users?kind=kids&q=${encodeURIComponent(name)}`);
    await expect(page.getByText("No users match these filters.")).toBeVisible();
    await page.goto("/teacher/trash?kind=kids");
    await expect(
      page.getByRole("row", { name: new RegExp(name) }),
    ).toBeVisible();

    await page.goto("/admin/cleanup");
    await expect(
      page.getByRole("heading", { level: 1, name: "Clean-up" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Expired sign-ins" }),
    ).toBeVisible();
    await audit(page, "admin clean-up");
  });
});
