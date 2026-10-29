// Academy Intermediate · Logs and artefacts: grepping a Linux auth.log for
// a break-in, and reading the same moment written as Unix seconds, Unix
// milliseconds and a Chrome/WebKit timestamp. Simplified, but the log lines
// and epochs are the real formats.

// --- auth.log -------------------------------------------------------------------------

export const AUTH_LOG = [
  "Oct  3 07:10:41 web01 sshd[2187]: Failed password for invalid user admin from 203.0.113.7 port 51234 ssh2",
  "Oct  3 07:10:44 web01 sshd[2187]: Failed password for invalid user admin from 203.0.113.7 port 51234 ssh2",
  "Oct  3 07:11:02 web01 sshd[2190]: Accepted publickey for deploy from 10.0.0.50 port 50122 ssh2",
  "Oct  3 07:11:09 web01 sshd[2195]: Failed password for root from 203.0.113.7 port 51260 ssh2",
  "Oct  3 07:11:13 web01 sshd[2195]: Failed password for root from 203.0.113.7 port 51260 ssh2",
  "Oct  3 07:12:30 web01 sudo:   deploy : TTY=pts/0 ; PWD=/home/deploy ; USER=root ; COMMAND=/usr/bin/apt update",
  "Oct  3 07:12:58 web01 sshd[2201]: Failed password for root from 198.51.100.23 port 40022 ssh2",
  "Oct  3 07:13:55 web01 sshd[2211]: Accepted password for root from 203.0.113.7 port 51290 ssh2",
  "Oct  3 07:13:55 web01 sshd[2211]: pam_unix(sshd:session): session opened for user root by (uid=0)",
  "Oct  3 07:15:20 web01 useradd[2240]: new user: name=sysbackup, UID=0, GID=0, home=/root, shell=/bin/bash",
  "Oct  3 07:16:02 web01 sshd[2211]: pam_unix(sshd:session): session closed for user root",
] as const;

export const ATTACKER = "203.0.113.7";
export const NEW_ACCOUNT = "sysbackup";

export type Grep = { pattern: string; ignoreCase: boolean; invert: boolean };

/** grep -E with -i and -v; a broken pattern matches nothing. */
export function grep(g: Grep, lines: readonly string[] = AUTH_LOG) {
  if (!g.pattern) return { ok: true as const, lines: [...lines] };
  let re: RegExp;
  try {
    re = new RegExp(g.pattern, g.ignoreCase ? "i" : "");
  } catch {
    return { ok: false as const, lines: [] };
  }
  return {
    ok: true as const,
    lines: lines.filter((l) => re.test(l) !== g.invert),
  };
}

export const answersRight = (ip: string, account: string) =>
  ip.trim() === ATTACKER && account.trim() === NEW_ACCOUNT;

// --- Epochs ---------------------------------------------------------------------------

/** Seconds between 1601-01-01 (Windows/WebKit epoch) and 1970-01-01. */
export const EPOCH_GAP = 11_644_473_600;

export const FORMATS = ["unixS", "unixMs", "webkit"] as const;
export type Format = (typeof FORMATS)[number];

/** Milliseconds since 1970 for a raw number read as this format. */
export function toMillis(raw: number, f: Format) {
  if (f === "unixS") return raw * 1000;
  if (f === "unixMs") return raw;
  return raw / 1000 - EPOCH_GAP * 1000;
}

/** An ISO date, or null when the number makes no sense in this format. */
export function readAs(raw: number, f: Format) {
  // A Chrome value is past 2^53, so round away the float error.
  const ms = Math.round(toMillis(raw, f));
  const d = new Date(ms);
  if (!Number.isFinite(ms) || Number.isNaN(d.getTime())) return null;
  const year = d.getUTCFullYear();
  if (year < 1601 || year > 9999) return null;
  return d.toISOString().replace(".000Z", "Z");
}

/** The moment the miner was downloaded, as three sources record it. */
export const MOMENT = Date.UTC(2026, 9, 3, 2, 14, 7);

export type Raw = { id: string; source: string; value: number; format: Format };

export const RAWS: Raw[] = [
  {
    id: "wtmp",
    source: "/var/log/wtmp",
    value: MOMENT / 1000,
    format: "unixS",
  },
  {
    id: "js",
    source: "app.log (JSON)",
    value: MOMENT + 482,
    format: "unixMs",
  },
  {
    id: "chrome",
    source: "Chrome History → downloads.start_time",
    value: (MOMENT / 1000 + EPOCH_GAP) * 1_000_000,
    format: "webkit",
  },
];

export const epochSolved = (picks: Record<string, Format | undefined>) =>
  RAWS.every((r) => picks[r.id] === r.format);
