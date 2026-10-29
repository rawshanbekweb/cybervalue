// Academy Intermediate · Secure connections: how long a recorded Wi-Fi
// handshake holds out against an offline dictionary attack (WEP, WPA2-PSK,
// WPA3-SAE), what an attacker on café Wi-Fi sees with no VPN, a split tunnel
// or a full tunnel, and when an SSH host key fingerprint should stop you.
// Simplified, but the rules are the real ones.
import type { Text } from "../network/ip";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Wi-Fi ---------------------------------------------------------------------------

export const MODES = ["open", "wep", "wpa2", "wpa3"] as const;
export type WifiMode = (typeof MODES)[number];

/** Passphrases at the top of every cracking dictionary. */
export const COMMON = [
  "12345678",
  "123456789",
  "password",
  "qwerty123",
  "11111111",
  "password1",
  "admin123",
  "iloveyou",
  "toshkent",
  "uzbekistan",
] as const;

/** Guesses per second of one GPU rig against WPA2's PBKDF2 (4096 rounds). */
export const RATE = 1_000_000;

/** The size of the space a passphrase was drawn from, by its characters. */
export function searchSpace(pass: string) {
  let set = 0;
  if (/[a-z]/.test(pass)) set += 26;
  if (/[A-Z]/.test(pass)) set += 26;
  if (/[0-9]/.test(pass)) set += 10;
  if (/[^a-zA-Z0-9]/.test(pass)) set += 33;
  return set ** pass.length;
}

export type WifiResult =
  /** WPA needs 8 to 63 characters. */
  | { kind: "invalid" }
  /** Anyone in range reads the traffic. */
  | { kind: "open" }
  /** The key falls out of the traffic itself, whatever it is. */
  | { kind: "wep" }
  /** A captured handshake is cracked offline in this many seconds. */
  | { kind: "offline"; seconds: number }
  /** SAE: no offline attack; each guess is a live, visible attempt. */
  | { kind: "sae" };

export function wifi(mode: WifiMode, pass: string): WifiResult {
  if (mode === "open") return { kind: "open" };
  if (mode === "wep") return { kind: "wep" };
  if (pass.length < 8 || pass.length > 63) return { kind: "invalid" };
  if (mode === "wpa3") return { kind: "sae" };
  const lower = pass.toLowerCase();
  if ((COMMON as readonly string[]).includes(lower))
    return { kind: "offline", seconds: 1 };
  // On average half the space is searched before the right guess.
  return { kind: "offline", seconds: searchSpace(pass) / 2 / RATE };
}

const YEAR = 365 * 24 * 3600;

/** Safe means no offline attack, or one that takes over a hundred years. */
export function wifiSafe(mode: WifiMode, pass: string) {
  const r = wifi(mode, pass);
  return r.kind === "sae" || (r.kind === "offline" && r.seconds > 100 * YEAR);
}

export type Span = { n: number; unit: "s" | "min" | "h" | "d" | "y" | "ages" };

/** A duration rounded to the unit people think in. */
export function span(seconds: number): Span {
  if (seconds < 60) return { n: Math.max(1, Math.round(seconds)), unit: "s" };
  if (seconds < 3600) return { n: Math.round(seconds / 60), unit: "min" };
  if (seconds < 86_400) return { n: Math.round(seconds / 3600), unit: "h" };
  if (seconds < YEAR) return { n: Math.round(seconds / 86_400), unit: "d" };
  if (seconds < 1e6 * YEAR) return { n: Math.round(seconds / YEAR), unit: "y" };
  return { n: 1e6, unit: "ages" };
}

// --- VPN ----------------------------------------------------------------------------------

export type VpnSetup = {
  mode: "none" | "split" | "full";
  /** Do DNS queries go through the tunnel too? */
  dns: boolean;
};

export type Leak = {
  id: string;
  label: Text;
  /** Does the attacker on the café Wi-Fi see it with this setup? */
  seen: (s: VpnSetup) => boolean;
};

const inTunnel = (s: VpnSetup) => s.mode !== "none";

export const LEAKS: Leak[] = [
  {
    id: "dns",
    label: t(
      "Qaysi nomlarni qidirayotganingiz (DNS so‘rovlari)",
      "Which names you look up (DNS queries)",
    ),
    seen: (s) => !inTunnel(s) || !s.dns,
  },
  {
    id: "sites",
    label: t(
      "Qaysi saytlarga borayotganingiz (server IP manzillari)",
      "Which sites you visit (server IP addresses)",
    ),
    seen: (s) => s.mode !== "full",
  },
  {
    id: "http",
    label: t(
      "http://news.uz sahifasining matni (oddiy HTTP)",
      "The text of http://news.uz (plain HTTP)",
    ),
    seen: (s) => s.mode !== "full",
  },
  {
    id: "office",
    label: t("Ofis fayl serveriga trafik", "Traffic to the office file server"),
    seen: (s) => !inTunnel(s),
  },
];

export const vpnSafe = (s: VpnSetup) => LEAKS.every((l) => !l.seen(s));

// --- SSH host keys -------------------------------------------------------------------------

export type Connect = {
  id: string;
  where: Text;
  host: string;
  /** What the SSH client prints. */
  warning: "unknown" | "changed";
  shown: string;
  /** The fingerprint the admin published for this host, if any. */
  published: string;
};

export const CONNECTS: Connect[] = [
  {
    id: "office",
    where: t(
      "Ofisda, yangi noutbukdan birinchi marta",
      "In the office, the first time from a new laptop",
    ),
    host: "deploy@app.shop.uz",
    warning: "unknown",
    shown: "SHA256:q3Vf8xN2Lk0pYw7Rz5TgHcJ1bM9dE4sA6uK2iOv",
    published: "SHA256:q3Vf8xN2Lk0pYw7Rz5TgHcJ1bM9dE4sA6uK2iOv",
  },
  {
    id: "cafe",
    where: t(
      "Kafe Wi-Fi’da, o‘sha serverga — kecha hammasi joyida edi",
      "On café Wi-Fi, to the same server — yesterday all was fine",
    ),
    host: "deploy@app.shop.uz",
    warning: "changed",
    shown: "SHA256:Zt1kW9yQe3Hn7Pc0Lx4Rv8Ub2Mj6Gd5Fs1Ao9Ki",
    published: "SHA256:q3Vf8xN2Lk0pYw7Rz5TgHcJ1bM9dE4sA6uK2iOv",
  },
  {
    id: "new",
    where: t(
      "Yangi zaxira serverga birinchi marta",
      "The first time to the new backup server",
    ),
    host: "admin@backup.shop.uz",
    warning: "unknown",
    shown: "SHA256:Bn4Qx7Wc2Lr9Ty1Hm6Kp3Vs8Zd0Ej5Gu2Fa7Ni",
    published: "SHA256:Bn4Qx7Wc2Lr9Ty1Hm6Kp3Vs8Zd0Ej5Gu2Fa7Nl",
  },
];

/** Connect only when the shown key is the one the admin published. */
export const shouldConnect = (c: Connect) => c.shown === c.published;

export const sshSolved = (answers: Record<string, "yes" | "no" | undefined>) =>
  CONNECTS.every((c) => answers[c.id] === (shouldConnect(c) ? "yes" : "no"));
