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

async function type(page: Page, command: string) {
  await page.locator("#gb-line").fill(command);
  await page.locator("#gb-line").press("Enter");
}

test("the Git lab commits, branches, resolves a conflict and pushes in its terminal", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  // The three areas follow a file from the folder to a commit.
  await page.goto("/akademiya/git#lesson/3");
  await type(page, "git status");
  await expect(page.locator(".gb-screen")).toContainText("Untracked files:");
  await type(page, "git add index.html style.css");
  await expect(page.locator(".gb-file.is-staged")).toHaveCount(2);
  await type(page, 'git commit -m "Sayt sahifasi"');
  await expect(page.locator(".gb-screen")).toContainText("(root-commit)");
  await expect(page.locator(".gb-commit-chip")).toContainText("Sayt sahifasi");
  await expect(page.locator(".gb-node")).toHaveCount(1);
  await type(page, "git status");
  await expect(page.locator(".bb-goals li.met")).toHaveCount(4);
  await pass(page);
  await audit(page, "three areas");

  // A real screenshot with its caption sits under the theory.
  await page.goto("/akademiya/git#lesson/5");
  await expect(page.locator(".al-figure img")).toHaveAttribute(
    "src",
    "/lessons/git/terminal-secret.webp",
  );
  expect(
    await page
      .locator(".al-figure img")
      .evaluate((img: HTMLImageElement) => img.complete || img.loading),
  ).toBeTruthy();

  // A merge conflict: markers, then a fixed file and a merge commit.
  await page.goto("/akademiya/git#lesson/8");
  await type(page, "git merge chegirma");
  await expect(page.locator(".gb-screen")).toContainText(
    "CONFLICT (content): Merge conflict in narx.txt",
  );
  await type(page, "cat narx.txt");
  await expect(page.locator(".gb-screen .gb-marker").first()).toContainText(
    "<<<<<<< HEAD",
  );
  await type(page, 'echo "Narx: 90 000 so‘m" > narx.txt');
  await type(page, "git add narx.txt");
  await type(page, 'git commit -m "Narx kelishildi"');
  await expect(page.locator(".bb-goals li.met")).toHaveCount(3);
  await pass(page);

  // GitHub: a push is rejected until the teammate's work is pulled.
  await page.goto("/akademiya/git#lesson/10");
  await expect(page.locator(".gb-github")).toContainText(
    "https://github.com/cybervalue/jamoa-loyiha.git",
  );
  await type(page, "git pull");
  await expect(page.locator(".gb-screen")).toContainText("Fast-forward");
  await type(page, 'echo "- Dizayn (Ali)" >> TODO.txt');
  await type(page, 'git commit -am "Ali: vazifa"');
  await expect(page.locator(".gb-sync")).toContainText("1 to push");
  await type(page, "git push");
  await expect(page.locator(".gb-sync")).toContainText("In sync with GitHub");
  await pass(page);
  await audit(page, "GitHub panel");
});

test("the Git video lesson plays its recorded narration", async ({ page }) => {
  await page.goto("/akademiya/git/video");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Git va GitHub",
  );
  await expect(page.locator("audio")).toHaveAttribute(
    "src",
    "/video-lessons/git.mp3",
  );
  const mp3 = await page.request.get("/video-lessons/git.mp3");
  expect(mp3.status()).toBe(200);
  // The lab links to its video.
  await page.goto("/akademiya/git");
  await expect(
    page.getByRole("link", { name: "Watch the video lesson" }),
  ).toHaveAttribute("href", "/akademiya/git/video");
});
