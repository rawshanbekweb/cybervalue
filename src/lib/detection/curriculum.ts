// Academy Intermediate · Blue team, module 2: Detection rules. The lessons
// use ./tools.ts: a Sigma rule for encoded PowerShell, built from selection
// items and a filter and tested against eight process-creation events.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "rule" };

export const PROGRESS_KEY = "cybervalue:detection:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string): Text => ({ uz: s, en: s });

const RULES = t("Qoidalar", "Rules");
const TUNE = t("Sozlash", "Tuning");
const KEEP = t("Yuritish", "Upkeep");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: RULES,
    title: t("Uch xil aniqlash", "Three kinds of detection"),
    minutes: 6,
    intro: t(
      "Aniqlash qoidasi — loglar ichidan xavfli holatni topadigan so‘rov. Uch yondashuv bor: indikator (IOC) — ma’lum yomon xesh, IP yoki domen; xatti-harakat — hujumchi nima qilishi (masalan, Word PowerShell ishga tushirdi); anomaliya — odatdagidan farq (tunda 50 GB yuklash).",
      "A detection rule is a search that finds a dangerous situation in the logs. There are three approaches: an indicator (IOC) — a known-bad hash, IP or domain; behaviour — what an attacker does (Word starting PowerShell, say); anomaly — a break from the usual (50 GB uploaded at night).",
    ),
    analogy: t(
      "Qo‘riqchi: qidiruvdagi odam surati (indikator), devorga tirmashayotgan odam (xatti-harakat), yakshanba kuni yonib turgan chiroq (anomaliya).",
      "A guard watches for a wanted poster’s face (indicator), someone climbing the fence (behaviour) and an office light on at 3 a.m. on a Sunday (anomaly).",
    ),
    theory: [
      t(
        "Indikatorlar tez eskiradi; xatti-harakat qoidalari uzoq ishlaydi; anomaliyalar ko‘p shovqin beradi, lekin yangi narsani ham ko‘radi.",
        "Indicators go stale fast; behaviour rules last; anomalies are noisy but can catch something new.",
      ),
    ],
    task: t("Har bir qoida qaysi turga kiradi?", "Which kind is each rule?"),
    hint: t(
      "Aniq qiymat — indikator; harakatlar zanjiri — xatti-harakat; “odatdagidan ko‘p” — anomaliya.",
      "An exact value is an indicator; a chain of actions is behaviour; “more than usual” is an anomaly.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "ioc", label: t("Indikator", "Indicator") },
        { id: "behaviour", label: t("Xatti-harakat", "Behaviour") },
        { id: "anomaly", label: t("Anomaliya", "Anomaly") },
      ],
      items: [
        {
          label: t(
            "Fayl xeshi ma’lum zararli dastur xeshiga teng",
            "A file’s hash equals a known malware hash",
          ),
          bucket: "ioc",
        },
        {
          label: t(
            "Ulanish ro‘yxatdagi C2 IP manziliga",
            "A connection to a listed C2 IP address",
          ),
          bucket: "ioc",
        },
        {
          label: t(
            "Word yoki Excel PowerShell’ni ishga tushirdi",
            "Word or Excel started PowerShell",
          ),
          bucket: "behaviour",
        },
        {
          label: t(
            "Kimdir xavfsizlik logini tozaladi (EventID 1102)",
            "Someone cleared the security log (EventID 1102)",
          ),
          bucket: "behaviour",
        },
        {
          label: t(
            "Hisob odatdagidan 20 baravar ko‘p fayl o‘qidi",
            "An account read 20 times more files than usual",
          ),
          bucket: "anomaly",
        },
        {
          label: t(
            "Hech qachon tunda ishlamagan xodim soat 3 da kirdi",
            "A worker who never works nights logged in at 3 a.m.",
          ),
          bucket: "anomaly",
        },
      ],
    },
  },
  {
    id: 2,
    group: RULES,
    title: t("Sigma qoidasi tuzilishi", "Anatomy of a Sigma rule"),
    minutes: 6,
    intro: t(
      "Sigma — aniqlash qoidalari uchun ochiq YAML formati. Bitta Sigma qoidasini Splunk, Elastic yoki Sentinel so‘roviga aylantirish mumkin — qoida SIEM’ga bog‘lanib qolmaydi. Quyidagi qoida yangi lokal administrator qo‘shilishini topadi.",
      "Sigma is an open YAML format for detection rules. One Sigma rule can be converted into a Splunk, Elastic or Sentinel search, so the rule isn’t tied to one SIEM. The rule below catches someone being added to the local Administrators group.",
    ),
    analogy: t(
      "Retsept: masalliqlar ro‘yxati (selection), nimani qo‘shmaslik (filter) va pishirish tartibi (condition) — har qanday oshxonada tayyorlasa bo‘ladi.",
      "A recipe: the ingredients (selection), what to leave out (filter) and the method (condition) — it works in any kitchen.",
    ),
    theory: [
      t(
        "sigma-cli kabi vositalar qoidani tanlangan SIEM tiliga o‘giradi.",
        "Tools such as sigma-cli convert a rule into the chosen SIEM’s language.",
      ),
    ],
    task: t(
      "Qoidaning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the rule and read what it is.",
    ),
    hint: t("Hammasi bo‘lib beshta qism.", "Five parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [{ text: "title: Member added to local Administrators", id: "title" }],
        [{ text: "logsource:", id: "logsource" }],
        [{ text: "  product: windows" }],
        [{ text: "  service: security" }],
        [{ text: "detection:" }],
        [{ text: "  selection:", id: "selection" }],
        [{ text: "    EventID: 4732" }],
        [{ text: "    TargetUserName: 'Administrators'" }],
        [{ text: "  condition: selection", id: "condition" }],
        [{ text: "level: high", id: "level" }],
      ],
      parts: [
        {
          id: "title",
          title: t("title — nomi", "title — the name"),
          body: t(
            "Ogohlantirish chiqqanda tahlilchi birinchi ko‘radigan matn — aniq va qisqa bo‘lsin.",
            "The first thing an analyst sees when the alert fires — keep it short and clear.",
          ),
        },
        {
          id: "logsource",
          title: t("logsource — qaysi loglar", "logsource — which logs"),
          body: t(
            "Qoida qaysi manbaga qo‘llanadi: Windows Security logi.",
            "The source the rule applies to: the Windows Security log.",
          ),
        },
        {
          id: "selection",
          title: t("selection — nima qidiriladi", "selection — what to find"),
          body: t(
            "Bir bo‘limdagi maydonlar VA bilan birlashadi: EventID 4732 va guruh Administrators.",
            "Fields in one block are joined with AND: EventID 4732 and the Administrators group.",
          ),
        },
        {
          id: "condition",
          title: t("condition — mantiq", "condition — the logic"),
          body: t(
            "Bo‘limlarni birlashtiradi: “selection and not filter” kabi.",
            "Combines the blocks, as in “selection and not filter”.",
          ),
        },
        {
          id: "level",
          title: t("level — jiddiylik", "level — severity"),
          body: t(
            "informational, low, medium, high yoki critical — navbatda qaysi biri oldin ko‘rilishini belgilaydi.",
            "informational, low, medium, high or critical — it decides what gets looked at first.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: RULES,
    title: t("Qoidani yig‘ish", "Building the rule"),
    minutes: 12,
    intro: t(
      "Fishing xati ochilgach, hujumchi ko‘pincha kodlangan (Base64) PowerShell buyrug‘ini ishga tushiradi: powershell -enc …. Lekin IT bo‘limining avtomatlashtirish hisobi ham xuddi shunday buyruqlardan foydalanadi. Qoida yomonini ushlashi va oddiy ishni tinch qo‘yishi kerak.",
      "Once a phishing email is opened, the attacker often runs an encoded (Base64) PowerShell command: powershell -enc …. But IT’s automation account runs commands just like it. The rule must catch the bad ones and leave normal work alone.",
    ),
    analogy: t(
      "Baliq to‘ri: ko‘zlari juda katta bo‘lsa baliq chiqib ketadi, juda mayda bo‘lsa — hamma axlat ham ilinadi.",
      "A fishing net: holes too big and the fish swim through, too small and you haul up all the rubbish too.",
    ),
    theory: [
      t(
        "Har bir yangi shart qoidani toraytiradi; filter esa ma’lum oddiy holatni chiqarib tashlaydi. Ikkalasi ham ortiqcha bo‘lsa — hujum o‘tib ketadi.",
        "Each extra condition narrows the rule; a filter removes a known normal case. Overdo either and the attack slips through.",
      ),
    ],
    task: t(
      "Uchala hujumni ushlaydigan va bitta ham yolg‘on ogohlantirish bermaydigan qoida tuzing.",
      "Build a rule that catches all three attacks and raises no false alarms.",
    ),
    hint: t(
      "Hujumlardan ikkitasi Word’dan emas. python.exe ham “-enc” ni o‘z ichiga oladi.",
      "Two of the attacks don’t come from Word. python.exe’s line contains “-enc” too.",
    ),
    widget: { type: "rule" },
  },
  {
    id: 4,
    group: TUNE,
    title: t("Chegara va vaqt oynasi", "Thresholds and time windows"),
    minutes: 6,
    intro: t(
      "Ba’zi qoidalar bitta hodisaga emas, songa qaraydi: “5 daqiqada bitta manzildan 20 tadan ortiq muvaffaqiyatsiz kirish”. Chegara past bo‘lsa — parolni xato yozgan har bir xodim ogohlantirish beradi; yuqori bo‘lsa — sekin hujum sezilmaydi.",
      "Some rules look at a count, not a single event: “more than 20 failed logins from one address in 5 minutes”. Set the threshold too low and every worker who mistypes a password raises an alert; too high and a slow attack goes unseen.",
    ),
    analogy: t(
      "Tutun detektori: juda sezgir bo‘lsa, har safar non qizartirganda chinqiradi.",
      "A smoke alarm that is too sensitive goes off every time you make toast.",
    ),
    theory: [
      t(
        "Chegarani taxminan emas, o‘z loglaringizdagi odatiy qiymatlarga qarab tanlang.",
        "Pick a threshold from the normal values in your own logs, not by guessing.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Sekin hujum har oynada kam iz qoldiradi.",
      "A slow attack leaves little in each window.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Hujumchi har 10 daqiqada bitta parol sinaydi. “5 daqiqada > 20” qoidasi?",
            "An attacker tries one password every 10 minutes. The “> 20 in 5 minutes” rule?",
          ),
          options: [
            t(
              "Ko‘rmaydi — kun bo‘yi kattaroq oyna bilan alohida qoida kerak",
              "Misses it — a separate rule over a longer window is needed",
            ),
            t("Darhol ushlaydi", "Catches it at once"),
            t("Hujum emas", "It isn’t an attack"),
          ],
          answer: 0,
          explain: t(
            "Past va sekin hujumlar uzun oynada ko‘rinadi.",
            "Low-and-slow attacks show up over long windows.",
          ),
        },
        {
          ask: t(
            "Chegara 3 ga tushirildi va kuniga 400 ta ogohlantirish chiqdi. Natija?",
            "The threshold was dropped to 3 and 400 alerts a day appeared. The result?",
          ),
          options: [
            t(
              "Tahlilchilar charchaydi va haqiqiy hujumni o‘tkazib yuboradi",
              "Analysts burn out and miss the real attack",
            ),
            t("Xavfsizlik oshdi", "Security went up"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Bu “alert fatigue” — ogohlantirishdan charchash.",
            "That is alert fatigue.",
          ),
        },
        {
          ask: t(
            "Chegarani qanday tanlash kerak?",
            "How should a threshold be chosen?",
          ),
          options: [
            t(
              "O‘z loglaringizdagi odatiy qiymatlardan biroz yuqori",
              "A little above the normal values in your own logs",
            ),
            t("Har doim 10", "Always 10"),
            t("Internetdagi birinchi raqam", "The first number found online"),
          ],
          answer: 0,
          explain: t(
            "Har bir tarmoqning “normal”i boshqa.",
            "Every network’s “normal” is different.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: TUNE,
    title: t("Yolg‘on va o‘tkazib yuborilgan", "False alarms and misses"),
    minutes: 6,
    intro: t(
      "Har bir natija to‘rt xildan biri: haqiqiy ogohlantirish (true positive), yolg‘on ogohlantirish (false positive), o‘tkazib yuborilgan hujum (false negative) va to‘g‘ri jimlik (true negative). Yolg‘on ogohlantirish vaqtni oladi; o‘tkazib yuborilgan hujum — ancha qimmatroq.",
      "Every result is one of four: a real alert (true positive), a false alarm (false positive), a missed attack (false negative) and correct silence (true negative). A false alarm costs time; a missed attack costs far more.",
    ),
    analogy: t(
      "Tibbiy test: sog‘ odamga “kasal” deyish — yolg‘on ijobiy; kasalga “sog‘” deyish — yolg‘on salbiy.",
      "A medical test: telling a healthy person they are ill is a false positive; telling an ill person they are fine is a false negative.",
    ),
    theory: [
      t(
        "Yolg‘on ogohlantirishni tuzatish: filter qo‘shish, shartni aniqlashtirish. O‘tkazib yuborishni tuzatish: shartni kengaytirish yoki yangi manba.",
        "Fix false alarms with a filter or a sharper condition. Fix misses by widening the condition or adding a source.",
      ),
    ],
    task: t(
      "Har bir holat yolg‘on ogohlantirishmi yoki o‘tkazib yuborilgan hujummi?",
      "Is each case a false alarm or a missed attack?",
    ),
    hint: t(
      "Ogohlantirish bor-u, hujum yo‘q — yolg‘on. Hujum bor-u, ogohlantirish yo‘q — o‘tkazib yuborilgan.",
      "An alert with no attack is false. An attack with no alert is a miss.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "fp", label: t("Yolg‘on ogohlantirish", "False positive") },
        { id: "fn", label: t("O‘tkazib yuborilgan", "False negative") },
      ],
      items: [
        {
          label: t(
            "Zaxira skripti har kecha “ko‘p fayl o‘qildi” ogohlantirishini beradi",
            "The backup script triggers “many files read” every night",
          ),
          bucket: "fp",
        },
        {
          label: t(
            "Administrator ta’mirlash vaqtida PowerShell ochdi va ogohlantirish chiqdi",
            "An admin opened PowerShell during maintenance and an alert fired",
          ),
          bucket: "fp",
        },
        {
          label: t(
            "Hujumchi powershell o‘rniga pwsh.exe ishlatdi va qoida jim qoldi",
            "The attacker used pwsh.exe instead of powershell and the rule stayed silent",
          ),
          bucket: "fn",
        },
        {
          label: t(
            "Serverning loglari SIEM’ga kelmaydi, u yerdagi buzilish ko‘rinmadi",
            "A server’s logs never reach the SIEM, so a break-in there went unseen",
          ),
          bucket: "fn",
        },
      ],
    },
  },
  {
    id: 6,
    group: TUNE,
    title: t("Og‘riq piramidasi", "The pyramid of pain"),
    minutes: 6,
    intro: t(
      "Og‘riq piramidasi (David Bianco) hujumchi uchun nimani o‘zgartirish qanchalik qiyinligini ko‘rsatadi. Pastda — xesh, IP, domen: bir daqiqada almashtiriladi. Tepada — vositalar va TTP (taktika, texnika, protsedura): ularni o‘zgartirish hujumchini qayta o‘rganishga majbur qiladi.",
      "The pyramid of pain (David Bianco) shows how hard each thing is for an attacker to change. At the bottom — hashes, IPs, domains: swapped in a minute. At the top — tools and TTPs (tactics, techniques, procedures): changing those forces the attacker to relearn.",
    ),
    analogy: t(
      "O‘g‘rining mashina raqamini bilish — u raqamni almashtiradi. Uning qanday qulf ochishini bilish — butun usulini o‘zgartirishi kerak.",
      "Knowing a burglar’s number plate, they just swap plates. Knowing how they pick locks, they have to change their whole method.",
    ),
    theory: [
      t(
        "Shuning uchun xatti-harakat qoidalari indikator ro‘yxatlaridan qimmatliroq.",
        "That is why behaviour rules are worth more than lists of indicators.",
      ),
    ],
    task: t(
      "Hujumchi uchun har birini almashtirish osonmi yoki qiyinmi?",
      "Is each one easy or hard for an attacker to change?",
    ),
    hint: t(
      "Qiymatlar oson; usullar qiyin.",
      "Values are easy; methods are hard.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "easy", label: t("Oson", "Easy") },
        { id: "hard", label: t("Qiyin", "Hard") },
      ],
      items: [
        {
          label: t("Zararli faylning xeshi", "A malware file’s hash"),
          bucket: "easy",
        },
        {
          label: t("C2 serverining IP manzili", "The C2 server’s IP address"),
          bucket: "easy",
        },
        { label: t("Fishing domeni", "A phishing domain"), bucket: "easy" },
        {
          label: t(
            "Office hujjatidan skript ishga tushirish usuli",
            "Running a script from an Office document",
          ),
          bucket: "hard",
        },
        {
          label: t(
            "Xotiradan parollarni o‘g‘irlash texnikasi",
            "The technique of stealing passwords from memory",
          ),
          bucket: "hard",
        },
      ],
    },
  },
  {
    id: 7,
    group: KEEP,
    title: t("Qoidalarni sinash va yuritish", "Testing and keeping rules"),
    minutes: 6,
    intro: t(
      "Qoida yozildi — ish endi boshlandi. U sinaladi (Atomic Red Team kabi vositalar hujum texnikasini xavfsiz takrorlaydi), git’da saqlanadi, nima uchun yozilgani va nima qilish kerakligi hujjatlanadi, va vaqti-vaqti bilan yolg‘on ogohlantirishlar soni ko‘rib chiqiladi.",
      "Writing the rule is where the work starts. It gets tested (tools such as Atomic Red Team safely replay attack techniques), kept in git, documented with why it exists and what to do when it fires, and its false-alarm rate is reviewed from time to time.",
    ),
    analogy: t(
      "Yong‘in signalizatsiyasi har yili tekshiriladi — o‘rnatilgani yetarli emas.",
      "A fire alarm gets tested every year — installing it isn’t enough.",
    ),
    theory: [
      t(
        "Bu yondashuv “detection as code” deyiladi: qoidalar dastur kodi kabi ko‘rib chiqiladi va sinaladi.",
        "This approach is called detection as code: rules are reviewed and tested like program code.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Sinalmagan qoida — umid, nazorat emas.",
      "An untested rule is a hope, not a control.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Yangi qoida ishlashini qanday bilasiz?",
            "How do you know a new rule works?",
          ),
          options: [
            t(
              "Texnikani sinov muhitida takrorlab, ogohlantirish chiqqanini ko‘rasiz",
              "Replay the technique in a test lab and see the alert fire",
            ),
            t("Haqiqiy hujumni kutasiz", "Wait for a real attack"),
            t("Sintaksis to‘g‘ri bo‘lsa yetarli", "Correct syntax is enough"),
          ],
          answer: 0,
          explain: t(
            "Atomic Red Team aynan shu uchun.",
            "That is what Atomic Red Team is for.",
          ),
        },
        {
          ask: t(
            "Qoida bilan birga nima yoziladi?",
            "What gets written down with a rule?",
          ),
          options: [
            t(
              "Nima uchun bor, ma’lum yolg‘on holatlar va ogohlantirishda nima qilish kerak",
              "Why it exists, known false positives and what to do when it fires",
            ),
            t("Hech narsa", "Nothing"),
            t("Muallifning paroli", "The author’s password"),
          ],
          answer: 0,
          explain: t(
            "Tunda ogohlantirishni ochgan tahlilchi muallifdan so‘ray olmaydi.",
            "The analyst opening the alert at night can’t ask the author.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: KEEP,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: aniqlash turlari, Sigma, qoida yig‘ish, chegaralar, yolg‘on va o‘tkazib yuborilgan natijalar, og‘riq piramidasi va qoidalarni yuritish.",
      "A review of the module: kinds of detection, Sigma, building a rule, thresholds, false alarms and misses, the pyramid of pain and keeping rules healthy.",
    ),
    analogy: t(
      "Yaxshi qoida — yaxshi qo‘riqchi: kerakli odamni to‘xtatadi, qolganlarni o‘tkazadi.",
      "A good rule is a good guard: it stops the right person and lets everyone else through.",
    ),
    theory: [
      t(
        "Keyingi modulda chiqqan ogohlantirishlarni saralaymiz.",
        "In the next module we triage the alerts these rules raise.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "selection — VA; filter — istisno.",
      "selection means AND; filter means the exception.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Sigma’ning asosiy foydasi?", "Sigma’s main benefit?"),
          options: [
            t(
              "Bitta qoida turli SIEM’larga o‘giriladi",
              "One rule converts to many SIEMs",
            ),
            t("Loglarni shifrlaydi", "It encrypts logs"),
            t("Hujumni o‘zi to‘xtatadi", "It blocks attacks itself"),
          ],
          answer: 0,
          explain: t(
            "Qoida bitta vositaga bog‘lanmaydi.",
            "The rule isn’t tied to one tool.",
          ),
        },
        {
          ask: t(
            "“selection and not filter” nimani bildiradi?",
            "What does “selection and not filter” mean?",
          ),
          options: [
            t(
              "Tanlovga mos, lekin ma’lum istisno bo‘lmagan hodisalar",
              "Events that match the selection but aren’t the known exception",
            ),
            t("Barcha hodisalar", "Every event"),
            t("Faqat filterdagilar", "Only the filtered ones"),
          ],
          answer: 0,
          explain: t(
            "Filter yolg‘on ogohlantirishlarni olib tashlaydi.",
            "The filter removes the false alarms.",
          ),
        },
        {
          ask: t(
            "Og‘riq piramidasining tepasida nima?",
            "What sits at the top of the pyramid of pain?",
          ),
          options: [
            code("TTPs"),
            t("Xesh qiymatlar", "Hash values"),
            t("IP manzillar", "IP addresses"),
          ],
          answer: 0,
          explain: t(
            "Usulni o‘zgartirish eng qiyin.",
            "Methods are the hardest to change.",
          ),
        },
        {
          ask: t(
            "Hujum bo‘ldi, lekin qoida jim qoldi. Bu?",
            "An attack happened and the rule stayed silent. That is?",
          ),
          options: [
            t("False negative", "A false negative"),
            t("False positive", "A false positive"),
            t("True negative", "A true negative"),
          ],
          answer: 0,
          explain: t(
            "O‘tkazib yuborilgan hujum — eng qimmat xato.",
            "A missed attack is the costliest mistake.",
          ),
        },
      ],
    },
  },
];
