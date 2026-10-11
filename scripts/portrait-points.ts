// Turns a cut-out portrait (PNG with a transparent background) into the
// particle targets the home hero gathers into.
//
//   npx tsx scripts/portrait-points.ts <photo.png> [--preview out.png]
//
// Writes src/components/portrait-points.json: { aspect, points } where points
// is a flat list of x, y (0–999, top-left origin) and tone (0–9) triples.
import fs from "node:fs";
import sharp from "sharp";

const COUNT = 3200; // particles; the hero draws every one each frame
const CROP = 0.62; // keep the top of the photo: head, shoulders and chest
const HEAD = 0.5; // the head's share of the cropped height
const HEAD_BOOST = 2.4; // the face carries the likeness, so it gets more points
const BODY_SHARE = 0.75; // and the bright shirt fewer
const W = 300; // working resolution

const [input, flag, previewPath] = process.argv.slice(2);
if (!input) {
  console.error(
    "Usage: tsx scripts/portrait-points.ts <photo.png> [--preview out.png]",
  );
  process.exit(1);
}

const meta = await sharp(input).metadata();
const cropHeight = Math.round(meta.height! * CROP);
const H = Math.round((cropHeight / meta.width!) * W);
const data = await sharp(input)
  .ensureAlpha()
  .extract({ left: 0, top: 0, width: meta.width!, height: cropHeight })
  .resize(W, H)
  .raw()
  .toBuffer();

const lum = new Float32Array(W * H);
const alpha = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const [r, g, b, a] = data.subarray(i * 4, i * 4 + 4);
  alpha[i] = a / 255;
  lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

const at = (map: Float32Array, x: number, y: number) =>
  map[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];

function sobel(map: Float32Array, x: number, y: number) {
  const gx =
    -at(map, x - 1, y - 1) -
    2 * at(map, x - 1, y) -
    at(map, x - 1, y + 1) +
    at(map, x + 1, y - 1) +
    2 * at(map, x + 1, y) +
    at(map, x + 1, y + 1);
  const gy =
    -at(map, x - 1, y - 1) -
    2 * at(map, x, y - 1) -
    at(map, x + 1, y - 1) +
    at(map, x - 1, y + 1) +
    2 * at(map, x, y + 1) +
    at(map, x + 1, y + 1);
  return Math.hypot(gx, gy);
}

function boxBlur(map: Float32Array, radius: number) {
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++)
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          sum += map[yy * W + xx];
          count++;
        }
      out[y * W + x] = sum / count;
    }
  return out;
}

// The silhouette edge keeps the outline crisp even where the hair is dark.
const outline = new Float32Array(W * H);
let maxOutline = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const value = sobel(alpha, x, y);
    outline[y * W + x] = value;
    maxOutline = Math.max(maxOutline, value);
  }

// Brightness plus local contrast (an unsharp mask), so eyes, brows and the
// mouth stay darker than the skin around them and read as features.
const soft = boxBlur(lum, 4);
const weight = new Float32Array(W * H);
const tone = new Float32Array(W * H);
let total = 0;
for (let i = 0; i < W * H; i++) {
  if (alpha[i] < 0.5) continue;
  const detail = Math.min(1, Math.max(0, lum[i] + (lum[i] - soft[i]) * 2.4));
  const edge = Math.min(1, (outline[i] / maxOutline) * 3);
  const share = Math.floor(i / W) / H < HEAD ? HEAD_BOOST : BODY_SHARE;
  tone[i] = detail;
  weight[i] = share * (0.03 + Math.pow(detail, 1.6) + edge * 1.5);
  total += weight[i];
}

// Floyd–Steinberg dithering spreads the points evenly, which reads far
// better than independent random picks.
let seed = 11;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const field = Float32Array.from(weight, (w) => (w * COUNT) / total);
const points: [number, number, number][] = [];
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const on = field[i] >= 0.5 ? 1 : 0;
    const error = field[i] - on;
    if (on && alpha[i] >= 0.5)
      points.push([
        Math.round(((x + 0.2 + random() * 0.6) / W) * 999),
        Math.round(((y + 0.2 + random() * 0.6) / H) * 999),
        Math.round(Math.min(1, 0.25 + tone[i] * 0.75) * 9),
      ]);
    if (x + 1 < W) field[i + 1] += (error * 7) / 16;
    if (y + 1 < H) {
      if (x > 0) field[i + W - 1] += (error * 3) / 16;
      field[i + W] += (error * 5) / 16;
      if (x + 1 < W) field[i + W + 1] += error / 16;
    }
  }

const output = "src/components/portrait-points.json";
fs.writeFileSync(
  output,
  JSON.stringify({ aspect: +(W / H).toFixed(4), points: points.flat() }) + "\n",
);
console.log(`${points.length} points → ${output}`);

if (flag === "--preview" && previewPath) {
  const width = 520;
  const height = Math.round((width * H) / W);
  const shapes = points.map(([x, y, t]) => {
    const cx = (x / 999) * width;
    const cy = (y / 999) * height;
    const angle = random() * Math.PI * 2;
    const corners = [0, 1, 2]
      .map((k) => {
        const a = angle + (k * Math.PI * 2) / 3;
        return `${(cx + Math.cos(a) * 1.8).toFixed(1)},${(cy + Math.sin(a) * 1.8).toFixed(1)}`;
      })
      .join(" ");
    return `<polygon points="${corners}" fill="none" stroke="#a68bff" stroke-opacity="${(0.3 + t / 12).toFixed(2)}"/>`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%"/>${shapes.join("")}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(previewPath);
  console.log(`preview → ${previewPath}`);
}
