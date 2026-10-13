// IPv6 basics: eight 16-bit groups in hex. The canonical short form (RFC 5952)
// drops leading zeros, writes lowercase and replaces the longest run of two or
// more all-zero groups with "::" (the first run on a tie).

export type Groups = number[];

export function parseIpv6(value: string): Groups | null {
  const text = value.trim().toLowerCase();
  if (!/^[0-9a-f:]+$/.test(text) || text.includes(":::")) return null;
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const part = (s: string) => (s ? s.split(":") : []);
  const head = part(halves[0]);
  const tail = halves.length === 2 ? part(halves[1]) : [];
  if ([...head, ...tail].some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  return [...head, ...Array(Math.max(missing, 0)).fill("0"), ...tail].map((g) =>
    parseInt(g, 16),
  );
}

export const expand = (groups: Groups) =>
  groups.map((g) => g.toString(16).padStart(4, "0")).join(":");

export function compress(groups: Groups) {
  let best = { start: -1, length: 0 };
  for (let i = 0; i < 8;) {
    if (groups[i] !== 0) {
      i++;
      continue;
    }
    let j = i;
    while (j < 8 && groups[j] === 0) j++;
    if (j - i > best.length) best = { start: i, length: j - i };
    i = j;
  }
  const hex = groups.map((g) => g.toString(16));
  if (best.length < 2) return hex.join(":");
  const left = hex.slice(0, best.start).join(":");
  const right = hex.slice(best.start + best.length).join(":");
  return `${left}::${right}`;
}

export type Check = {
  rule: "valid" | "same" | "zeros" | "run" | "case";
  ok: boolean;
};

// What is right and wrong about a student's short form for `address`.
export function review(address: string, answer: string): Check[] {
  const target = parseIpv6(address)!;
  const parsed = parseIpv6(answer);
  const text = answer.trim();
  const same = !!parsed && parsed.every((g, i) => g === target[i]);
  const canonical = compress(target);
  return [
    { rule: "valid", ok: !!parsed },
    { rule: "same", ok: same },
    {
      rule: "zeros",
      ok: !!parsed && !/(^|:)0[0-9a-f]/i.test(text),
    },
    // With zeros and case fixed, only the "::" placement can still differ.
    { rule: "run", ok: same && tidy(text) === canonical },
    { rule: "case", ok: text === text.toLowerCase() },
  ];
}

// Lowercase and strip leading zeros, keeping any "::" where it is.
const tidy = (text: string) =>
  text
    .toLowerCase()
    .split(":")
    .map((g) => (g ? parseInt(g, 16).toString(16) : g))
    .join(":");

export const isCanonical = (address: string, answer: string) =>
  answer.trim() === compress(parseIpv6(address)!);
