import sharp, { type OutputInfo } from "sharp";
import { MAX_PORTRAIT_POINTS, type PortraitData } from "./portrait-data";

// Turns a photo into the particle targets an animated portrait gathers into.
// A cut-out (PNG/WebP with a transparent background) is used as it is; for an
// ordinary photo the background is grown inwards from the top and side edges
// while its colour stays close, and whatever it cannot reach is the person.
// When that fails (busy or similar-coloured backgrounds) a head-and-shoulders
// oval stands in for the silhouette. Only the points are kept, never the photo.

export class PortraitError extends Error {}

const SIZE = 360; // working width; the canvas never needs more detail
const COUNT = 3200; // particles; the canvas draws every one each frame
const MAX_TALL = 1.35; // keep at most this × the figure's width: head, shoulders, chest
const HEAD = 0.5; // the head's share of the cropped height
const HEAD_BOOST = 2.4; // the face carries the likeness, so it gets more points
const BODY_SHARE = 0.75; // and the clothes fewer
const STEP = 14; // largest colour change between neighbouring background pixels
const REACH = 70; // and between a background pixel and the edge it grew from

type Plane = { data: Float32Array; width: number; height: number };

const at = ({ data, width, height }: Plane, x: number, y: number) =>
  data[
    Math.min(height - 1, Math.max(0, y)) * width +
      Math.min(width - 1, Math.max(0, x))
  ];

function sobel(map: Plane, x: number, y: number) {
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

function boxBlur(map: Plane, radius: number, channels = 1): Float32Array {
  const { data, width, height } = map;
  const out = new Float32Array(data.length);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      for (let c = 0; c < channels; c++) {
        let sum = 0;
        let count = 0;
        for (let dy = -radius; dy <= radius; dy++)
          for (let dx = -radius; dx <= radius; dx++) {
            const xx = x + dx;
            const yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
            sum += data[(yy * width + xx) * channels + c];
            count++;
          }
        out[(y * width + x) * channels + c] = sum / count;
      }
  return out;
}

// Background grows from the top row and the upper sides; the bottom edge and
// the lower sides usually cut through the shoulders, so they never seed it.
function segment(rgb: Float32Array, width: number, height: number) {
  const size = width * height;
  const distance = (a: number, b: number) =>
    Math.hypot(
      rgb[a * 3] - rgb[b * 3],
      rgb[a * 3 + 1] - rgb[b * 3 + 1],
      rgb[a * 3 + 2] - rgb[b * 3 + 2],
    );
  const candidates: number[] = [];
  for (let x = 0; x < width; x++) candidates.push(x);
  for (let y = 1; y < height * 0.6; y++)
    candidates.push(y * width, y * width + width - 1);
  // Seeds must look like the edge as a whole, so hair touching the top or an
  // arm touching a side does not start a fill inside the person.
  const median = [0, 1, 2].map((c) => {
    const values = candidates.map((i) => rgb[i * 3 + c]).sort((a, b) => a - b);
    return values[values.length >> 1];
  });
  const background = new Uint8Array(size);
  const origin = new Int32Array(size);
  const queue = new Int32Array(size);
  let head = 0;
  let tail = 0;
  for (const i of candidates)
    if (
      !background[i] &&
      Math.hypot(
        rgb[i * 3] - median[0],
        rgb[i * 3 + 1] - median[1],
        rgb[i * 3 + 2] - median[2],
      ) <
        REACH * 1.5
    ) {
      background[i] = 1;
      origin[i] = i;
      queue[tail++] = i;
    }
  while (head < tail) {
    const i = queue[head++];
    const x = i % width;
    for (const n of [
      x > 0 ? i - 1 : -1,
      x + 1 < width ? i + 1 : -1,
      i - width,
      i + width,
    ]) {
      if (n < 0 || n >= size || background[n]) continue;
      if (distance(n, i) < STEP && distance(n, origin[i]) < REACH) {
        background[n] = 1;
        origin[n] = origin[i];
        queue[tail++] = n;
      }
    }
  }
  // Group what is left into pieces. A neck close to the background colour can
  // cut the head off the body, so every sizeable piece above or over the
  // largest one's middle is kept; specks and things beside it (a picture on
  // the wall) are dropped.
  const label = new Int32Array(size).fill(-1);
  const pieces: { start: number; size: number; left: number; right: number }[] =
    [];
  for (let start = 0; start < size; start++) {
    if (background[start] || label[start] >= 0) continue;
    head = tail = 0;
    queue[tail++] = start;
    label[start] = pieces.length;
    let left = width;
    let right = 0;
    while (head < tail) {
      const i = queue[head++];
      const x = i % width;
      left = Math.min(left, x);
      right = Math.max(right, x);
      for (const n of [
        x > 0 ? i - 1 : -1,
        x + 1 < width ? i + 1 : -1,
        i - width,
        i + width,
      ]) {
        if (n < 0 || n >= size || background[n] || label[n] >= 0) continue;
        label[n] = pieces.length;
        queue[tail++] = n;
      }
    }
    pieces.push({ start, size: tail, left, right });
  }
  if (!pieces.length) return null;
  const main = pieces.reduce((a, b) => (b.size > a.size ? b : a));
  const span = main.right - main.left;
  const keep = pieces.map(
    (piece) =>
      piece === main ||
      (piece.size >= size * 0.01 &&
        Math.abs(
          (piece.left + piece.right) / 2 - (main.left + main.right) / 2,
        ) <
          span * 0.3),
  );
  const mask = new Float32Array(size);
  let kept = 0;
  for (let i = 0; i < size; i++)
    if (label[i] >= 0 && keep[label[i]]) {
      mask[i] = 1;
      kept++;
    }
  // Too little or too much left means the fill leaked into the person or
  // stopped at a busy background, and an empty centre means it ran over a
  // face close to the background colour; the oval is a better guess then.
  let centre = 0;
  let centreSize = 0;
  for (let y = Math.round(height * 0.3); y < height * 0.5; y++)
    for (let x = Math.round(width * 0.4); x < width * 0.6; x++) {
      centre += mask[y * width + x];
      centreSize++;
    }
  if (kept < size * 0.08 || kept > size * 0.92 || centre < centreSize * 0.5)
    return null;
  return mask;
}

function oval(width: number, height: number) {
  const mask = new Float32Array(width * height);
  const cx = width / 2;
  const cy = height * 0.62;
  const rx = width * 0.4;
  const ry = height * 0.62;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1)
        mask[y * width + x] = 1;
  return mask;
}

export async function portraitFromImage(bytes: Buffer): Promise<PortraitData> {
  let image: { data: Buffer; info: OutputInfo };
  try {
    const source = sharp(bytes, {
      limitInputPixels: 32_000_000,
      failOn: "warning",
    });
    const meta = await source.metadata();
    if (
      !["png", "jpeg", "webp", "avif", "heif"].includes(meta.format ?? "") ||
      (meta.pages ?? 1) > 1
    )
      throw new Error("Unsupported image");
    if ((meta.width ?? 0) < 120 || (meta.height ?? 0) < 120)
      throw new PortraitError("Use a photo at least 120 pixels on each side.");
    image = await source
      .rotate()
      .resize({ width: SIZE, height: SIZE * 2, fit: "inside" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
  } catch (error) {
    if (error instanceof PortraitError) throw error;
    throw new PortraitError(
      "This image could not be read. Use a PNG, JPG or WebP photo.",
    );
  }
  const { width, height } = image.info;
  const size = width * height;
  const rgb = new Float32Array(size * 3);
  const lum = new Float32Array(size);
  let mask = new Float32Array(size);
  let transparent = 0;
  for (let i = 0; i < size; i++) {
    const [r, g, b, a] = image.data.subarray(i * 4, i * 4 + 4);
    rgb.set([r, g, b], i * 3);
    lum[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    mask[i] = a >= 128 ? 1 : 0;
    if (a < 128) transparent++;
  }
  if (transparent < size * 0.02)
    mask =
      segment(boxBlur({ data: rgb, width, height }, 1, 3), width, height) ??
      oval(width, height);

  // Crop to the figure, keeping its top: head, shoulders and chest.
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (mask[y * width + x]) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
  if (right - left < 40 || bottom - top < 40)
    throw new PortraitError(
      "No person could be found in this photo. Try a clearer portrait.",
    );
  bottom = Math.min(bottom, top + Math.round((right - left + 1) * MAX_TALL));
  const W = right - left + 1;
  const H = bottom - top + 1;
  const crop = (source: Float32Array) => {
    const out = new Float32Array(W * H);
    for (let y = 0; y < H; y++)
      out.set(
        source.subarray(
          (top + y) * width + left,
          (top + y) * width + right + 1,
        ),
        y * W,
      );
    return { data: out, width: W, height: H };
  };
  const alpha = crop(mask);
  const light = crop(lum);

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
  const soft = boxBlur(light, 4);
  const weight = new Float32Array(W * H);
  const tone = new Float32Array(W * H);
  let total = 0;
  for (let i = 0; i < W * H; i++) {
    if (alpha.data[i] < 0.5) continue;
    const l = light.data[i];
    const detail = Math.min(1, Math.max(0, l + (l - soft[i]) * 2.4));
    const edge = maxOutline ? Math.min(1, (outline[i] / maxOutline) * 3) : 0;
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
  const points: number[] = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const on = field[i] >= 0.5 ? 1 : 0;
      const error = field[i] - on;
      if (on && alpha.data[i] >= 0.5 && points.length < MAX_PORTRAIT_POINTS * 3)
        points.push(
          Math.round(((x + 0.2 + random() * 0.6) / W) * 999),
          Math.round(((y + 0.2 + random() * 0.6) / H) * 999),
          Math.round(Math.min(1, 0.25 + tone[i] * 0.75) * 9),
        );
      if (x + 1 < W) field[i + 1] += (error * 7) / 16;
      if (y + 1 < H) {
        if (x > 0) field[i + W - 1] += (error * 3) / 16;
        field[i + W] += (error * 5) / 16;
        if (x + 1 < W) field[i + W + 1] += error / 16;
      }
    }
  if (points.length < 600)
    throw new PortraitError(
      "No person could be found in this photo. Try a clearer portrait.",
    );
  return { aspect: +(W / H).toFixed(4), points };
}
