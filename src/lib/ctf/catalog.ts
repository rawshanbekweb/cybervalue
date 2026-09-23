export const CHALLENGE_IDS = [
  "source",
  "signal",
  "archive",
  "trace",
  "vault",
] as const;
export type ChallengeId = (typeof CHALLENGE_IDS)[number];
export type Challenge = {
  id: ChallengeId;
  number: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
  duration: string;
  teaser: string;
  brief: string;
  objective: string;
  files: { name: string; content: string }[];
  hints: string[];
};

export const CHALLENGES: Challenge[] = [
  {
    id: "source",
    number: "01",
    title: "Sukutdagi iz",
    category: "WEB",
    difficulty: "Boshlang‘ich",
    points: 100,
    duration: "3–5 daqiqa",
    teaser: "Ko‘rinmaydigan narsa yo‘q degani emas.",
    brief:
      "NOVA stansiyasi 00:17 da aloqani uzdi. Operatorning oxirgi sahifasi oddiy texnik xabarga o‘xshaydi. Ammo u xabarni sahifani o‘qiydiganlar uchun emas, manbasini tekshiradiganlar uchun qoldirgan.",
    objective: "Saqlangan HTML manbasidan operator qoldirgan flagni toping.",
    files: [
      {
        name: "last-page.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head><title>NOVA // maintenance</title></head>
  <body>
    <main>
      <h1>Nothing to see here.</h1>
      <p>The station is undergoing scheduled maintenance.</p>
      <p>Last contact: 00:17 UTC</p>
    </main>
    <!-- Operator note: the screen is not the whole story. -->
    <!-- recovery-marker: CV{comments_tell_stories} -->
    <!-- Next relay: listen before you transmit. -->
  </body>
</html>`,
      },
    ],
    hints: [
      "Brauzer sahifadagi barcha matnni ko‘rsatmaydi. HTML izohlarini tekshiring.",
      "Izohlar <!-- bilan boshlanib, --> bilan tugaydi. Pastki qismni o‘qing.",
      "recovery-marker yozuvi yonidagi CV{...} matnini yuboring.",
    ],
  },
  {
    id: "signal",
    number: "02",
    title: "Ikki qavatli signal",
    category: "CRYPTO",
    difficulty: "Boshlang‘ich",
    points: 150,
    duration: "5–8 daqiqa",
    teaser: "Signal yo‘qolmagan. Faqat boshqa tilda.",
    brief:
      "Qabul qilgich bitta paketni saqlab qolgan. Operator eski uzatish protokolidan foydalangan: avval harflarni aylantirish, keyin transport kodlash. Asl xabarga qaytish uchun yo‘lni teskari yuring.",
    objective: "Paketni ikki bosqichda oching. Quyidagi dekoder yordam beradi.",
    files: [
      {
        name: "intercept.txt",
        content: `NOVA / PASSIVE RECEIVER
capture-time: 00:17:04 UTC
packet: 7 of 7

TRANSMIT PIPELINE
plain text → ROT13 → Base64 → radio

PAYLOAD
UEl7ZWJnbmdyX2d1cl9mdnRhbnl9

Operator: "Undo the last step first."
Note: encoding is not encryption.`,
      },
    ],
    hints: [
      "Uzatish tartibi ROT13 → Base64. Ochish tartibi buning teskarisi.",
      "PAYLOAD matnini dekoderga qo‘yib, avval Base64 amalini bajaring.",
      "Birinchi natijani yana kirishga o‘tkazing va ROT13 ni bosing. CV{...} hosil bo‘ladi.",
    ],
  },
  {
    id: "archive",
    number: "03",
    title: "Unutilgan eshik",
    category: "RECON",
    difficulty: "O‘rta",
    points: 150,
    duration: "5–8 daqiqa",
    teaser: "Kirmang degan yozuv ba’zan xaritaning o‘zi.",
    brief:
      "Stansiyaning ommaviy arxivida bir yo‘l qidiruv robotlaridan yashirilgan. Bu yo‘l himoyalangan degani emas. Mahalliy arxiv terminalida robots.txt ni tekshirib, izlar bo‘ylab boring.",
    objective:
      "Yo‘l tekshiruvchisida /robots.txt dan boshlang. Bu faqat o‘yin ichidagi arxiv.",
    files: [
      {
        name: "archive-notes.txt",
        content: `NOVA / ARCHIVE MIRROR
No directory listing available.
Entry point: /robots.txt

Operator note:
"We asked the crawlers not to visit.
 Did anyone actually lock the door?"

Use the local path inspector below.
Only paths from this fictional archive are available.`,
      },
    ],
    hints: [
      "Yo‘l maydoniga /robots.txt yozib oching. Disallow qatorini toping.",
      "Disallow ko‘rsatgan /maintenance/ yo‘lini oching va u yerdagi fayl nomini o‘qing.",
      "To‘liq yo‘l: /maintenance/recovery.txt. robots.txt kirishni nazorat qilmaydi.",
    ],
  },
  {
    id: "trace",
    number: "04",
    title: "Shovqin orasidagi haqiqat",
    category: "FORENSICS",
    difficulty: "O‘rta",
    points: 200,
    duration: "8–12 daqiqa",
    teaser: "Har bir log bir xil voqeani aytmaydi.",
    brief:
      "Uchta relay xabarlarni tartibsiz yozgan. Test trafiklari ham logga aralashgan. Navbatchi rx-17 identifikatorini haqiqiy uzatish deb belgilagan. Paketlarni soat bo‘yicha emas, ketma-ketlik raqami bo‘yicha tiklang.",
    objective:
      "trace=rx-17 qatorlarini ajrating, seq bo‘yicha tartiblang va data qismlarini bo‘shliqsiz birlashtiring.",
    files: [
      {
        name: "relay.log",
        content: `00:17:05 relay=c trace=rx-17 seq=03 data=before_
00:17:01 relay=a trace=test-9 seq=01 data=CV{wrong_
00:17:08 relay=b trace=rx-17 seq=01 data=CV{
00:17:03 relay=c trace=test-9 seq=02 data=frequency}
00:17:02 relay=a trace=rx-17 seq=04 data=trust}
00:17:09 relay=b trace=health seq=01 data=OK
00:17:06 relay=c trace=rx-17 seq=02 data=trace_

Collector note:
Relay clocks are not synchronized.
Sequence numbers belong to each trace, not the whole file.`,
      },
    ],
    hints: [
      "Faqat trace=rx-17 yozilgan to‘rtta qator kerak. Qolganlari shovqin.",
      "Vaqt belgilariga ishonmang. seq=01, 02, 03, 04 tartibidan foydalaning.",
      "Birinchi bo‘lak CV{, ikkinchisi trace_. Qolgan ikki bo‘lakni shu tartibda davom ettiring.",
    ],
  },
  {
    id: "vault",
    number: "05",
    title: "So‘nggi uzatish",
    category: "FINALE",
    difficulty: "Yakuniy",
    points: 300,
    duration: "3–5 daqiqa",
    teaser: "To‘rtta parcha. Bitta oxirgi imkoniyat.",
    brief:
      "Aloqa yo‘li tiklandi. Har bir tugundan olingan kalit parchasi endi ma’no kasb etadi. Operatorning oxirgi xabari seyfda. Uni ochish uchun parchalardan stansiya nomini va uzilish vaqtidan kodni tuzing.",
    objective:
      "01 → 04 tartibidagi kalit harflari + pastki chiziq + uzilish vaqti (ikki nuqtasiz). Hammasini CV{...} ichiga joylang.",
    files: [
      {
        name: "vault.protocol",
        content: `NOVA / FINAL TRANSMISSION
requires: four recovered relay keys

KEY ORDER
01 → 02 → 03 → 04

FLAG FORMAT
CV{LETTERS_HHMM}

Preserve uppercase key letters.
Use the station's last-contact time, not the current time.
The leading zeroes matter.

"When the line goes quiet, someone still needs to listen."`,
      },
    ],
    hints: [
      "Oldingi to‘rtta topshiriqdan olingan harflarni raqam tartibida o‘qing.",
      "Uzilish vaqti sarlavhada: 00:17. Ikki nuqtani olib tashlang, nollarni saqlang.",
      "Format CV{LETTERS_HHMM}. Kalit harflari katta, vaqt esa to‘rtta raqam bo‘lishi kerak.",
    ],
  },
];

const ARCHIVE: Record<string, string> = {
  "/robots.txt":
    "User-agent: *\nDisallow: /maintenance/\n\n# Search indexing preferences, not an access policy.",
  "/maintenance/":
    "NOVA maintenance archive\n\nIndexing disabled.\nRecovery document: recovery.txt\n\nResolve the filename relative to this directory.",
  "/maintenance/recovery.txt":
    "RECOVERY RECORD / 00:17\n\nThe door was hidden, never locked.\nCV{robots_are_not_locks}\n\nOperator: replace obscurity with authorization.",
};

export function inspectPath(path: string): { status: number; body: string } {
  const clean = path.trim();
  if (!clean.startsWith("/") || clean.startsWith("//") || clean.length > 160)
    return {
      status: 400,
      body: "Mahalliy yo‘l kiriting. Masalan: /robots.txt",
    };
  return Object.hasOwn(ARCHIVE, clean)
    ? { status: 200, body: ARCHIVE[clean] }
    : {
        status: 404,
        body: "Bu arxivda bunday yo‘l yo‘q. Topilgan izdagi yo‘lni aynan yozing.",
      };
}
