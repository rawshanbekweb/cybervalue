// Academy Intermediate · Public-key cryptography: Diffie–Hellman over a
// choice of primes, an RSA key pair built from two small primes, and a key
// exchange with a man in the middle, with and without a signed public value.
// The arithmetic is real (BigInt); only the numbers are small enough to read.

export function modPow(base: bigint, exp: bigint, mod: bigint) {
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
}

const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b));

/** The inverse of a modulo m, or null when there is none. */
export function modInverse(a: bigint, m: bigint) {
  let [oldR, r] = [((a % m) + m) % m, m];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return oldR === 1n ? ((oldS % m) + m) % m : null;
}

// --- Diffie–Hellman -----------------------------------------------------------

/** The groups the lesson offers: toy, small, and one too big to search. */
// Each group comes with the secrets Alice and Bob pick in it: real secrets
// are random numbers about as large as p.
export const GROUPS = [
  { id: "p23", p: 23n, g: 5n, a: 6n, b: 15n, label: "p = 23" },
  { id: "p2087", p: 2087n, g: 5n, a: 1234n, b: 777n, label: "p = 2087" },
  {
    id: "p61",
    p: 2n ** 61n - 1n,
    g: 37n,
    a: 1_628_394_017_552_330_117n,
    b: 905_117_734_201_998_463n,
    label: "p = 2⁶¹ − 1",
  },
] as const;
export type GroupId = (typeof GROUPS)[number]["id"];

export function exchange(group: GroupId) {
  const { p, g, a, b } = GROUPS.find((x) => x.id === group)!;
  const A = modPow(g, a, p);
  const B = modPow(g, b, p);
  return { p, g, a, A, B, aliceKey: modPow(B, a, p), bobKey: modPow(A, b, p) };
}

/** Eve searches for Alice's secret from p, g and A; she gives up past a limit. */
export function eveSearch(group: GroupId, A: bigint, limit = 100_000) {
  const { p, g } = GROUPS.find((x) => x.id === group)!;
  let x = 1n;
  for (let i = 1; i <= limit && BigInt(i) < p; i++) {
    x = (x * g) % p;
    if (x === A) return { found: BigInt(i), tries: i };
  }
  return { found: null, tries: limit };
}

// --- RSA ----------------------------------------------------------------------

export const PRIMES = [
  11n,
  13n,
  17n,
  19n,
  23n,
  29n,
  31n,
  37n,
  41n,
  43n,
  47n,
  53n,
  59n,
  61n,
];
export const E = 17n;

export type RsaKey = { n: bigint; e: bigint; d: bigint; phi: bigint };

/** A key pair from two primes, or null when e has no inverse modulo φ. */
export function rsaKey(p: bigint, q: bigint): RsaKey | null {
  if (p === q) return null;
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  if (gcd(E, phi) !== 1n) return null;
  const d = modInverse(E, phi)!;
  return { n, e: E, d, phi };
}

export const encryptRsa = (m: bigint, k: RsaKey) => modPow(m, k.e, k.n);
export const decryptRsa = (c: bigint, k: RsaKey) => modPow(c, k.d, k.n);

/** Factoring n by trial division: easy for these, hopeless for 2048 bits. */
export function factor(n: bigint) {
  for (let f = 2n; f * f <= n; f++)
    if (n % f === 0n) return [f, n / f] as const;
  return null;
}

// --- A man in the middle ------------------------------------------------------

/**
 * Alice and Bob run Diffie–Hellman over p = 2⁶¹ − 1, and Mallory sits on the
 * line and swaps in her own values. Without a signature each side ends up
 * with a key Mallory shares; when Bob signs his public value with a key
 * Alice already trusts, Alice sees that the value she got is not Bob's.
 */
export function middle(signed: boolean) {
  const a = 123_456_789n;
  const b = 987_654_321n;
  const m = 555_555_555n;
  const { p, g } = GROUPS[2];
  const A = modPow(g, a, p);
  const B = modPow(g, b, p);
  const M = modPow(g, m, p);
  // Mallory forwards M to both sides instead of A and B.
  const aliceKey = modPow(M, a, p);
  const bobKey = modPow(M, b, p);
  const malloryWithAlice = modPow(A, m, p);
  const malloryWithBob = modPow(B, m, p);
  // Bob's signature covers B; Mallory cannot make one for M.
  const aliceSeesForgery = signed && M !== B;
  return {
    A,
    B,
    M,
    aliceKey,
    bobKey,
    readsAlice: aliceKey === malloryWithAlice,
    readsBob: bobKey === malloryWithBob,
    stopped: aliceSeesForgery,
  };
}
