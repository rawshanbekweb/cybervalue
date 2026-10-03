import { test, expect } from "@playwright/test";

const lesson = "/lessons/web-asoslari/index.html";

test("Resources opens the lesson and offers the offline package", async ({
  page,
  request,
}) => {
  await page.goto("/resources");
  const card = page.getByRole("region", { name: "Web qanday ishlaydi?" });
  await expect(card).toBeVisible();
  const download = page.waitForEvent("download");
  await card.getByRole("link", { name: "ZIP yuklab olish" }).click();
  expect((await download).suggestedFilename()).toBe("web-asoslari.zip");
  const zip = await request.get("/lessons/web-asoslari.zip");
  expect(zip.ok()).toBe(true);
  expect((await zip.body()).subarray(0, 4).toString("hex")).toBe("504b0304");
  await card.getByRole("link", { name: "Taqdimotni ochish" }).click();
  await expect(page).toHaveURL(new RegExp(`${lesson}$`));
  await expect(page.locator("#counter")).toHaveText("01 / 75");
  await page.getByRole("link", { name: "Resurslar" }).click();
  await expect(page).toHaveURL(/\/resources$/);
});

test("all slides render under the site CSP on desktop and mobile without remote requests", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  const remoteRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => {
    if (
      !request
        .url()
        .startsWith(`http://localhost:${process.env.PORT ?? "3000"}/`)
    )
      remoteRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(lesson);
    expect(response?.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
    await expect(page.locator("#prevButton")).toBeDisabled();
    for (let slide = 1; slide <= 75; slide++) {
      await expect(page.locator("#counter")).toHaveText(
        `${String(slide).padStart(2, "0")} / 75`,
      );
      await expect(page.locator("#slide h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Slide ${slide} at ${width}px`,
      ).toBe(true);
      if (slide < 75) await page.keyboard.press("ArrowRight");
    }
    await expect(page.locator("#nextButton")).toBeDisabled();
    await page.keyboard.press("Home");
    await expect(page.locator("#counter")).toHaveText("01 / 75");
  }
  expect(errors).toEqual([]);
  expect(remoteRequests).toEqual([]);
});

test("topic links, contents search, teacher notes and saved checklist work", async ({
  page,
}) => {
  await page.goto(`${lesson}#topic-06.2`);
  await expect(page.locator("#slide")).toContainText("/24");
  await page.keyboard.press("n");
  await expect(page.locator("#notesPanel")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#notesPanel")).toBeHidden();
  await page.keyboard.press("m");
  await page.locator("#contentsSearch").fill("cookie");
  expect(await page.locator(".contents-item").count()).toBeGreaterThan(0);
  await page.locator(".contents-item").first().click();
  await expect(page.locator("#contentsDialog")).toBeHidden();
  await expect(page).toHaveURL(/#topic-/);
  await page.goto(`${lesson}#topic-29`);
  const firstCheck = page.locator("[data-check]").first();
  await firstCheck.check();
  await page.reload();
  await expect(page.locator("[data-check]").first()).toBeChecked();
});
