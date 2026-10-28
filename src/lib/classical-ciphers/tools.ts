// Academy Intermediate · Classical ciphers: Caesar, letter frequencies and
// Vigenère on the 26 Latin letters. Anything else (spaces, digits, the
// Uzbek ‘ and ’) passes through unchanged, and Vigenère's key moves on
// letters only, so the lessons can use ordinary Uzbek text.

const A = "a".charCodeAt(0);
const isLetter = (ch: string) => ch >= "a" && ch <= "z";
const shiftLetter = (ch: string, by: number) =>
  String.fromCharCode(((((ch.charCodeAt(0) - A + by) % 26) + 26) % 26) + A);

export const caesar = (text: string, shift: number) =>
  [...text.toLowerCase()]
    .map((ch) => (isLetter(ch) ? shiftLetter(ch, shift) : ch))
    .join("");

/** Letter counts, a to z. */
export function letterCounts(text: string) {
  const counts = new Array<number>(26).fill(0);
  for (const ch of text.toLowerCase())
    if (isLetter(ch)) counts[ch.charCodeAt(0) - A]++;
  return counts;
}

export const LETTERS = [..."abcdefghijklmnopqrstuvwxyz"];

/** The most frequent letter of a text. */
export function topLetter(text: string) {
  const counts = letterCounts(text);
  return LETTERS[counts.indexOf(Math.max(...counts))];
}

/** The Caesar shift that turns `plain` into `cipher`. */
export const shiftBetween = (plain: string, cipher: string) =>
  (cipher.charCodeAt(0) - plain.charCodeAt(0) + 26) % 26;

export function vigenere(text: string, key: string, decrypt = false) {
  const k = [...key.toLowerCase()].filter(isLetter);
  if (k.length === 0) return text.toLowerCase();
  let i = 0;
  return [...text.toLowerCase()]
    .map((ch) => {
      if (!isLetter(ch)) return ch;
      const by = k[i++ % k.length].charCodeAt(0) - A;
      return shiftLetter(ch, decrypt ? -by : by);
    })
    .join("");
}

/**
 * Known plaintext against Vigenère: subtracting a guessed start of the
 * message (the crib) from the ciphertext gives the key letters under it.
 */
export function keyUnderCrib(cipher: string, crib: string) {
  const c = [...cipher.toLowerCase()].filter(isLetter);
  const p = [...crib.toLowerCase()].filter(isLetter);
  return p
    .slice(0, c.length)
    .map((ch, i) => shiftLetter(c[i], -(ch.charCodeAt(0) - A)))
    .join("");
}

/** The shortest repeating unit of a string ("kalitkal" → "kalit"). */
export function period(s: string) {
  for (let n = 1; n <= s.length; n++)
    if ([...s].every((ch, i) => ch === s[i % n])) return s.slice(0, n);
  return s;
}

// --- The lessons' messages --------------------------------------------------

/** Lesson 1: a Caesar message to break by trying every shift. */
export const CAESAR_PLAIN = "uchrashuv soat oltida kutubxona oldida";
export const CAESAR_SHIFT = 7;
export const CAESAR_CIPHER = caesar(CAESAR_PLAIN, CAESAR_SHIFT);

/** Lesson 3: a longer Caesar text, long enough for its letters to show. */
export const FREQ_PLAIN =
  "parolni hech kimga aytmang va har bir sayt uchun alohida parol tanlang. " +
  "kalitni xat bilan birga yubormang, aks holda qulf ham ochiq qoladi. " +
  "bank xodimi hech qachon sizdan kodni so‘ramaydi, shuning uchun bunday " +
  "qo‘ng‘iroqlarga javob bermang va darhol bankka xabar bering.";
export const FREQ_SHIFT = 11;
export const FREQ_CIPHER = caesar(FREQ_PLAIN, FREQ_SHIFT);

/** Lesson 5: a Vigenère message whose start is known. */
export const VIG_KEY = "kalit";
export const VIG_PLAIN =
  "salom dostim ertaga soat beshda eski bozor yonidagi choyxonada uchrashamiz";
export const VIG_CRIB = "salom";
export const VIG_CIPHER = vigenere(VIG_PLAIN, VIG_KEY);
