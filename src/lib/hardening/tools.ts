// Academy Intermediate · Linux hardening: an `ls -l` listing with three
// risky entries among normal ones, and a server's listening services to
// keep public, limit to localhost or switch off. Simplified, but the
// permissions and services are what a hardening review looks at first.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

// --- Permissions -----------------------------------------------------------------------

export type Entry = {
  mode: string;
  owner: string;
  path: string;
  why: Text;
  risky: boolean;
};

export const ENTRIES: Entry[] = [
  {
    mode: "-rw-r--r--",
    owner: "root root",
    path: "/etc/passwd",
    risky: false,
    why: t(
      "Hamma o‘qiydi, faqat root yozadi — odatiy holat; parollar bu yerda emas.",
      "Readable by all, writable only by root — normal; the passwords aren’t here.",
    ),
  },
  {
    mode: "-rw-rw-rw-",
    owner: "root shadow",
    path: "/etc/shadow",
    risky: true,
    why: t(
      "Parol xeshlari hammaga ochiq va o‘zgartiriladigan: odatda 640 bo‘ladi.",
      "Password hashes readable and writable by everyone: it should be 640.",
    ),
  },
  {
    mode: "-rwsr-xr-x",
    owner: "root root",
    path: "/usr/bin/passwd",
    risky: false,
    why: t(
      "SUID kerak: oddiy foydalanuvchi o‘z parolini /etc/shadow ga yoza olishi uchun.",
      "SUID is needed here: users must be able to write their own password to /etc/shadow.",
    ),
  },
  {
    mode: "-rwsr-xr-x",
    owner: "root root",
    path: "/usr/local/bin/backup",
    risky: true,
    why: t(
      "Qo‘lda qo‘shilgan SUID root dastur: undagi har bir xato root huquqini beradi.",
      "A hand-added SUID root program: any flaw in it hands out root.",
    ),
  },
  {
    mode: "-rwxrwxrwx",
    owner: "root root",
    path: "/etc/cron.daily/cleanup",
    risky: true,
    why: t(
      "Har kuni root bo‘lib ishlaydi, lekin uni har kim tahrirlay oladi.",
      "Runs daily as root, yet anyone can edit it.",
    ),
  },
  {
    mode: "-rw-------",
    owner: "ali ali",
    path: "/home/ali/.ssh/id_ed25519",
    risky: false,
    why: t(
      "Shaxsiy kalit faqat egasiga ochiq — aynan shunday bo‘lishi kerak.",
      "The private key is open only to its owner — exactly right.",
    ),
  },
  {
    mode: "drwxrwxrwt",
    owner: "root root",
    path: "/tmp",
    risky: false,
    why: t(
      "Hamma yozadi, lekin oxiridagi t (sticky bit) boshqaning faylini o‘chirishga yo‘l qo‘ymaydi.",
      "Everyone may write, but the trailing t (sticky bit) stops people deleting others’ files.",
    ),
  },
];

export const RISKY = ENTRIES.filter((e) => e.risky).map((e) => e.path);

export const permsRight = (picked: Iterable<string>) => {
  const set = new Set(picked);
  return set.size === RISKY.length && RISKY.every((p) => set.has(p));
};

// --- Services --------------------------------------------------------------------------

export const ACTIONS = ["public", "local", "off"] as const;
export type Action = (typeof ACTIONS)[number];

export const ACTION_NAMES: Record<Action, Text> = {
  public: t("Ochiq qoldirish", "Keep it public"),
  local: t("Faqat 127.0.0.1 da", "Localhost only"),
  off: t("O‘chirish", "Switch it off"),
};

export type Service = {
  name: string;
  listen: string;
  action: Action;
  why: Text;
};

/** A small web server: it serves a site over HTTPS and is managed over SSH. */
export const SERVICES: Service[] = [
  {
    name: "sshd",
    listen: "0.0.0.0:22",
    action: "public",
    why: t(
      "Boshqaruv uchun kerak; kalit bilan kirish va firewall bilan himoyalanadi.",
      "Needed to manage the server; protect it with keys and the firewall.",
    ),
  },
  {
    name: "nginx",
    listen: "0.0.0.0:443",
    action: "public",
    why: t(
      "Saytning o‘zi — ochiq bo‘lishi shart.",
      "The site itself — it has to be public.",
    ),
  },
  {
    name: "mysqld",
    listen: "0.0.0.0:3306",
    action: "local",
    why: t(
      "Bazaga faqat shu serverdagi ilova ulanadi: internetga ochish shart emas.",
      "Only the app on this server uses the database: no need to expose it.",
    ),
  },
  {
    name: "redis-server",
    listen: "0.0.0.0:6379",
    action: "local",
    why: t(
      "Redis sukut bo‘yicha parolsiz; ochiq Redis — tez-tez buziladigan xizmat.",
      "Redis has no password by default; open Redis servers get taken over all the time.",
    ),
  },
  {
    name: "telnetd",
    listen: "0.0.0.0:23",
    action: "off",
    why: t(
      "Telnet parolni ochiq matnda yuboradi va SSH bor ekan, kerak emas.",
      "Telnet sends passwords in clear text, and SSH already does its job.",
    ),
  },
  {
    name: "vsftpd",
    listen: "0.0.0.0:21",
    action: "off",
    why: t(
      "Hech kim ishlatmaydi: ishlatilmaydigan xizmat — ortiqcha hujum yuzasi.",
      "Nobody uses it: an unused service is just extra attack surface.",
    ),
  },
];

export type Picks = Partial<Record<string, Action>>;

export const servicesRight = (picks: Picks) =>
  SERVICES.every((s) => picks[s.name] === s.action);
