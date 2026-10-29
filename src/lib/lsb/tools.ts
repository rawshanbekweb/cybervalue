// Academy Intermediate · Steganography inside images: what flipping each bit
// of a colour value does, reading a message from the lowest bits of a row of
// pixels, and a picture whose lowest blue bit plane shows a hidden word.

// --- One bit of one channel -------------------------------------------------------------

export type Rgb = [number, number, number];

export const BASE: Rgb = [200, 120, 80];

export const flip = (value: number, bit: number) => value ^ (1 << bit);

export const bits8 = (value: number) => value.toString(2).padStart(8, "0");

/** Flipping a bit of the red channel: how far the colour moves. */
export function flipRed(bit: number): { after: Rgb; change: number } {
  const r = flip(BASE[0], bit);
  return { after: [r, BASE[1], BASE[2]], change: Math.abs(r - BASE[0]) };
}

/** A single step out of 255: nobody can see the difference. */
export const invisible = (bit: number) => flipRed(bit).change <= 1;

// --- A message in a row of pixels --------------------------------------------------------

export const MESSAGE = "Hi!";

/** A row of ordinary-looking pixels with the message in the red LSBs. */
export const ROW: Rgb[] = (() => {
  const bits = [...MESSAGE]
    .map((c) => bits8(c.charCodeAt(0)))
    .join("")
    .split("")
    .map(Number);
  // A gentle sky-blue gradient, so the pixels look unremarkable.
  return bits.map((b, i): Rgb => {
    const r = 96 + ((i * 5) % 40);
    return [(r & ~1) | b, 150 + (i % 9), 210 - (i % 7)];
  });
})();

export const lowBits = (row: Rgb[]) => row.map((p) => p[0] & 1).join("");

export function bitsToText(bits: string) {
  let out = "";
  for (let i = 0; i + 8 <= bits.length; i += 8)
    out += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2));
  return out;
}

// --- Bit planes ---------------------------------------------------------------------------

export const WIDTH = 64;
export const HEIGHT = 32;
export const HIDDEN = "CV26";

/** 5×7 glyphs for the hidden word. */
const GLYPHS: Record<string, string[]> = {
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
};

/** Whether the hidden word covers pixel (x, y), drawn at double size. */
function inWord(x: number, y: number) {
  const scale = 2;
  const top = 9;
  const left = 6;
  const gy = Math.floor((y - top) / scale);
  if (gy < 0 || gy >= 7) return false;
  const gx = x - left;
  if (gx < 0) return false;
  const cell = 6 * scale;
  const index = Math.floor(gx / cell);
  const ch = HIDDEN[index];
  if (!ch) return false;
  const col = Math.floor((gx % cell) / scale);
  return col < 5 && GLYPHS[ch][gy][col] === "1";
}

/** The cover: a smooth sunset gradient; the word sits only in blue bit 0. */
export function picture(): Rgb[] {
  const out: Rgb[] = [];
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) {
      const r = 180 + Math.round((x / WIDTH) * 60);
      const g = 90 + Math.round((y / HEIGHT) * 70);
      // Blue loses its lowest bit and gets the word's pixel there instead.
      const b = (120 + Math.round(((x + y) / (WIDTH + HEIGHT)) * 80)) & ~1;
      out.push([r, g, b | (inWord(x, y) ? 1 : 0)]);
    }
  return out;
}

export const CHANNELS = ["r", "g", "b"] as const;
export type Channel = (typeof CHANNELS)[number];

/** One bit plane as true (white) or false (black) per pixel. */
export function plane(pixels: Rgb[], channel: Channel, bit: number) {
  const c = CHANNELS.indexOf(channel);
  return pixels.map((p) => ((p[c] >> bit) & 1) === 1);
}

export const wordRight = (guess: string) =>
  guess.replace(/\s/g, "").toUpperCase() === HIDDEN;

// --- Capacity -----------------------------------------------------------------------------

/** Bytes that fit with one bit per channel. */
export const capacity = (w: number, h: number, channels = 3) =>
  Math.floor((w * h * channels) / 8);
