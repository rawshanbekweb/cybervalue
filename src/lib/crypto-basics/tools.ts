// The working parts of the cryptography lab: bytes and Base64, a synchronous
// SHA-256 (so widgets can hash on every keystroke and tests can check it
// against node:crypto), XOR, key-space arithmetic and a toy RSA signature.

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

/** The UTF-8 bytes of a text. */
export const bytesOf = (text: string) => [...encoder.encode(text)];

export const hex = (bytes: number[]) =>
  bytes.map((b) => b.toString(16).padStart(2, "0")).join("");

export const binary = (byte: number) => byte.toString(2).padStart(8, "0");

/** Each character with the bytes UTF-8 uses for it. */
export const charBytes = (text: string) =>
  [...text].map((char) => ({ char, bytes: bytesOf(char) }));

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function toBase64(text: string) {
  const bytes = bytesOf(text);
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b, c] = [bytes[i], bytes[i + 1], bytes[i + 2]];
    const n = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    out += b === undefined ? "=" : B64[(n >> 6) & 63];
    out += c === undefined ? "=" : B64[n & 63];
  }
  return out;
}

/** Decodes Base64 to text, or null when it is not valid Base64 of UTF-8. */
export function fromBase64(value: string): string | null {
  const clean = value.trim();
  if (!clean || clean.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(clean))
    return null;
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const chunk = clean.slice(i, i + 4);
    const n = [...chunk].reduce(
      (acc, ch) => (acc << 6) | (ch === "=" ? 0 : B64.indexOf(ch)),
      0,
    );
    bytes.push((n >> 16) & 255);
    if (chunk[2] !== "=") bytes.push((n >> 8) & 255);
    if (chunk[3] !== "=") bytes.push(n & 255);
  }
  try {
    return decoder.decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

// SHA-256 (FIPS 180-4) on bytes.
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

export function sha256Bytes(input: number[]): number[] {
  const h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  const bitLength = input.length * 8;
  const data = [...input, 0x80];
  while (data.length % 64 !== 56) data.push(0);
  // The length fits in 32 bits for any text a widget hashes.
  data.push(0, 0, 0, 0);
  for (let i = 3; i >= 0; i--) data.push((bitLength >>> (i * 8)) & 255);
  const w = new Array<number>(64);
  for (let block = 0; block < data.length; block += 64) {
    for (let i = 0; i < 16; i++)
      w[i] =
        (data[block + i * 4] << 24) |
        (data[block + i * 4 + 1] << 16) |
        (data[block + i * 4 + 2] << 8) |
        data[block + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + s1 + ch + K[i] + w[i]) | 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) | 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
    h[5] = (h[5] + f) | 0;
    h[6] = (h[6] + g) | 0;
    h[7] = (h[7] + hh) | 0;
  }
  return h.flatMap((word) => [
    (word >>> 24) & 255,
    (word >>> 16) & 255,
    (word >>> 8) & 255,
    word & 255,
  ]);
}

/** SHA-256 of a text's UTF-8 bytes, as 64 hex characters. */
export const sha256 = (text: string) => hex(sha256Bytes(bytesOf(text)));

/** How many of the bits differ between two equal-length hex strings. */
export function bitsDiffer(a: string, b: string) {
  let count = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 2) {
    let x = parseInt(a.slice(i, i + 2), 16) ^ parseInt(b.slice(i, i + 2), 16);
    while (x) {
      count += x & 1;
      x >>= 1;
    }
  }
  return count;
}

/** Two texts of the same length that differ in exactly one character. */
export function oneCharApart(a: string, b: string) {
  const x = [...a];
  const y = [...b];
  if (!x.length || x.length !== y.length) return false;
  return x.filter((ch, i) => ch !== y[i]).length === 1;
}

export const xorByte = (a: number, b: number) => (a ^ b) & 255;

/** Smallest key length in bits whose search outlasts `years` at `perSecond`. */
export function bitsToOutlast(years: number, perSecond: number) {
  const seconds = years * 365.25 * 24 * 3600;
  return Math.ceil(Math.log2(seconds * perSecond));
}

/** Seconds needed to try every key of `bits` length at `perSecond` guesses. */
export const searchSeconds = (bits: number, perSecond: number) =>
  2 ** bits / perSecond;

// A toy RSA key pair (n = 61 × 53). Real keys use primes hundreds of digits
// long; the arithmetic is the same.
export const TOY_RSA = { n: 3233n, e: 17n, d: 2753n } as const;

function modPow(base: bigint, exp: bigint, mod: bigint) {
  let result = 1n;
  let b = base % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
}

/** The message digest the toy key signs: SHA-256 folded below n. */
export function toyDigest(message: string) {
  const [a, b] = sha256Bytes(bytesOf(message));
  return BigInt((a << 8) | b) % TOY_RSA.n;
}

export const toySign = (message: string) =>
  Number(modPow(toyDigest(message), TOY_RSA.d, TOY_RSA.n));

export const toyVerify = (message: string, signature: number) =>
  modPow(BigInt(signature), TOY_RSA.e, TOY_RSA.n) === toyDigest(message);
