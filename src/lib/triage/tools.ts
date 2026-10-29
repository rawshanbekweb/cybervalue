// Academy Intermediate · Alert triage: a SOC queue of five alerts, each with
// the context an analyst would pull in, to be judged malicious (escalate),
// benign (close) or a false positive (tune the rule). Simplified, but the
// alerts are the kind a real SOC sees every day.
import type { Text } from "../anim-lab/types";

const t = (uz: string, en: string): Text => ({ uz, en });

export const VERDICTS = ["escalate", "close", "tune"] as const;
export type Verdict = (typeof VERDICTS)[number];

export type Alert = {
  id: string;
  severity: "high" | "medium" | "low";
  rule: string;
  title: Text;
  context: Text[];
  verdict: Verdict;
  why: Text;
};

export const ALERTS: Alert[] = [
  {
    id: "travel",
    severity: "medium",
    rule: "Impossible travel",
    title: t(
      "kamola Toshkentdan kirdi, 20 daqiqadan keyin — Frankfurtdan",
      "kamola logged in from Tashkent, then from Frankfurt 20 minutes later",
    ),
    context: [
      t(
        "Frankfurt manzili kompaniya VPN’ining chiqish nuqtasi",
        "The Frankfurt address is the company VPN’s exit node",
      ),
      t(
        "Ikkala kirish ham MFA bilan tasdiqlangan, bitta qurilmadan",
        "Both logins passed MFA, from the same device",
      ),
    ],
    verdict: "close",
    why: t(
      "kamola VPN’ni yoqdi xolos — xavfsiz, kutilgan holat. VPN manzillarini qoida istisnosiga qo‘shish ham mumkin.",
      "kamola just switched the VPN on — expected and harmless. The VPN addresses could also go on the rule’s exception list.",
    ),
  },
  {
    id: "macro",
    severity: "high",
    rule: "Office spawned encoded PowerShell",
    title: t(
      "HR-PC-07 da WINWORD.EXE powershell -enc ni ishga tushirdi (dilnoza)",
      "WINWORD.EXE started powershell -enc on HR-PC-07 (dilnoza)",
    ),
    context: [
      t(
        "2 daqiqa oldin dilnoza tashqi manzildan invoice.docm xatini oldi",
        "2 minutes earlier dilnoza received an email with invoice.docm from outside",
      ),
      t(
        "Kompyuter 3 kun oldin ro‘yxatdan o‘tgan domenga ulandi",
        "The PC then connected to a domain registered 3 days ago",
      ),
    ],
    verdict: "escalate",
    why: t(
      "Fishing, makros va yangi domenga ulanish — haqiqiy hujum. Kompyuterni izolyatsiya qilish uchun IR guruhiga darhol.",
      "Phishing, a macro and a call to a new domain — a real attack. Straight to incident response to isolate the PC.",
    ),
  },
  {
    id: "backup",
    severity: "low",
    rule: "Brute force: > 20 failures in 5 minutes",
    title: t(
      "svc_backup hisobi uchun 5 daqiqada 60 ta muvaffaqiyatsiz kirish",
      "60 failed logins for svc_backup in 5 minutes",
    ),
    context: [
      t(
        "Hammasi zaxira serveri BKP-01 dan, har 5 soniyada",
        "All from the backup server BKP-01, every 5 seconds",
      ),
      t(
        "Kecha svc_backup paroli almashtirilgan; zaxira vazifasi eskisini ishlatyapti",
        "svc_backup’s password was changed yesterday; the backup job still uses the old one",
      ),
    ],
    verdict: "close",
    why: t(
      "Hujum emas — sozlash xatosi. Yoping va IT’ga vazifadagi parolni yangilash uchun so‘rov yuboring.",
      "Not an attack — a misconfiguration. Close it and send IT a ticket to update the job’s password.",
    ),
  },
  {
    id: "mimikatz",
    severity: "high",
    rule: "Antivirus: HackTool/Mimikatz",
    title: t(
      "SRV-DB-01 da Mimikatz topildi va karantinga olindi",
      "Mimikatz detected and quarantined on SRV-DB-01",
    ),
    context: [
      t(
        "Fayl C:\\Users\\Public\\m.exe ga RDP sessiyasi orqali tushirilgan",
        "The file was dropped in C:\\Users\\Public\\m.exe through an RDP session",
      ),
      t(
        "RDP sessiyasi it_admin hisobidan, odatda kirmaydigan kompyuterdan",
        "The RDP session used it_admin, from a machine it never logs in from",
      ),
    ],
    verdict: "escalate",
    why: t(
      "Karantin — oxiri emas: kimdir serverda turibdi va parol o‘g‘irlamoqchi. it_admin hisobi ham buzilgan bo‘lishi mumkin.",
      "Quarantine isn’t the end: someone is on the server trying to steal passwords, and it_admin may be compromised.",
    ),
  },
  {
    id: "tor",
    severity: "medium",
    rule: "Connection to a Tor exit node",
    title: t(
      "10.0.0.15 185.220.101.4 ga ulandi",
      "10.0.0.15 connected to 185.220.101.4",
    ),
    context: [
      t(
        "Bu manzil 6 oydan beri Tor chiqish nuqtasi emas — ro‘yxat eskirgan",
        "That address stopped being a Tor exit 6 months ago — the list is stale",
      ),
      t(
        "Hozir u yerda ommaviy dasturiy yangilanishlar serveri ishlaydi",
        "It now hosts a public software-update server",
      ),
    ],
    verdict: "tune",
    why: t(
      "Qoida eskirgan indikatorga tayanadi. Ro‘yxatni avtomatik yangilanadigan manbaga almashtiring.",
      "The rule relies on a stale indicator. Switch the list to a feed that updates itself.",
    ),
  },
];

export type Answers = Partial<Record<string, Verdict>>;

export const right = (a: Alert, v: Verdict | undefined) => v === a.verdict;

export const allRight = (answers: Answers) =>
  ALERTS.every((a) => right(a, answers[a.id]));
