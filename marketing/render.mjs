import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const suffix = process.argv.includes("--en") ? "-en" : "";
const browser = await chromium.launch({
  args: ["--allow-file-access-from-files"],
});
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
});
page.on("pageerror", (e) => console.error(e));
await page.goto(
  new URL(`./cybervalue-ad${suffix}.html?render`, import.meta.url).href,
);
await page.evaluate(() => window.ready);
await page.addStyleTag({ content: "#replay { display: none; }" });
if (process.env.AD_DOMAIN)
  await page.evaluate(
    (domain) => (window.AD_DOMAIN = domain),
    process.env.AD_DOMAIN,
  );
for (const [name, t] of [
  ["cover", 18.8],
  ["frame-intro", 2],
  ["frame-html", 6.5],
  ["frame-lab", 11.5],
  ["frame-features", 15.5],
]) {
  await page.evaluate((t) => window.render(t), t);
  const image = await page.evaluate(
    () => document.querySelector("canvas").toDataURL("image/png").split(",")[1],
  );
  await writeFile(
    new URL(`./${name}${suffix}.png`, import.meta.url),
    Buffer.from(image, "base64"),
  );
}
console.log("Rendering 20-second silent MP4...");
const base64 = await page.evaluate(() => window.record());
await writeFile(
  new URL(`./cybervalue-ad${suffix}.mp4`, import.meta.url),
  Buffer.from(base64, "base64"),
);
console.log(`Saved marketing/cybervalue-ad${suffix}.mp4`);
await page.goto(new URL(`./cybervalue-ad${suffix}.mp4`, import.meta.url).href);
const metadata = await page.locator("video").evaluate(
  (v) =>
    new Promise((resolve) => {
      const done = () =>
        resolve({
          duration: v.duration,
          width: v.videoWidth,
          height: v.videoHeight,
          audioTracks: v.audioTracks?.length,
          decodedAudioBytes: v.webkitAudioDecodedByteCount,
        });
      if (v.readyState >= 1) done();
      else v.addEventListener("loadedmetadata", done, { once: true });
    }),
);
console.log(JSON.stringify(metadata));
await browser.close();
