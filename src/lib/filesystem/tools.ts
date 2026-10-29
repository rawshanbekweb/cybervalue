// Academy Intermediate · File systems: which timestamps (MACB) an action
// changes on Linux ext4, recognising files by their first bytes when the
// name is gone, and building a timeline from sources in different time
// zones. Simplified, but the rules are the ones forensic tools apply.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- MACB -----------------------------------------------------------------------------

export const STAMPS = ["m", "a", "c", "b"] as const;
export type Stamp = (typeof STAMPS)[number];

export const ACTIONS = ["read", "write", "chmod", "rename"] as const;
export type Action = (typeof ACTIONS)[number];

/**
 * ext4 with strictatime: reading touches atime; writing the content changes
 * mtime and, because the size and blocks change, ctime; chmod and a rename
 * change only the inode, so only ctime. Birth never changes.
 */
export const CHANGES: Record<Action, Stamp[]> = {
  read: ["a"],
  write: ["m", "c"],
  chmod: ["c"],
  rename: ["c"],
};

export type Grid = Record<Action, Stamp[]>;

export const cellRight = (g: Grid, a: Action, s: Stamp) =>
  g[a].includes(s) === CHANGES[a].includes(s);

export const gridSolved = (g: Grid) =>
  ACTIONS.every((a) => STAMPS.every((s) => cellRight(g, a, s)));

// --- File signatures ------------------------------------------------------------------

export type Signature = { kind: string; magic: number[] };

/** The first bytes ("magic numbers") carvers look for. */
export const SIGNATURES: Signature[] = [
  { kind: "jpeg", magic: [0xff, 0xd8, 0xff] },
  { kind: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  { kind: "pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  { kind: "zip", magic: [0x50, 0x4b, 0x03, 0x04] },
  { kind: "exe", magic: [0x4d, 0x5a] },
];

export const hex = (bytes: number[]) =>
  bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");

export function identify(bytes: number[]) {
  const hit = SIGNATURES.find((s) => s.magic.every((m, i) => bytes[i] === m));
  return hit?.kind ?? null;
}

// --- Timelines ------------------------------------------------------------------------

export type Artifact = {
  id: string;
  source: Text;
  /** The clock as the source writes it. */
  clock: string;
  /** Hours the source's clock is ahead of UTC. */
  offset: number;
  what: Text;
};

/** Seconds since midnight UTC for an artifact’s clock. */
export function utcSeconds(a: Artifact) {
  const [h, m, s] = a.clock.split(":").map(Number);
  return ((((h - a.offset) * 3600 + m * 60 + s) % 86_400) + 86_400) % 86_400;
}

export const utcClock = (a: Artifact) => {
  const sec = utcSeconds(a);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}`;
};

const WEB = t(
  "Nginx access.log (Toshkent vaqti, UTC+5)",
  "nginx access.log (Tashkent time, UTC+5)",
);
const FS = t("Fayl tizimi, ext4 (UTC)", "File system, ext4 (UTC)");

export const ARTIFACTS: Artifact[] = [
  {
    id: "upload",
    source: WEB,
    clock: "07:11:02",
    offset: 5,
    what: t(
      "POST /upload.php — 200 (fayl yuklandi)",
      "POST /upload.php — 200 (a file was uploaded)",
    ),
  },
  {
    id: "shell",
    source: FS,
    clock: "02:11:03",
    offset: 0,
    what: t(
      "/var/www/uploads/shell.php yaratildi (birth)",
      "/var/www/uploads/shell.php created (birth)",
    ),
  },
  {
    id: "cmd",
    source: WEB,
    clock: "07:12:40",
    offset: 5,
    what: t(
      "GET /uploads/shell.php?cmd=id — 200",
      "GET /uploads/shell.php?cmd=id — 200",
    ),
  },
  {
    id: "miner",
    source: FS,
    clock: "02:14:10",
    offset: 0,
    what: t("/tmp/.x/miner yaratildi (birth)", "/tmp/.x/miner created (birth)"),
  },
  {
    id: "cron",
    source: FS,
    clock: "02:16:55",
    offset: 0,
    what: t(
      "/etc/crontab o‘zgartirildi (mtime)",
      "/etc/crontab changed (mtime)",
    ),
  },
];

/** The order the lesson starts from: sorted by the clocks as written. */
export const START = ["shell", "miner", "cron", "upload", "cmd"];

export const timelineSolved = (order: string[]) => {
  const secs = order.map((id) =>
    utcSeconds(ARTIFACTS.find((a) => a.id === id)!),
  );
  return secs.every((s, i) => i === 0 || secs[i - 1] <= s);
};
