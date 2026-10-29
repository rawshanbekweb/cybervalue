// Academy Intermediate · Network security, module 5: Intrusion detection.
// The lessons use ./tools.ts: a content rule against encoded attacks, a
// brute-force threshold to tune, and the base rate behind alert fatigue.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "content" } | { type: "threshold" };

export const PROGRESS_KEY = "cybervalue:ids:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const HOW = t("Qanday aniqlanadi", "How detection works");
const RULES = t("Qoidalar", "Rules");
const ALERTS = t("Ogohlantirishlar bilan ishlash", "Working the alerts");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: HOW,
    title: t("Imzo va anomaliya", "Signatures and anomalies"),
    minutes: 6,
    intro: t(
      "IDS (Intrusion Detection System) trafikni kuzatib, hujumga o‘xshaganini xabar qiladi. Imzo (signature) asosidagi aniqlash ma’lum hujumning aniq izini qidiradi — tez va aniq, lekin yangi hujumni ko‘rmaydi. Anomaliya asosidagi aniqlash “odatdagidan farq qiladigan”ni topadi — yangisini ham ko‘radi, lekin ko‘proq yolg‘on signal beradi.",
      "An IDS (intrusion detection system) watches traffic and reports what looks like an attack. Signature-based detection looks for the exact trace of a known attack — fast and precise, but blind to new ones. Anomaly-based detection finds what differs from normal — it sees new attacks too, but raises more false alarms.",
    ),
    analogy: t(
      "Imzo — qidiruvdagi jinoyatchilar rasmi; anomaliya — “bu odam tunda omborda nima qilyapti?” degan savol.",
      "A signature is a wanted poster; an anomaly is asking “what is that person doing in the warehouse at night?”",
    ),
    theory: [
      t(
        "Suricata va Snort — imzo asosidagi mashhur ochiq IDS’lar; Zeek esa trafikdan batafsil loglar yozadi, anomaliya qidirish uchun qulay.",
        "Suricata and Snort are well-known open signature IDSs; Zeek writes detailed logs from traffic, handy for hunting anomalies.",
      ),
    ],
    task: t(
      "Har bir aniqlash qaysi usulga tegishli?",
      "Which approach does each detection belong to?",
    ),
    hint: t(
      "Aniq satr yoki ma’lum belgi — imzo; “odatdan farq” — anomaliya.",
      "An exact string or known marker is a signature; “different from usual” is an anomaly.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "sig", label: t("Imzo", "Signature") },
        { id: "anom", label: t("Anomaliya", "Anomaly") },
      ],
      items: [
        {
          label: t(
            "URL’da “/etc/passwd” satri bor",
            "The URL contains “/etc/passwd”",
          ),
          bucket: "sig",
        },
        {
          label: t(
            "Ma’lum zararli dasturning User-Agent qatori",
            "A known malware family’s User-Agent string",
          ),
          bucket: "sig",
        },
        {
          label: t(
            "Ma’lum C2 serverning IP manzili",
            "The IP address of a known C2 server",
          ),
          bucket: "sig",
        },
        {
          label: t(
            "Hisobchi kompyuteri birinchi marta tunda 3 GB yukladi",
            "The accountant’s PC uploaded 3 GB at night for the first time",
          ),
          bucket: "anom",
        },
        {
          label: t(
            "Odatda 10 ta DNS so‘rov yuboradigan server soatiga 5000 yubormoqda",
            "A server that usually sends 10 DNS queries an hour now sends 5000",
          ),
          bucket: "anom",
        },
        {
          label: t(
            "Foydalanuvchi bir soat ichida Toshkent va Frankfurtdan kirdi",
            "A user logged in from Tashkent and Frankfurt within an hour",
          ),
          bucket: "anom",
        },
      ],
    },
  },
  {
    id: 2,
    group: RULES,
    title: t("Suricata qoidasini o‘qish", "Reading a Suricata rule"),
    minutes: 8,
    intro: t(
      "Suricata qoidasi ikki qismdan iborat: sarlavha (amal, protokol, manba, yo‘nalish, qabul qiluvchi) va qavs ichidagi parametrlar (xabar, nimani qidirish, chegaralar, raqam). Qoidani o‘qiy olish — u nimani ushlashini va nimani o‘tkazib yuborishini bilish demakdir.",
      "A Suricata rule has two parts: a header (action, protocol, source, direction, destination) and options in brackets (message, what to look for, limits, an ID). Reading a rule means knowing what it catches and what it lets slip.",
    ),
    analogy: t(
      "Qorovulga yozma ko‘rsatma: “kim, qayerdan, qayerga — va nimaga e’tibor berish”.",
      "Written orders for a guard: “who, from where, to where — and what to watch for”.",
    ),
    theory: [
      t(
        "alert — faqat xabar beradi (IDS); drop — paketni ham to‘xtatadi (IPS, trafik yo‘lida turganda).",
        "alert only reports (IDS); drop also stops the packet (IPS, when sitting inline).",
      ),
      t(
        "$HOME_NET va $EXTERNAL_NET — sozlamadagi o‘zgaruvchilar: o‘z tarmog‘ingiz va qolgan dunyo.",
        "$HOME_NET and $EXTERNAL_NET are variables from the config: your own network and the rest of the world.",
      ),
    ],
    task: t(
      "Qoidaning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the rule and read what it is.",
    ),
    hint: t("Hammasi bo‘lib yettita qism.", "Seven parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "alert", id: "action" },
          { text: " " },
          { text: "tcp $EXTERNAL_NET any", id: "src" },
          { text: " -> " },
          { text: "$HOME_NET 22", id: "dst" },
          { text: " (" },
        ],
        [
          { text: "  " },
          { text: 'msg:"SSH brute force";', id: "msg" },
          { text: " " },
          { text: "flags:S;", id: "flags" },
        ],
        [
          { text: "  " },
          {
            text: "threshold: type both, track by_src, count 5, seconds 300;",
            id: "threshold",
          },
        ],
        [
          { text: "  " },
          { text: "sid:1000001; rev:2;", id: "sid" },
          { text: ")" },
        ],
      ],
      parts: [
        {
          id: "action",
          title: t("Amal: alert", "Action: alert"),
          body: t(
            "Mos kelsa, ogohlantirish yoziladi. drop bo‘lsa, paket ham to‘xtatilardi.",
            "On a match an alert is logged. With drop the packet would be stopped too.",
          ),
        },
        {
          id: "src",
          title: t("Manba", "Source"),
          body: t(
            "TCP, tashqi tarmoqdan, istalgan manba portidan.",
            "TCP, from outside, from any source port.",
          ),
        },
        {
          id: "dst",
          title: t("Yo‘nalish va qabul qiluvchi", "Direction and destination"),
          body: t(
            "-> — faqat ichkariga; o‘z tarmog‘imizning 22-porti (SSH).",
            "-> means inbound only; port 22 (SSH) on our own network.",
          ),
        },
        {
          id: "msg",
          title: t("Xabar", "Message"),
          body: t(
            "Ogohlantirishda ko‘rinadigan matn — tahlilchi uchun tushunarli bo‘lishi kerak.",
            "The text shown in the alert — it should make sense to the analyst.",
          ),
        },
        {
          id: "flags",
          title: t("TCP bayroqlari", "TCP flags"),
          body: t(
            "Faqat SYN — har bir yangi ulanish urinishi.",
            "SYN only — every new connection attempt.",
          ),
        },
        {
          id: "threshold",
          title: t("Chegara", "Threshold"),
          body: t(
            "Bir manbadan 300 soniyada 5 ta urinish bo‘lsa — bitta ogohlantirish. Chegarasiz har bir SYN alohida signal bo‘lardi.",
            "Five attempts from one source within 300 seconds raise one alert. Without it, every SYN would be an alert of its own.",
          ),
        },
        {
          id: "sid",
          title: t("Qoida raqami va versiyasi", "Rule ID and revision"),
          body: t(
            "sid — qoidaning yagona raqami (o‘zimiznikilar 1000000 dan), rev — nechanchi tahrir.",
            "sid is the rule’s unique ID (local rules start at 1000000), rev its revision.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: RULES,
    title: t("Kodlangan hujumlar", "Encoded attacks"),
    minutes: 10,
    intro: t(
      'content:"/etc/passwd" qoidasi oddiy path traversal’ni ushlaydi. Lekin hujumchi satrni kodlaydi (%2f), ortiqcha slash qo‘shadi yoki katta harf bilan yozadi — server baribir o‘sha faylni ochadi, qoida esa jim qoladi. Suricata’ning http.uri buferi URI’ni normallashtiradi: %xx ochiladi, // birlashtiriladi.',
      'The rule content:"/etc/passwd" catches a plain path traversal. But the attacker encodes the string (%2f), adds extra slashes or writes it in capitals — the server still opens the same file while the rule stays silent. Suricata’s http.uri buffer normalizes the URI: %xx is decoded and // collapsed.',
    ),
    analogy: t(
      "Qidiruvdagi odam ko‘zoynak taqib olsa, rasm bo‘yicha qidiruvchi qorovul uni tanimaydi — yuzning o‘zini ko‘rish kerak.",
      "Put glasses on a wanted man and a guard matching the poster won’t know him — you have to look at the face itself.",
    ),
    theory: [
      t(
        "nocase — katta-kichik harfni farqlamaslik. Fayl tizimi farqlasa ham, Windows serverlar va ko‘p ilovalar farqlamaydi.",
        "nocase makes the match case-insensitive. Even where the file system cares, Windows servers and many apps don’t.",
      ),
    ],
    task: t(
      "Qoidani shunday sozlangki, to‘rtala hujum ushlansin va oddiy so‘rovlar signal bermasin.",
      "Set up the rule so it catches all four attacks and stays quiet on the ordinary requests.",
    ),
    hint: t(
      "Normallashtirilgan URI va nocase.",
      "The normalized URI and nocase.",
    ),
    widget: { type: "content" },
  },
  {
    id: 4,
    group: RULES,
    title: t("Chegarani sozlash", "Tuning a threshold"),
    minutes: 10,
    intro: t(
      "SSH brute force qoidasi bir manbadan N ta muvaffaqiyatsiz kirishni T soniya ichida sanaydi. Juda qattiq chegara — parolni uch marta xato yozgan xodim uchun ham signal. Juda yumshoq — har 25 soniyada bir marta taxmin qiladigan “sekin” bot ko‘rinmaydi.",
      "An SSH brute-force rule counts N failed logins from one source within T seconds. Too strict, and a colleague who mistypes three times raises an alert. Too loose, and a “slow” bot guessing once every 25 seconds never shows.",
    ),
    analogy: t(
      "Signalizatsiya: har bir mushukka chalinsa, hamma uni o‘chirib qo‘yadi; juda sezgirligi past bo‘lsa, o‘g‘ri sekin yursa sezmaydi.",
      "An alarm that goes off for every cat gets switched off; one too dull misses a burglar who moves slowly.",
    ),
    theory: [
      t(
        "“Low and slow” hujumlar aynan qisqa oyna chegaralaridan qochish uchun sekin ishlaydi — uzunroq oyna kerak.",
        "“Low and slow” attacks go slowly precisely to dodge short-window thresholds — a longer window catches them.",
      ),
    ],
    task: t(
      "Count va oynani shunday tanlangki, ikkala bot ushlansin, xato qilgan xodimlar esa signal bermasin.",
      "Pick the count and the window so both bots are caught and the colleagues who mistyped are not.",
    ),
    hint: t(
      "300 soniyalik oyna va 4 dan 12 gacha count.",
      "A 300-second window and a count from 4 to 12.",
    ),
    widget: { type: "threshold" },
  },
  {
    id: 5,
    group: ALERTS,
    title: t("Ogohlantirishni saralash", "Triaging alerts"),
    minutes: 8,
    intro: t(
      "Har bir ogohlantirish — savol: “bu haqiqiy hujummi?”. Tahlilchi kontekstga qaraydi: manba kim, vaqt, nishon zaifmi, keyin nima bo‘ldi. Haqiqiy hujum — eskalatsiya; zararsiz (masalan, o‘z skanerimiz) — qoidani sozlash yoki istisno qo‘shish.",
      "Every alert is a question: “is this a real attack?”. The analyst looks at context: who the source is, the time, whether the target is vulnerable, what happened next. A real attack is escalated; a benign one (our own scanner, say) means tuning the rule or adding an exception.",
    ),
    analogy: t(
      "Shifokor bitta alomatga qarab tashxis qo‘ymaydi: tahlil, tarix va boshqa belgilarni ham ko‘radi.",
      "A doctor doesn’t diagnose from one symptom: they look at tests, history and the other signs too.",
    ),
    theory: [
      t(
        "Istisno imkon qadar tor bo‘lsin: “skaner IP’si, seshanba 02:00–04:00”, “hamma narsani o‘chirish” emas.",
        "Keep exceptions as narrow as possible: “the scanner’s IP, Tuesdays 02:00–04:00”, not “turn it all off”.",
      ),
    ],
    task: t("Har bir ogohlantirishni ajrating.", "Sort each alert."),
    hint: t(
      "Manba ma’lummi va keyin nima bo‘ldi?",
      "Is the source known, and what happened next?",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "real", label: t("Haqiqiy — eskalatsiya", "Real — escalate") },
        { id: "benign", label: t("Zararsiz — sozlash", "Benign — tune") },
      ],
      items: [
        {
          label: t(
            "SQL injection signali, manba — kompaniyaning o‘z skaneri, rejadagi vaqtda",
            "SQL injection alert from the company’s own scanner, at its scheduled time",
          ),
          bucket: "benign",
        },
        {
          label: t(
            "/etc/passwd so‘rovi va server 200 javob berib, 2 KB qaytargan",
            "A request for /etc/passwd, answered 200 with 2 KB",
          ),
          bucket: "real",
        },
        {
          label: t(
            "10.0.0.9 har 60 soniyada noma’lum IP’ga ulanmoqda",
            "10.0.0.9 connects to an unknown IP every 60 seconds",
          ),
          bucket: "real",
        },
        {
          label: t(
            "Monitoring tizimi har daqiqada serverlarni ping qilmoqda",
            "The monitoring system pings the servers every minute",
          ),
          bucket: "benign",
        },
        {
          label: t(
            "SSH brute force, keyin o‘sha IP’dan muvaffaqiyatli kirish",
            "SSH brute force, then a successful login from the same IP",
          ),
          bucket: "real",
        },
        {
          label: t(
            "Zaxira serveri tunda odatdagidek 200 GB nusxa ko‘chirmoqda",
            "The backup server copying its usual 200 GB at night",
          ),
          bucket: "benign",
        },
      ],
    },
  },
  {
    id: 6,
    group: ALERTS,
    title: t("IDS yoki IPS", "IDS or IPS"),
    minutes: 6,
    intro: t(
      "IDS trafik nusxasini (SPAN, TAP) kuzatadi va faqat xabar beradi. IPS trafik yo‘lida (inline) turadi va paketni to‘xtata oladi — lekin yolg‘on signal endi haqiqiy foydalanuvchini to‘xtatadi, IPS ishdan chiqsa esa tarmoq ham to‘xtashi mumkin.",
      "An IDS watches a copy of the traffic (SPAN, TAP) and only reports. An IPS sits in the path (inline) and can stop packets — but now a false alarm blocks a real user, and if the IPS fails the network may stop too.",
    ),
    analogy: t(
      "IDS — kuzatuv kamerasi; IPS — eshikdagi qorovul: u to‘xtata oladi, lekin adashsa, xodimni ham kiritmaydi.",
      "An IDS is a CCTV camera; an IPS is a guard at the door: he can stop people, but when he is wrong, he keeps out staff too.",
    ),
    theory: [
      t(
        "Shifrlangan trafik (TLS) ichini IDS ko‘rmaydi: u faqat metama’lumotni (SNI, JA3, hajm) yoki TLS tugaydigan joydagi loglarni ko‘radi.",
        "An IDS can’t see inside encrypted traffic (TLS): it sees only metadata (SNI, JA3, sizes) or logs where TLS ends.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Inline — to‘xtatadi; nusxa — faqat ko‘radi.",
      "Inline can block; a copy can only watch.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Suricata SPAN portiga ulangan. U hujum paketini to‘xtata oladimi?",
            "Suricata is plugged into a SPAN port. Can it stop an attack packet?",
          ),
          options: [
            t(
              "Yo‘q — u faqat nusxani ko‘radi, asl paket allaqachon o‘tgan",
              "No — it sees only a copy; the original has already passed",
            ),
            t("Ha, har doim", "Yes, always"),
            t("Faqat UDP’da", "Only for UDP"),
          ],
          answer: 0,
          explain: t(
            "To‘xtatish uchun inline (IPS) rejimi kerak.",
            "Stopping takes inline (IPS) mode.",
          ),
        },
        {
          ask: t(
            "IPS’ga yangi qoida qo‘shishdan oldin nima qilish kerak?",
            "What should you do before adding a new rule to an IPS?",
          ),
          options: [
            t(
              "Avval alert rejimida sinab, yolg‘on signallarni tekshirish",
              "Run it in alert mode first and check for false positives",
            ),
            t("Darhol drop qilish", "Set it to drop straight away"),
            t("Barcha eski qoidalarni o‘chirish", "Delete all the old rules"),
          ],
          answer: 0,
          explain: t(
            "Yolg‘on drop — haqiqiy foydalanuvchilar uchun uzilish.",
            "A wrong drop is an outage for real users.",
          ),
        },
        {
          ask: t(
            "Hujumchi HTTPS ishlatsa, tarmoq IDS’i nimani ko‘ra oladi?",
            "If the attacker uses HTTPS, what can a network IDS still see?",
          ),
          options: [
            t(
              "Metama’lumot: IP, SNI, vaqt, hajm",
              "Metadata: IPs, SNI, timing, sizes",
            ),
            t("So‘rovning to‘liq matnini", "The full request text"),
            t("Hech narsani", "Nothing at all"),
          ],
          answer: 0,
          explain: t(
            "Mazmunni ko‘rish uchun TLS tugaydigan joyda (proxy, server) loglash kerak.",
            "To see the content, log where TLS ends (a proxy or the server).",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: ALERTS,
    title: t("Signal charchog‘i", "Alert fatigue"),
    minutes: 6,
    intro: t(
      "Kuniga million hodisa, ulardan 10 tasi haqiqiy hujum. IDS hujumlarning 99% ini ushlaydi va oddiy hodisalarning atigi 0,1% ida adashadi. Natija: ~10 ta haqiqiy signal va ~1000 ta yolg‘on. Tahlilchi har 100 signaldan bittasi haqiqiy ekanini ko‘radi — va oxir-oqibat signallarga qaramay qo‘yadi.",
      "A million events a day, 10 of them real attacks. The IDS catches 99% of attacks and is wrong on only 0.1% of ordinary events. The result: about 10 real alerts and about 1000 false ones. The analyst sees one real alert in a hundred — and in the end stops looking.",
    ),
    analogy: t(
      "“Bo‘ri keldi!” deb ko‘p qichqirgan cho‘pon: haqiqiy bo‘ri kelganda hech kim ishonmaydi.",
      "The boy who cried wolf: when the real wolf came, nobody listened.",
    ),
    theory: [
      t(
        "Yechim: qoidalarni muntazam sozlash, kontekst qo‘shish (aktivlar ro‘yxati, zaiflik bazasi) va ogohlantirishlarni korrelyatsiya qilish (SIEM).",
        "The fix: tune rules regularly, add context (an asset list, a vulnerability database) and correlate alerts (a SIEM).",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Kam hujum ko‘p hodisa ichida — kichik xato foizi ham ko‘p signal beradi.",
      "Few attacks among many events — even a small error rate makes many alerts.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Yuqoridagi misolda signallarning taxminan qanchasi haqiqiy?",
            "In the example above, roughly what share of alerts is real?",
          ),
          options: [code("≈ 1%"), code("≈ 50%"), code("≈ 99%")],
          answer: 0,
          explain: t(
            "≈ 10 haqiqiy / (10 + 1000) ≈ 1%.",
            "≈ 10 real / (10 + 1000) ≈ 1%.",
          ),
        },
        {
          ask: t(
            "Qaysi chora signal charchog‘ini eng ko‘p kamaytiradi?",
            "Which step cuts alert fatigue the most?",
          ),
          options: [
            t(
              "Shovqinli qoidalarni sozlash va kontekst qo‘shish",
              "Tuning noisy rules and adding context",
            ),
            t("Barcha qoidalarni yoqish", "Turning on every rule"),
            t("Signallarni e’tiborsiz qoldirish", "Ignoring alerts"),
          ],
          answer: 0,
          explain: t(
            "Kamroq, lekin ishonchliroq signal — tezroq javob.",
            "Fewer but more trustworthy alerts mean faster response.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: ALERTS,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni va butun Tarmoq xavfsizligi domenini takrorlaymiz: imzo va anomaliya, Suricata qoidasi, normallashtirish, chegaralar, saralash, IDS va IPS, signal charchog‘i.",
      "A review of the module and of the whole Network security domain: signatures and anomalies, Suricata rules, normalization, thresholds, triage, IDS and IPS, alert fatigue.",
    ),
    analogy: t(
      "Himoya — devor (firewall), qulf (shifrlash) va kamera (IDS): bittasi yetmaydi, uchalasi birga ishlaydi.",
      "Defence is a wall (firewall), a lock (encryption) and a camera (IDS): one is not enough, the three work together.",
    ),
    theory: [
      t(
        "Tabriklaymiz: Tarmoq xavfsizligi domeni tugadi. Keyingi qadam — raqamli kriminalistika (forensics).",
        "Congratulations: the Network security domain is done. Next up: digital forensics.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Qoida nimani qidirayotganini aniq o‘qing.",
      "Read exactly what the rule looks for.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            'content:"/etc/passwd" (normallashtirishsiz) qaysi so‘rovni o‘tkazib yuboradi?',
            'Which request slips past content:"/etc/passwd" without normalization?',
          ),
          options: [
            code("GET /f?file=..%2f..%2fetc%2fpasswd"),
            code("GET /f?file=../../etc/passwd"),
            code("GET /etc/passwd"),
          ],
          answer: 0,
          explain: t(
            "%2f — kodlangan “/”; http.uri buferi uni ochadi.",
            "%2f is an encoded “/”; the http.uri buffer decodes it.",
          ),
        },
        {
          ask: t(
            "Har 25 soniyada bitta parol taxmin qiladigan botni qaysi chegara ushlaydi?",
            "Which threshold catches a bot guessing one password every 25 seconds?",
          ),
          options: [
            code("count 5, seconds 300"),
            code("count 5, seconds 60"),
            code("count 5, seconds 10"),
          ],
          answer: 0,
          explain: t(
            "60 soniyada faqat 3 urinish; 300 soniyada 12.",
            "Only 3 attempts fit in 60 seconds; 12 in 300.",
          ),
        },
        {
          ask: t(
            "Yangi, hali hech kim ko‘rmagan hujumni qaysi usul ko‘rishi mumkin?",
            "Which approach can spot a new attack nobody has seen before?",
          ),
          options: [
            t("Anomaliya asosidagi aniqlash", "Anomaly-based detection"),
            t("Imzo asosidagi aniqlash", "Signature-based detection"),
            t("Hech biri", "Neither"),
          ],
          answer: 0,
          explain: t(
            "Imzo faqat ma’lum izni qidiradi.",
            "A signature looks only for a known trace.",
          ),
        },
        {
          ask: t(
            "IDS va IPS’ning asosiy farqi?",
            "The main difference between an IDS and an IPS?",
          ),
          options: [
            t(
              "IPS trafik yo‘lida turib, paketni to‘xtata oladi",
              "An IPS sits in the path and can stop packets",
            ),
            t("IDS tezroq", "An IDS is faster"),
            t("IPS faqat loglarni o‘qiydi", "An IPS only reads logs"),
          ],
          answer: 0,
          explain: t(
            "IDS kuzatadi va xabar beradi; IPS esa harakat qiladi.",
            "An IDS watches and reports; an IPS acts.",
          ),
        },
      ],
    },
  },
];

function code(s: string): Text {
  return { uz: s, en: s };
}
