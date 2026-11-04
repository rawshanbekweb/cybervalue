// Academy Intermediate · Host logging and monitoring: eight events from an
// invented Linux server's logs, four of which need investigating.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Event = {
  line: string;
  suspicious: boolean;
  why: Text;
};

export const EVENTS: Event[] = [
  {
    line: "10:02 sudo: dilnoza : COMMAND=/usr/bin/apt upgrade",
    suspicious: false,
    why: t(
      "Administrator ish vaqtida yangilanish o‘rnatdi — kutilgan.",
      "An admin installed updates during working hours — expected.",
    ),
  },
  {
    line: "02:41 sshd: Failed password for root from 203.0.113.7 (×58)",
    suspicious: true,
    why: t(
      "Bir manzildan root uchun ketma-ket 58 ta xato — parol taxmin qilinmoqda.",
      "58 failed root logins from one address in a row — someone is guessing passwords.",
    ),
  },
  {
    line: "03:00 CRON: (backup) CMD (/usr/local/bin/backup.sh)",
    suspicious: false,
    why: t(
      "Har kecha shu vaqtda ishlaydigan zaxira vazifasi.",
      "The nightly backup job that runs at this time every day.",
    ),
  },
  {
    line: "03:12 useradd: new user: name=support2, UID=0",
    suspicious: true,
    why: t(
      "Kechasi UID 0 (root huquqli) yangi foydalanuvchi — hech kim rejalashtirmagan.",
      "A new user with UID 0 (root rights) at night — nobody planned it.",
    ),
  },
  {
    line: "06:15 systemd: nginx.service: restarted after package update",
    suspicious: false,
    why: t(
      "Yangilanishdan keyin xizmat qayta ishga tushdi.",
      "The service restarted after an update.",
    ),
  },
  {
    line: "07:30 auditd: write to /etc/passwd by pid 4417 (curl)",
    suspicious: true,
    why: t(
      "curl dasturi /etc/passwd faylini o‘zgartirdi — bu odatiy emas.",
      "A curl process changed /etc/passwd — that never happens normally.",
    ),
  },
  {
    line: "00:00 logrotate: rotated /var/log/syslog",
    suspicious: false,
    why: t("Loglar har kecha aylantiriladi.", "Logs are rotated every night."),
  },
  {
    line: "08:05 sshd: Accepted publickey for olim (account disabled 2026-09)",
    suspicious: true,
    why: t(
      "Ishdan ketgan xodimning o‘chirilgan hisobi bilan kirish bo‘ldi.",
      "Someone signed in with a departed employee's disabled account.",
    ),
  },
];

export const SUSPICIOUS = EVENTS.flatMap((e, i) => (e.suspicious ? [i] : []));

export const eventsRight = (picked: Iterable<number>) => {
  const set = new Set(picked);
  return set.size === SUSPICIOUS.length && SUSPICIOUS.every((i) => set.has(i));
};
