import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("operator solves five connected challenges, uses tools, and retains progress", async ({
  page,
}) => {
  await page.goto("/playground/ctf#challenge/vault");
  await expect(
    page.getByRole("heading", { name: "Seyf hali jim." }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Ochiq tugunga qaytish/ }).click();
  await page.getByRole("button", { name: /Ishorani ochish/ }).click();
  await page.getByLabel("Flag", { exact: true }).fill("CV{not_the_flag}");
  await page.getByRole("button", { name: "Flagni yuborish" }).click();
  await expect(page.locator(".ctf-feedback")).toContainText("mos kelmadi");
  const sourceFlag = (await page.getByLabel("Dalil matni").innerText()).match(
    /CV\{[^}]+\}/,
  )![0];
  await page.getByLabel("Flag", { exact: true }).fill(sourceFlag);
  await page.getByRole("button", { name: "Flagni yuborish" }).click();
  await expect(
    page.getByRole("region", { name: "Topshiriq xulosasi" }),
  ).toContainText("KALIT: N");
  await expect(page.locator(".ctf-metrics")).toContainText("090");
  await page.getByText("Tergov daftari", { exact: false }).click();
  await page
    .getByLabel("Qanday iz topdingiz? Qanday xulosa chiqardingiz?")
    .fill("HTML izohi ommaga ochiq ekan.");
  await page.reload();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await expect(page.locator(".ctf-metrics")).toContainText("090");
  await page.getByRole("link", { name: "Keyingi tugun" }).click();

  await page.getByText("Operator asboblari", { exact: true }).click();
  await page.getByLabel("Kodlangan matn").fill("UEl7ZWJnbmdyX2d1cl9mdnRhbnl9");
  await page.getByRole("button", { name: "BASE64 ochish" }).click();
  await page.getByRole("button", { name: /Natijani kirishga/ }).click();
  await page.getByRole("button", { name: "ROT13 ochish" }).click();
  const signal = await page.locator(".ctf-decoded").innerText();
  await page.getByLabel("Flag", { exact: true }).fill(signal);
  await page.getByRole("button", { name: "Flagni yuborish" }).click();
  await expect(page.locator(".ctf-debrief")).toContainText("KALIT: O");
  await page.getByRole("link", { name: "Keyingi tugun" }).click();

  await page.getByRole("button", { name: "Ochish", exact: true }).click();
  await expect(page.locator(".ctf-path-response")).toContainText(
    "/maintenance/",
  );
  await page.getByLabel("Arxiv yo‘li").fill("/maintenance/");
  await page.getByRole("button", { name: "Ochish", exact: true }).click();
  await expect(page.locator(".ctf-path-response")).toContainText(
    "recovery.txt",
  );
  await page.getByLabel("Arxiv yo‘li").fill("/maintenance/recovery.txt");
  await page.getByRole("button", { name: "Ochish", exact: true }).click();
  const archiveFlag = (
    await page.locator(".ctf-path-response").innerText()
  ).match(/CV\{[^}]+\}/)![0];
  await page.getByLabel("Flag", { exact: true }).fill(archiveFlag);
  await page.getByRole("button", { name: "Flagni yuborish" }).click();
  await expect(page.locator(".ctf-debrief")).toContainText("KALIT: V");
  await page.getByRole("link", { name: "Keyingi tugun" }).click();
  await page.getByLabel("Flag", { exact: true }).fill("CV{trace_before_trust}");
  await page.getByRole("button", { name: "Flagni yuborish" }).click();
  await expect(page.locator(".ctf-debrief")).toContainText("KALIT: A");
  await page.getByRole("link", { name: "Keyingi tugun" }).click();
  await page.getByLabel("Flag", { exact: true }).fill("CV{NOVA_0017}");
  await page.getByRole("button", { name: "Flagni yuborish" }).click();
  await expect(
    page.getByRole("heading", { name: "Kimdir hali ham tinglayapti." }),
  ).toBeVisible();
  await expect(page.locator(".ctf-finale")).toContainText("890 / 900");
  await page.reload();
  await expect(page.locator(".ctf-finale")).toContainText("890 / 900");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Hisobot", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("nova-0017-report.md");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "Qayta boshlash", exact: true })
    .click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "5");
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Qayta boshlash", exact: true })
    .click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "0");
  await expect(page.getByLabel("Flag", { exact: true })).toHaveValue("");
  await expect(page.locator(".ctf-finale")).toHaveCount(0);
});

test("CTF handles malformed storage, unavailable verification, and invalid tool input", async ({
  page,
}) => {
  await page.goto("/playground/ctf");
  await page.evaluate(() =>
    localStorage.setItem(
      "cybervalue:ctf:signal-0017:v1",
      '{"source":{"proof":true,"hints":-7},"vault":{"proof":"bad"}}',
    ),
  );
  await page.reload();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "0");
  await page.route("**/api/ctf/verify", (route) => route.abort());
  await page
    .getByLabel("Flag", { exact: true })
    .fill("CV{comments_tell_stories}");
  await page.getByRole("button", { name: "Flagni yuborish" }).click();
  await expect(page.locator(".ctf-feedback")).toContainText("aloqa bo‘lmadi");
  await expect(page.getByLabel("Flag", { exact: true })).toHaveValue(
    "CV{comments_tell_stories}",
  );
  await page.getByText("Operator asboblari", { exact: true }).click();
  await page.getByLabel("Kodlangan matn").fill("!invalid!");
  await page.getByRole("button", { name: "BASE64 ochish" }).click();
  await expect(page.locator(".ctf-decoder")).toContainText(
    "Base64 matni noto‘g‘ri",
  );
});

test("verification API validates requests and does not reveal answers on failure", async ({
  request,
}) => {
  const wrong = await request.post("/api/ctf/verify", {
    data: { id: "source", flag: "CV{wrong}" },
  });
  expect(wrong.status()).toBe(200);
  expect(await wrong.json()).toMatchObject({ ok: false });
  expect(await wrong.text()).not.toContain("comments_tell_stories");
  expect(wrong.headers()["cache-control"]).toBe("no-store");
  expect(
    (
      await request.post("/api/ctf/verify", {
        data: { id: "vault", flag: "CV{NOVA_0017}" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/ctf/verify", {
        data: "broken json",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/ctf/verify", {
        data: "plain text",
        headers: { "Content-Type": "text/plain" },
      })
    ).status(),
  ).toBe(415);
  expect(
    (
      await request.post("/api/ctf/verify", {
        data: { id: "source", flag: "x".repeat(5000) },
      })
    ).status(),
  ).toBe(413);
});

test("CTF map and workbench fit phones and support accessible controls", async ({
  page,
}) => {
  await page.goto("/playground/ctf");
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page.locator("h1")).toHaveCount(1);
  await page.getByText("Operator asboblari", { exact: true }).click();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".ctf-radar-sweep")).toHaveCSS(
    "animation-name",
    "none",
  );
});
