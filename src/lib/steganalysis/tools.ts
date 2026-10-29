// Academy Intermediate · Steganalysis: the pairs-of-values effect that LSB
// embedding leaves in a picture's histogram (the idea behind the chi-square
// attack), measured on two photos, one of them carrying a payload.

/** Pixel values shown in the histograms. */
export const FROM = 100;
export const BINS = 16;

/** Deterministic wobble, so screens and tests agree. */
function wobble(i: number, seed: number) {
  const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * A natural photo: counts follow a smooth hump, and neighbouring values
 * (2k and 2k+1) differ by chance, often a lot.
 */
export function natural(seed = 1): number[] {
  return Array.from({ length: BINS }, (_, i) => {
    const hump = 900 * Math.exp(-(((i - 7) / 5) ** 2));
    return Math.round(hump * (0.55 + 0.9 * wobble(i, seed)));
  });
}

/**
 * Filling every LSB with random message bits makes each pair 2k, 2k+1 share
 * its pixels almost evenly.
 */
export function embedded(base: number[]): number[] {
  const out = [...base];
  for (let i = 0; i + 1 < out.length; i += 2) {
    const total = out[i] + out[i + 1];
    const half = Math.round(total / 2);
    out[i] = half + (i % 4 === 0 ? 3 : -3);
    out[i + 1] = total - out[i];
  }
  return out;
}

/** 0 = every pair even (suspicious), towards 1 = pairs differ (natural). */
export function pairSpread(h: number[]) {
  let sum = 0;
  let n = 0;
  for (let i = 0; i + 1 < h.length; i += 2) {
    const total = h[i] + h[i + 1];
    if (total === 0) continue;
    sum += Math.abs(h[i] - h[i + 1]) / total;
    n++;
  }
  return n ? sum / n : 0;
}

/** Below this spread the pairs are too even to be chance. */
export const THRESHOLD = 0.05;

export const looksEmbedded = (h: number[]) => pairSpread(h) < THRESHOLD;

/** The two photos of the lesson: B carries the payload. */
export const PHOTO_A = natural(1);
export const PHOTO_B = embedded(natural(2));
export const GUILTY = "b" as const;
