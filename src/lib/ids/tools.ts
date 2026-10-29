// Academy Intermediate · Intrusion detection: a Suricata-style content rule
// that only catches encoded attacks once it matches on the normalized URI,
// a brute-force threshold that has to be tuned to catch a slow attacker
// without paging on typos, and the base-rate arithmetic behind alert
// fatigue. Simplified, but http.uri normalization, nocase and
// threshold/track by_src behave as in Suricata.

// --- Content matching ------------------------------------------------------------------

export const CONTENT = "/etc/passwd";

export type Request = { line: string; attack: boolean };

export const REQUESTS: Request[] = [
  { line: "GET /download?file=../../etc/passwd", attack: true },
  { line: "GET /download?file=..%2f..%2fetc%2fpasswd", attack: true },
  { line: "GET /download?file=../..//etc//passwd", attack: true },
  { line: "GET /download?file=../../ETC/PASSWD", attack: true },
  { line: "GET /download?file=report-2026.pdf", attack: false },
  { line: "GET /help/how-to-change-your-passwd", attack: false },
  { line: "GET /blog/etc-and-other-abbreviations", attack: false },
];

/** What Suricata's http.uri buffer holds: %xx decoded, // collapsed. */
export function normalize(uri: string) {
  let out = uri;
  try {
    out = decodeURIComponent(uri);
  } catch {
    // A broken escape stays as it is.
  }
  return out.replace(/\/{2,}/g, "/");
}

export type ContentRule = { normalized: boolean; nocase: boolean };

export function contentMatches(rule: ContentRule, line: string) {
  let hay = rule.normalized ? normalize(line) : line;
  let needle = CONTENT;
  if (rule.nocase) {
    hay = hay.toLowerCase();
    needle = needle.toLowerCase();
  }
  return hay.includes(needle);
}

export function contentScore(rule: ContentRule) {
  const caught = REQUESTS.filter(
    (r) => r.attack && contentMatches(rule, r.line),
  );
  const missed = REQUESTS.filter(
    (r) => r.attack && !contentMatches(rule, r.line),
  );
  const noise = REQUESTS.filter(
    (r) => !r.attack && contentMatches(rule, r.line),
  );
  return { caught, missed, noise };
}

export const contentSolved = (rule: ContentRule) => {
  const s = contentScore(rule);
  return s.missed.length === 0 && s.noise.length === 0;
};

// --- Thresholds ---------------------------------------------------------------------------

export type Source = {
  id: string;
  ip: string;
  who: "typo" | "bot";
  /** Seconds at which a failed SSH login was seen. */
  times: number[];
};

const every = (step: number, n: number, from = 0) =>
  Array.from({ length: n }, (_, i) => from + i * step);

export const SOURCES: Source[] = [
  // Mistyped the password three times in quick succession.
  { id: "alice", ip: "10.0.0.31", who: "typo", times: [0, 15, 40] },
  // Forgot the new password and tried four times over the morning.
  { id: "bob", ip: "10.0.0.44", who: "typo", times: [100, 260, 420, 580] },
  // A noisy bot: fifty guesses in under a minute.
  { id: "bot", ip: "203.0.113.7", who: "bot", times: every(1, 50, 30) },
  // A careful bot: one guess every 25 seconds for twenty minutes.
  { id: "slow", ip: "198.51.100.23", who: "bot", times: every(25, 48) },
];

export const WINDOWS = [10, 60, 300] as const;
export type Threshold = { count: number; seconds: (typeof WINDOWS)[number] };

/** The most events of one source inside any window of this length. */
export function peak(times: number[], seconds: number) {
  let best = 0;
  let start = 0;
  const sorted = [...times].sort((a, b) => a - b);
  for (let end = 0; end < sorted.length; end++) {
    while (sorted[end] - sorted[start] >= seconds) start++;
    best = Math.max(best, end - start + 1);
  }
  return best;
}

/** threshold: type both, track by_src, count N, seconds S. */
export const alerts = (th: Threshold, s: Source) =>
  peak(s.times, th.seconds) >= th.count;

export const thresholdSolved = (th: Threshold) =>
  SOURCES.every((s) => alerts(th, s) === (s.who === "bot"));

// --- Base rates ---------------------------------------------------------------------------

/**
 * Of all alerts, the share that are real: with few attacks among many
 * events, even a small false-positive rate buries them.
 */
export function precision(
  events: number,
  attacks: number,
  detect: number,
  fpRate: number,
) {
  const truePos = attacks * detect;
  const falsePos = (events - attacks) * fpRate;
  return truePos / (truePos + falsePos);
}
