import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
const dir = new URL("./assets/", import.meta.url);
const english = process.argv.includes("--en");
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 1000 },
  deviceScaleFactor: 1,
});
console.log(
  "Media support",
  await page.evaluate(() =>
    ["video/mp4;codecs=avc1.42001E", "video/mp4", "video/webm;codecs=vp9"].map(
      (t) => [t, MediaRecorder.isTypeSupported(t)],
    ),
  ),
);
for (const [name, path] of [
  ["html", "/playground/html-basics"],
  ["lab", "/playground/web-security-lab"],
]) {
  const response = await page.goto("http://127.0.0.1:3000" + path, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  if (!response.ok()) throw new Error(`${path}: ${response.status()}`);
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
  if (name === "html") {
    if (english)
      await page.locator(".htb-assessment-link").evaluate((link) => {
        link.textContent = "HTML assessment · one attempt →";
      });
    await page
      .getByRole("button", { name: "Sample solution", exact: true })
      .click();
    await page.getByRole("button", { name: "Check", exact: true }).click();
  }
  await page.screenshot({
    path: new URL(`${name}${english ? "-en" : ""}.png`, dir).pathname.replace(
      /^\/(\w:)/,
      "$1",
    ),
  });
  console.log(name, (await page.locator("body").innerText()).slice(0, 400));
}
await browser.close();
