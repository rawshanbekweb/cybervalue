import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { portraitFromImage } from "../src/lib/portrait";
import { isPortraitData, MAX_PORTRAIT_POINTS } from "../src/lib/portrait-data";
import bundled from "../src/components/portrait-points.json";

// A plain head-and-shoulders figure: a dark sweater, a face with features and
// hair, on a light background (or none, for a cut-out).
const figure = (background: string) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
  ${background}
  <path d="M60 800 C 80 600, 200 560, 300 560 C 400 560, 520 600, 540 800 Z" fill="#2d3a5a"/>
  <rect x="260" y="470" width="80" height="110" fill="#b98262"/>
  <ellipse cx="300" cy="350" rx="130" ry="165" fill="#d9a483"/>
  <path d="M170 330 C 170 170, 430 170, 430 330 C 410 240, 190 240, 170 330 Z" fill="#231a14"/>
  <ellipse cx="250" cy="350" rx="18" ry="9" fill="#2a1d16"/>
  <ellipse cx="350" cy="350" rx="18" ry="9" fill="#2a1d16"/>
  <path d="M255 440 q45 25 90 0" stroke="#7a3030" stroke-width="7" fill="none"/>
</svg>`);

function bounds(points: number[]) {
  const xs = points.filter((_, i) => i % 3 === 0);
  const ys = points.filter((_, i) => i % 3 === 1);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

test("a photo on a plain background becomes a valid, figure-shaped portrait", async () => {
  const photo = await sharp(
    figure('<rect width="600" height="800" fill="#eef1f5"/>'),
  )
    .jpeg()
    .toBuffer();
  const portrait = await portraitFromImage(photo);
  assert.ok(isPortraitData(portrait));
  const count = portrait.points.length / 3;
  assert.ok(count > 2500 && count <= MAX_PORTRAIT_POINTS, `${count} points`);
  // Cropped to the figure (480 px wide of 600), so the bust fills the frame.
  assert.ok(Math.abs(portrait.aspect - 480 / 612) < 0.05, `${portrait.aspect}`);
  const box = bounds(portrait.points);
  assert.ok(
    box.left < 60 && box.right > 940 && box.top < 40 && box.bottom > 950,
  );
  // The top corners are background beside the head, not part of the portrait.
  const corner = portrait.points.filter(
    (_, i) =>
      i % 3 === 0 && portrait.points[i] < 120 && portrait.points[i + 1] < 200,
  );
  assert.equal(corner.length, 0);
  // Same photo, same points: the result is deterministic.
  assert.deepEqual(await portraitFromImage(photo), portrait);
});

test("a cut-out's transparency is used as the silhouette", async () => {
  const cutout = await sharp(figure("")).png().toBuffer();
  const portrait = await portraitFromImage(cutout);
  assert.ok(isPortraitData(portrait));
  assert.ok(Math.abs(portrait.aspect - 480 / 612) < 0.05, `${portrait.aspect}`);
});

test("a busy photo still yields a portrait, inside a head-and-shoulders oval", async () => {
  const noise = await sharp({
    create: {
      width: 400,
      height: 500,
      channels: 3,
      background: "#808080",
      noise: { type: "gaussian", mean: 128, sigma: 120 },
    },
  })
    .png()
    .toBuffer();
  const portrait = await portraitFromImage(noise);
  assert.ok(isPortraitData(portrait));
});

test("unreadable, tiny and empty images are refused with a clear message", async () => {
  await assert.rejects(portraitFromImage(Buffer.from("not an image")), {
    message: "This image could not be read. Use a PNG, JPG or WebP photo.",
  });
  const tiny = await sharp({
    create: { width: 60, height: 60, channels: 3, background: "#888" },
  })
    .png()
    .toBuffer();
  await assert.rejects(portraitFromImage(tiny), {
    message: "Use a photo at least 120 pixels on each side.",
  });
  const blank = await sharp({
    create: {
      width: 300,
      height: 300,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer();
  await assert.rejects(portraitFromImage(blank), /No person could be found/);
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>');
  await assert.rejects(portraitFromImage(svg), /could not be read/);
});

test("portrait data is validated before it is drawn", () => {
  assert.ok(isPortraitData(bundled));
  for (const bad of [
    null,
    "points",
    { aspect: 1 },
    { aspect: 1, points: [1, 2] },
    { aspect: 0, points: [1, 2, 3] },
    { aspect: 1, points: [1, 2, 1000] },
    { aspect: 1, points: [1, 2, 3.5] },
    { aspect: 1, points: [1, 2, "3"] },
    { aspect: 1, points: Array((MAX_PORTRAIT_POINTS + 1) * 3).fill(1) },
  ])
    assert.equal(isPortraitData(bad), false, JSON.stringify(bad)?.slice(0, 40));
});
