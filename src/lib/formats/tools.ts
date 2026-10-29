// Academy Intermediate · Audio and file formats: a JPEG with a ZIP archive
// glued on after its end marker (seen in a hex dump and by binwalk), and a
// sound whose spectrogram shows a word. Simplified, but the markers and
// signatures are the real ones.

// --- Appended data ---------------------------------------------------------------------

export type HexLine = { offset: number; bytes: number[] };

const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

/** The interesting slices of the file, as `xxd` would show them. */
export const DUMP: HexLine[] = [
  {
    offset: 0x0000,
    bytes: [
      0xff,
      0xd8,
      0xff,
      0xe0,
      0x00,
      0x10,
      ...ascii("JFIF"),
      0x00,
      0x01,
      0x01,
      0x00,
      0x00,
      0x48,
    ],
  },
  {
    offset: 0x0010,
    bytes: [
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06,
      0x07, 0x06, 0x05, 0x08,
    ],
  },
  {
    offset: 0xbc40,
    bytes: [
      0x8a, 0x28, 0xa2, 0x80, 0x0a, 0x28, 0xa2, 0x80, 0x3f, 0xff, 0xd9, 0x50,
      0x4b, 0x03, 0x04, 0x14,
    ],
  },
  {
    offset: 0xbc50,
    bytes: [
      0x00, 0x00, 0x00, 0x08, 0x00, 0x7a, 0x5c, 0x63, 0x5b, 0x00, 0x00, 0x00,
      0x00, 0x08, 0x00, 0x00,
    ],
  },
  {
    offset: 0xbc60,
    bytes: [
      0x00,
      0x70,
      ...ascii("plan.txt"),
      0x0b,
      0xc9,
      0xcf,
      0x4d,
      0x2c,
      0x4e,
    ],
  },
];

/** The line holding FF D9, where the picture ends. */
export const END_LINE = DUMP.findIndex((l) =>
  l.bytes.some((b, i) => b === 0xff && l.bytes[i + 1] === 0xd9),
);

/** The offset of the first byte after FF D9. */
export function appendedAt() {
  const line = DUMP[END_LINE];
  const i = line.bytes.findIndex(
    (b, j) => b === 0xff && line.bytes[j + 1] === 0xd9,
  );
  return line.offset + i + 2;
}

export const hex2 = (b: number) =>
  b.toString(16).toUpperCase().padStart(2, "0");
export const printable = (b: number) =>
  b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : ".";

export const KINDS = ["zip", "pdf", "exe"] as const;
export type Kind = (typeof KINDS)[number];
export const HIDDEN_KIND: Kind = "zip";

// --- Spectrogram ---------------------------------------------------------------------------

export const SPEC_W = 72;
export const SPEC_H = 28;
export const WORD = "SOS";

const GLYPHS: Record<string, string[]> = {
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
};

/** Deterministic noise, so tests and screens agree. */
function noise(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Energy (0–1) per time step (x) and frequency (y, 0 = highest). Normal
 * sound lives in the low frequencies; the word is drawn high up.
 */
export function spectrogram(): number[][] {
  const scale = 3;
  const top = 3;
  const left = 6;
  const rows: number[][] = [];
  for (let y = 0; y < SPEC_H; y++) {
    const row: number[] = [];
    for (let x = 0; x < SPEC_W; x++) {
      // Music: strong low frequencies that fade towards the top.
      let e = (y / SPEC_H) ** 2 * 0.8 * (0.6 + 0.4 * noise(x, y));
      const gy = Math.floor((y - top) / scale);
      const gx = x - left;
      const cell = 6 * scale;
      const ch = WORD[Math.floor(gx / cell)];
      const col = Math.floor((gx % cell) / scale);
      if (
        gx >= 0 &&
        gy >= 0 &&
        gy < 7 &&
        ch &&
        col < 5 &&
        GLYPHS[ch][gy][col] === "1"
      )
        e = 0.95;
      row.push(Math.min(1, e));
    }
    rows.push(row);
  }
  return rows;
}

/** The waveform the ear hears: loudness over time, with no word in it. */
export function waveform(): number[] {
  return Array.from({ length: SPEC_W }, (_, x) => 0.3 + 0.5 * noise(x, 99));
}

export const wordRight = (guess: string) =>
  guess.replace(/\s/g, "").toUpperCase() === WORD;
