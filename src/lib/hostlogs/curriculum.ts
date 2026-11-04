// Academy Intermediate · System security, module 3: Host logging and
// monitoring. The lessons use ./tools.ts: eight log events to triage.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "events" };

export const PROGRESS_KEY = "cybervalue:hostlogs:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const LOGS = t("Loglar", "Logs");
const WATCHING = t("Kuzatish", "Watching");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: LOGS,
    title: t("Nega host loglari", "Why host logs matter"),
    minutes: 5,
    intro: t(
      "Server o‘zida nima bo‘layotganini loglarga yozib boradi: kim kirdi, kim sudo ishlatdi, qaysi xizmat to‘xtadi, qaysi fayl o‘zgardi. Hodisa bo‘lganda “nima bo‘ldi, qachon va kim?” degan savollarga javob faqat loglarda bo‘ladi. Log yozilmagan bo‘lsa yoki hech kim ularga qaramasa, hujum haftalab sezilmay qolishi mumkin.",
      "A server writes down what happens on it in its logs: who signed in, who used sudo, which service stopped, which file changed. When an incident happens, the answers to “what happened, when, and who?” are only in the logs. If nothing is logged, or nobody looks, an attack can go unnoticed for weeks.",
    ),
    analogy: t(
      "Bino kirish jurnali: kim, qachon kirib-chiqqani yozib boriladi.",
      "A building’s visitor book: who came and went, and when.",
    ),
    theory: [
      t(
        "Ko‘p hodisalar haftalar o‘tib aniqlanadi — loglar shu vaqtgacha saqlanishi kerak.",
        "Many incidents are found weeks later — logs must be kept at least that long.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kim, nima, qachon.", "Who, what, when."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Host loglari nimaga javob beradi?",
            "What do host logs answer?",
          ),
          options: [
            t("Kim, nima va qachon qildi", "Who did what, and when"),
            t("Server qancha turadi", "What the server costs"),
            t("Sayt dizayni qanday", "What the site looks like"),
          ],
          answer: 0,
          explain: t(
            "Ular hodisani qayta tiklashga yordam beradi.",
            "They let you reconstruct an incident.",
          ),
        },
        {
          ask: t(
            "Loglar yozilsa-yu, hech kim qaramasa?",
            "Logs are written, but nobody looks at them?",
          ),
          options: [
            t(
              "Hujum uzoq vaqt sezilmay qolishi mumkin",
              "An attack can go unnoticed for a long time",
            ),
            t("Hech qanday muammo yo‘q", "No problem at all"),
            t("Server tezlashadi", "The server gets faster"),
          ],
          answer: 0,
          explain: t(
            "Yig‘ish va kuzatish — ikkalasi kerak.",
            "You need both collecting and watching.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: LOGS,
    title: t("Loglar qayerda", "Where logs live"),
    minutes: 6,
    intro: t(
      "Linux’da ko‘p xizmatlar journald’ga yozadi (`journalctl` bilan o‘qiladi); kirishlar va sudo `/var/log/auth.log` (Debian/Ubuntu) yoki `/var/log/secure` (RHEL) da; umumiy xabarlar `/var/log/syslog` da. auditd esa fayl va tizim chaqiruvlarini batafsil yozadi. Windows’da Event Viewer: Security jurnali kirishlarni (4624 — muvaffaqiyatli, 4625 — xato) yozadi.",
      "On Linux many services write to journald (read with `journalctl`); sign-ins and sudo go to `/var/log/auth.log` (Debian/Ubuntu) or `/var/log/secure` (RHEL); general messages to `/var/log/syslog`. auditd records file and system-call activity in detail. On Windows it is Event Viewer: the Security log records sign-ins (4624 for success, 4625 for failure).",
    ),
    analogy: t(
      "Kutubxonada har xil jurnal uchun alohida javon.",
      "A library with a separate shelf for each kind of record.",
    ),
    theory: [
      t(
        "`journalctl -u ssh --since today` — bugungi SSH xabarlari.",
        "`journalctl -u ssh --since today` shows today’s SSH messages.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("auth.log — kirishlar.", "auth.log is for sign-ins."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ubuntu’da SSH kirishlari qayerda?",
            "Where are SSH sign-ins on Ubuntu?",
          ),
          options: [
            t("/var/log/auth.log", "/var/log/auth.log"),
            t("/etc/hosts", "/etc/hosts"),
            t("/home/user/.bashrc", "/home/user/.bashrc"),
          ],
          answer: 0,
          explain: t(
            "RHEL oilasida — /var/log/secure.",
            "On the RHEL family it is /var/log/secure.",
          ),
        },
        {
          ask: t(
            "Windows’dagi 4625 hodisasi nima?",
            "What is Windows event 4625?",
          ),
          options: [
            t("Muvaffaqiyatsiz kirish", "A failed sign-in"),
            t("Muvaffaqiyatli kirish", "A successful sign-in"),
            t("Printer xatosi", "A printer error"),
          ],
          answer: 0,
          explain: t(
            "4624 — muvaffaqiyatli kirish.",
            "4624 is a successful sign-in.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: LOGS,
    title: t("Hodisalarni saralash", "Triaging events"),
    minutes: 8,
    intro: t(
      "Quyida kompaniya serveri loglaridan sakkizta yozuv. Ko‘pi oddiy ish: yangilanish, zaxira, log aylanishi. To‘rttasi esa tekshirishni talab qiladi. Har birini o‘qing: vaqti odatiymi, kim qildi, rejalashtirilganmi va natijasi qanday?",
      "Below are eight entries from a company server’s logs. Most are routine work: updates, backups, log rotation. Four need investigating. Read each one: is the time normal, who did it, was it planned, and what was the result?",
    ),
    analogy: t(
      "Shifokor tahlil natijalarini ko‘rib, me’yordan chetga chiqqanlarini belgilaydi.",
      "A doctor reading test results and circling the ones out of range.",
    ),
    theory: [
      t(
        "Odatiy holatni bilish (baseline) g‘alatisini ko‘rishning eng yaxshi yo‘li.",
        "Knowing what normal looks like (a baseline) is the best way to spot the odd.",
      ),
    ],
    task: t(
      "Tekshirish kerak bo‘lgan yozuvlarni belgilang.",
      "Tick the entries that need investigating.",
    ),
    hint: t(
      "Ko‘p xato urinishlar, kechasi yangi root, g‘alati yozish, o‘chirilgan hisob.",
      "Many failures, a new root at night, an odd write, a disabled account.",
    ),
    widget: { type: "events" },
  },
  {
    id: 4,
    group: WATCHING,
    title: t("Nimani yozish kerak", "What to log"),
    minutes: 5,
    intro: t(
      "Hamma narsani yozish — shovqin, hech narsa yozmaslik — ko‘rlik. Eng foydali yozuvlar: kirishlar (muvaffaqiyatli va xato), sudo va administrator buyruqlari, foydalanuvchi va guruh o‘zgarishlari, xizmatlarning ishga tushishi va to‘xtashi, muhim fayllardagi o‘zgarishlar. Parollar, tokenlar va karta raqamlari esa logga hech qachon yozilmaydi. Har bir yozuvni to‘g‘ri guruhga ajrating.",
      "Logging everything is noise; logging nothing is blindness. The most useful records are sign-ins (success and failure), sudo and admin commands, user and group changes, services starting and stopping, and changes to important files. Passwords, tokens and card numbers never go into a log. Sort each item into the right group.",
    ),
    analogy: t(
      "Kundalikka har nafasni emas, muhim voqealarni yozasiz.",
      "In a diary you write the events that matter, not every breath.",
    ),
    theory: [
      t(
        "Log hajmi uchun rotatsiya va saqlash muddatini oldindan belgilang.",
        "Set rotation and a retention period up front so logs don’t fill the disk.",
      ),
    ],
    task: t("Yozuvlarni ajrating.", "Sort the items."),
    hint: t(
      "Kirish, huquq va o‘zgarish — yoziladi; sirlar — yo‘q.",
      "Access, privilege and change get logged; secrets never do.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "log", label: t("Yozish kerak", "Log it") },
        { id: "never", label: t("Yozilmaydi", "Don’t log it") },
      ],
      items: [
        {
          label: t("Muvaffaqiyatsiz kirishlar", "Failed sign-ins"),
          bucket: "log",
        },
        { label: t("sudo buyruqlari", "sudo commands"), bucket: "log" },
        {
          label: t(
            "Yangi foydalanuvchi yaratilishi",
            "A new user being created",
          ),
          bucket: "log",
        },
        {
          label: t("Foydalanuvchi kiritgan parol", "The password a user typed"),
          bucket: "never",
        },
        {
          label: t("API tokenining o‘zi", "The API token itself"),
          bucket: "never",
        },
        {
          label: t("To‘liq karta raqami", "A full card number"),
          bucket: "never",
        },
      ],
    },
  },
  {
    id: 5,
    group: WATCHING,
    title: t("Markaziy loglar va vaqt", "Central logs and time"),
    minutes: 6,
    intro: t(
      "Hujumchi serverga kirsa, birinchi navbatda izlarini — mahalliy loglarni — o‘chirishga urinadi. Shuning uchun loglar darhol boshqa joyga (markaziy log serveri yoki SIEM) yuboriladi: rsyslog, journald forwarding yoki agent orqali. Bundan tashqari barcha serverlar bir xil vaqtni ko‘rsatishi kerak (NTP / chrony): aks holda turli mashinalardagi hodisalarni tartibga solib bo‘lmaydi.",
      "An attacker who gets onto a server will try to erase their tracks — the local logs — first. So logs are sent somewhere else straight away (a central log server or a SIEM) via rsyslog, journald forwarding or an agent. All servers must also agree on the time (NTP / chrony): otherwise events from different machines can’t be put in order.",
    ),
    analogy: t(
      "Kamera yozuvi do‘konning o‘zida emas, bulutda saqlanadi — o‘g‘ri uni o‘chira olmaydi.",
      "A camera that records to the cloud, not the shop — the burglar can’t wipe it.",
    ),
    theory: [
      t(
        "Markaziy log serveriga yozish huquqi bor, lekin o‘chirish huquqi bo‘lmasin.",
        "Servers may write to the central store, but not delete from it.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Boshqa joyga va bir xil vaqt.",
      "Somewhere else, and the same clock.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Nega loglarni markaziy joyga yuborish kerak?",
            "Why send logs to a central place?",
          ),
          options: [
            t(
              "Hujumchi mahalliy loglarni o‘chirishi mumkin",
              "An attacker may delete the local logs",
            ),
            t("Disk joyi tejash uchun xolos", "Only to save disk space"),
            t("Kerak emas", "There’s no need"),
          ],
          answer: 0,
          explain: t(
            "Markaziy nusxa saqlanib qoladi.",
            "The central copy survives.",
          ),
        },
        {
          ask: t(
            "Serverlar vaqti farq qilsa, nima bo‘ladi?",
            "What goes wrong if server clocks differ?",
          ),
          options: [
            t(
              "Hodisalarni to‘g‘ri tartiblab bo‘lmaydi",
              "Events can’t be put in the right order",
            ),
            t("Hech narsa", "Nothing"),
            t("Internet uziladi", "The internet drops"),
          ],
          answer: 0,
          explain: t(
            "NTP yoki chrony vaqtni moslashtiradi.",
            "NTP or chrony keeps the clocks in step.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: WATCHING,
    title: t("Ogohlantirishlar", "Alerts"),
    minutes: 6,
    intro: t(
      "Hech kim millionlab log qatorini o‘qimaydi — muhim hodisalar uchun ogohlantirish (alert) sozlanadi: yangi administrator hisobi, ko‘p xato kirishlar, o‘chirilgan hisob bilan kirish, xavfsizlik vositasining to‘xtashi. Juda ko‘p ogohlantirish ham xavfli: jamoa ularga e’tibor bermay qo‘yadi (alert fatigue). Har bir ogohlantirish aniq harakatga olib kelishi kerak.",
      "Nobody reads millions of log lines — alerts are set up for the events that matter: a new admin account, many failed sign-ins, a sign-in with a disabled account, a security tool stopping. Too many alerts are dangerous too: the team starts ignoring them (alert fatigue). Every alert should lead to a clear action.",
    ),
    analogy: t(
      "Tutun detektori har ovqat pishganda emas, haqiqiy tutunda chalinishi kerak.",
      "A smoke alarm should go off for real smoke, not every time you cook.",
    ),
    theory: [
      t(
        "Har bir ogohlantirish uchun “kim, qancha tez va nima qiladi” yozib qo‘yiladi.",
        "For each alert, write down who responds, how fast, and what they do.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kam, lekin muhim.", "Few, but important."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi hodisa darhol ogohlantirishga loyiq?",
            "Which event deserves an immediate alert?",
          ),
          options: [
            t("Kechasi yangi root hisobi", "A new root account at night"),
            t("Har kungi log aylanishi", "Daily log rotation"),
            t("Rejadagi zaxira", "A scheduled backup"),
          ],
          answer: 0,
          explain: t(
            "Huquqli hisob yaratilishi — jiddiy belgi.",
            "A privileged account appearing is a serious sign.",
          ),
        },
        {
          ask: t("Alert fatigue nima?", "What is alert fatigue?"),
          options: [
            t(
              "Ogohlantirishlar ko‘pligidan ularga e’tibor bermay qo‘yish",
              "Ignoring alerts because there are too many",
            ),
            t("Server qizib ketishi", "A server overheating"),
            t("Parolni unutish", "Forgetting a password"),
          ],
          answer: 0,
          explain: t(
            "Shovqinli qoidalarni sozlang yoki o‘chiring.",
            "Tune or remove noisy rules.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: WATCHING,
    title: t("Fayl yaxlitligi", "File integrity"),
    minutes: 5,
    intro: t(
      "Ba’zi fayllar deyarli hech qachon o‘zgarmaydi: /etc/passwd, /etc/shadow, /etc/sudoers, SSH sozlamalari, tizim dasturlari. Fayl yaxlitligi monitoringi (FIM — AIDE, auditd qoidalari, Wazuh) ularning xeshini saqlaydi va o‘zgarish bo‘lsa xabar beradi. Rejalashtirilgan o‘zgarish (yangilanish) va kutilmagan o‘zgarishni ajratish uchun o‘zgarishlar tartibi (change management) bilan solishtiriladi.",
      "Some files almost never change: /etc/passwd, /etc/shadow, /etc/sudoers, the SSH configuration, system binaries. File integrity monitoring (FIM — AIDE, auditd rules, Wazuh) stores their hashes and reports any change. To tell a planned change (an update) from an unexpected one, compare against change management.",
    ),
    analogy: t(
      "Muhrlangan konvert: muhr buzilsa, kimdir ochganini bilasiz.",
      "A sealed envelope: if the seal is broken, you know someone opened it.",
    ),
    theory: [
      t(
        "`auditctl -w /etc/passwd -p wa` — faylga yozish va atribut o‘zgarishini kuzatadi.",
        "`auditctl -w /etc/passwd -p wa` watches the file for writes and attribute changes.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kam o‘zgaradigan fayllar.", "Files that rarely change."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "FIM qaysi faylni kuzatishi kerak?",
            "Which file should FIM watch?",
          ),
          options: [
            t("/etc/sudoers", "/etc/sudoers"),
            t("/tmp dagi vaqtinchalik fayllar", "Temporary files in /tmp"),
            t("Brauzer keshi", "The browser cache"),
          ],
          answer: 0,
          explain: t(
            "U kim administrator bo‘lishini belgilaydi.",
            "It decides who gets admin rights.",
          ),
        },
        {
          ask: t(
            "Yangilanish paytida tizim fayli o‘zgardi. Bu hujummi?",
            "A system file changed during an update. Is it an attack?",
          ),
          options: [
            t(
              "O‘zgarishlar rejasi bilan solishtirib tekshiriladi",
              "Check it against the change plan",
            ),
            t("Albatta hujum", "Definitely an attack"),
            t("Hech qachon tekshirilmaydi", "Never check it"),
          ],
          answer: 0,
          explain: t(
            "Rejalashtirilgan o‘zgarish — normal.",
            "A planned change is normal.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: WATCHING,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Yaxshi host monitoringi: muhim hodisalarni yozish (sirlarsiz), loglarni darhol markaziy joyga yuborish, bir xil vaqt, kam lekin aniq ogohlantirishlar va muhim fayllar yaxlitligini kuzatish. Odatiy holatni bilsangiz, g‘alati narsa o‘zi ko‘zga tashlanadi.",
      "Good host monitoring means logging the events that matter (without secrets), sending logs to a central place straight away, keeping one clock, having few but precise alerts, and watching important files. Once you know what normal looks like, the odd stands out on its own.",
    ),
    analogy: t(
      "Qorovul: kameralar, jurnal va signalizatsiya birga ishlaydi.",
      "A guard: cameras, a visitor book and an alarm working together.",
    ),
    theory: [
      t(
        "Har chorakda ogohlantirish qoidalarini qayta ko‘rib chiqing.",
        "Review the alert rules every quarter.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Yozish, yuborish, vaqt, ogohlantirish, yaxlitlik.",
      "Log, ship, time, alert, integrity.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Loglarga nima yozilmasligi kerak?",
            "What must never go into a log?",
          ),
          options: [
            t("Parollar va tokenlar", "Passwords and tokens"),
            t("Kirish vaqti", "The sign-in time"),
            t("Foydalanuvchi nomi", "The user name"),
          ],
          answer: 0,
          explain: t(
            "Loglar ko‘p joyga tarqaladi.",
            "Logs travel to many places.",
          ),
        },
        {
          ask: t(
            "O‘chirilgan hisob bilan muvaffaqiyatli kirish — bu?",
            "A successful sign-in with a disabled account is?",
          ),
          options: [
            t("Darhol tekshirish kerak", "Something to investigate at once"),
            t("Odatiy hol", "Routine"),
            t("Log xatosi, e’tiborsiz", "A log glitch to ignore"),
          ],
          answer: 0,
          explain: t(
            "Hisob to‘liq bloklanmagan yoki kalit qolgan.",
            "The account wasn’t fully locked, or a key was left behind.",
          ),
        },
      ],
    },
  },
];
