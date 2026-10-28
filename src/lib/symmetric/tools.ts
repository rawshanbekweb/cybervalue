// Academy Intermediate · Symmetric encryption: a toy 8-byte block cipher
// standing in for AES (a keyed Feistel network over 32-bit halves), with the
// ECB, CBC and CTR modes, a keystream reused under one nonce, and an
// authentication tag. Small enough to read, faithful in how the modes behave:
// ECB repeats on repeated blocks, CTR is XOR with a keystream, and without a
// tag flipped bits go unnoticed.

export type Bytes = number[];

const round = (half: number, key: number, i: number) => {
  let h = (0x811c9dc5 ^ key ^ Math.imul(i + 1, 0x9e3779b9)) >>> 0;
  for (let s = 0; s < 32; s += 8) {
    h ^= (half >>> s) & 0xff;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
};

const keyWord = (key: string) => {
  let h = 0x811c9dc5;
  for (const ch of key) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
};

const word = (b: Bytes, at: number) =>
  ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0;
const bytesOf = (w: number) => [
  w >>> 24,
  (w >>> 16) & 255,
  (w >>> 8) & 255,
  w & 255,
];

/** The toy block cipher: 8 bytes in, 8 bytes out, the same key each way. */
export function encryptBlock(block: Bytes, key: string): Bytes {
  const k = keyWord(key);
  let l = word(block, 0);
  let r = word(block, 4);
  for (let i = 0; i < 8; i++) [l, r] = [r, (l ^ round(r, k, i)) >>> 0];
  return [...bytesOf(l), ...bytesOf(r)];
}

export const xor = (a: Bytes, b: Bytes) => a.map((x, i) => x ^ (b[i] ?? 0));

export const BLOCK = 8;

const blocks = (data: Bytes) => {
  const out: Bytes[] = [];
  for (let i = 0; i < data.length; i += BLOCK) {
    const b = data.slice(i, i + BLOCK);
    while (b.length < BLOCK) b.push(0);
    out.push(b);
  }
  return out;
};

export type Mode = "ecb" | "cbc" | "ctr";

/** Encrypts whole blocks; CBC and CTR take the IV / nonce as a number. */
export function encrypt(data: Bytes, key: string, mode: Mode, iv = 0): Bytes {
  const out: Bytes = [];
  let prev = [...bytesOf(iv), 0, 0, 0, 0];
  blocks(data).forEach((block, i) => {
    if (mode === "ecb") out.push(...encryptBlock(block, key));
    else if (mode === "cbc") {
      prev = encryptBlock(xor(block, prev), key);
      out.push(...prev);
    } else out.push(...xor(block, keystreamBlock(key, iv, i)));
  });
  return out;
}

/** CTR: the keystream is the cipher applied to nonce and counter. */
export const keystreamBlock = (key: string, nonce: number, counter: number) =>
  encryptBlock([...bytesOf(nonce), ...bytesOf(counter)], key);

export function ctr(data: Bytes, key: string, nonce: number): Bytes {
  const out: Bytes = [];
  data.forEach((b, i) => {
    const ks = keystreamBlock(key, nonce, Math.floor(i / BLOCK));
    out.push(b ^ ks[i % BLOCK]);
  });
  return out;
}

export const bytes = (text: string) => [...new TextEncoder().encode(text)];
export const text = (b: Bytes) => new TextDecoder().decode(new Uint8Array(b));
export const hex = (b: Bytes) =>
  b.map((x) => x.toString(16).padStart(2, "0")).join("");

// --- The picture for ECB ----------------------------------------------------

/** A 32×24 picture of a padlock in four colours (0 background). */
export const PICTURE: number[][] = Array.from({ length: 24 }, (_, y) =>
  Array.from({ length: 32 }, (_, x) => {
    const inside = (x0: number, x1: number, y0: number, y1: number) =>
      x >= x0 && x <= x1 && y >= y0 && y <= y1;
    if (inside(14, 17, 14, 18)) return 3;
    if (inside(6, 25, 11, 21)) return 2;
    if (inside(9, 22, 2, 10) && !inside(12, 19, 5, 10)) return 1;
    return 0;
  }),
);

/**
 * Each run of 8 pixels is one block, painted in one colour picked by its
 * ciphertext: equal blocks get the same colour, so ECB keeps the outline.
 */
export function encryptPicture(mode: Mode, key: string, iv = 7): number[][] {
  const out = encrypt(PICTURE.flat(), key, mode, iv);
  const width = PICTURE[0].length;
  const colour = (i: number) => {
    const start = i - (i % BLOCK);
    let h = 0;
    for (const b of out.slice(start, start + BLOCK)) h = (h * 31 + b) % 8;
    return h;
  };
  return PICTURE.map((row, y) => row.map((_, x) => colour(y * width + x)));
}

/** How many encrypted blocks are copies of another one. */
export function repeatedBlocks(cipher: Bytes) {
  const seen = new Map<string, number>();
  for (const b of blocks(cipher)) seen.set(hex(b), (seen.get(hex(b)) ?? 0) + 1);
  return [...seen.values()].filter((n) => n > 1).reduce((a, n) => a + n, 0);
}

// --- Nonce reuse --------------------------------------------------------------

export const KEY = "maxfiy-kalit";
export const MSG_A = "Bugun soat 9 da ofisda yig'ilish";
export const MSG_B = "Seyf kodi 4721, hech kimga aytma";

/**
 * Two messages under one key in CTR mode. With one nonce for both the
 * keystream repeats, so knowing the first message reveals the second.
 */
export function nonceReuse(fresh: boolean) {
  const a = ctr(bytes(MSG_A), KEY, 1);
  const b = ctr(bytes(MSG_B), KEY, fresh ? 2 : 1);
  // The attacker knows message A (a public announcement) and XORs.
  const recovered = text(
    xor(xor(a, b), bytes(MSG_A)).map((x) => (x >= 32 && x < 127 ? x : 63)),
  );
  return { a, b, recovered, leaked: recovered === MSG_B };
}

// --- Flipping bits and the tag ----------------------------------------------

export const PAYMENT = "to=Vali;sum=100000";

/** A keyed tag over the ciphertext, standing in for GCM's. */
export function tag(cipher: Bytes, key: string) {
  return hex(
    encryptBlock(
      blocks(cipher).reduce(
        (acc, b) => encryptBlock(xor(acc, b), key),
        new Array(8).fill(0),
      ),
      `${key}:tag`,
    ),
  );
}

/**
 * The attacker knows where the sum sits and XORs the ciphertext so "1"
 * becomes "9". The bank decrypts; with a tag it checks the tag first.
 */
export function tamper(authenticated: boolean) {
  const cipher = ctr(bytes(PAYMENT), KEY, 5);
  const sent = authenticated ? tag(cipher, KEY) : null;
  const at = PAYMENT.indexOf("sum=") + 4;
  const forged = [...cipher];
  forged[at] ^= "1".charCodeAt(0) ^ "9".charCodeAt(0);
  if (authenticated && tag(forged, KEY) !== sent)
    return { accepted: false, read: null as string | null, forged };
  return { accepted: true, read: text(ctr(forged, KEY, 5)), forged };
}
