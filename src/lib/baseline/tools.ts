// Academy Intermediate · Patching and baselines: a web server's settings
// compared against its security baseline, four of them drifted since it was
// built. The baseline is a short, CIS-style one.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export type Row = {
  setting: string;
  baseline: string;
  current: string;
  fix: Text;
};

export const ROWS: Row[] = [
  {
    setting: "sshd: PermitRootLogin",
    baseline: "no",
    current: "no",
    fix: t("Mos keladi.", "Matches."),
  },
  {
    setting: "sshd: PasswordAuthentication",
    baseline: "no",
    current: "yes",
    fix: t(
      "Kimdir “vaqtincha” yoqqan: qaytadan o‘chiring.",
      "Someone turned it on “for a moment”: switch it back off.",
    ),
  },
  {
    setting: "ufw status",
    baseline: "active",
    current: "inactive",
    fix: t(
      "Firewall o‘chirilgan: qoidalarni tekshirib, yoqing.",
      "The firewall is off: check the rules and enable it.",
    ),
  },
  {
    setting: "unattended-upgrades",
    baseline: "enabled",
    current: "enabled",
    fix: t("Mos keladi.", "Matches."),
  },
  {
    setting: "/etc/shadow",
    baseline: "640 root:shadow",
    current: "640 root:shadow",
    fix: t("Mos keladi.", "Matches."),
  },
  {
    setting: "kernel",
    baseline: "6.8.0-49",
    current: "6.8.0-31",
    fix: t(
      "Yangi kernel o‘rnatilgan, lekin server qayta yuklanmagan: qayta yuklashni rejalashtiring.",
      "A newer kernel is installed but the server never rebooted: schedule the reboot.",
    ),
  },
  {
    setting: "auditd",
    baseline: "running",
    current: "not installed",
    fix: t(
      "Audit xizmati yo‘q: o‘rnatib, qoidalarni qo‘ying.",
      "There is no audit service: install it and load the rules.",
    ),
  },
];

export const drifted = (r: Row) => r.baseline !== r.current;

export const DRIFTED = ROWS.filter(drifted).map((r) => r.setting);

export const driftRight = (picked: Iterable<string>) => {
  const set = new Set(picked);
  return set.size === DRIFTED.length && DRIFTED.every((s) => set.has(s));
};
