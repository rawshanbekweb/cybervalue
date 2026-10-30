// Academy Intermediate · AppSec, module 4: Automated security testing. The
// lessons use ./tools.ts: SAST findings to triage, and problems to match to
// the pipeline check that catches them.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "triage" } | { type: "pipeline" };

export const PROGRESS_KEY = "cybervalue:autotest:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const TOOLS = t("Vositalar", "The tools");
const PIPELINE = t("Pipeline", "The pipeline");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: TOOLS,
    title: t("Nega avtomatlashtirish kerak", "Why automate"),
    minutes: 5,
    intro: t(
      "Odam har bir commit’ni bir xil diqqat bilan tekshira olmaydi, mashina esa charchamaydi. DevSecOps g‘oyasi: xavfsizlik tekshiruvlari har bir pull request’da avtomatik ishlaydi va muammoni u hali bitta qatorlik o‘zgarish ekanida topadi. Xato qanchalik erta topilsa, shunchalik arzon tuzatiladi — ishlab chiqarishda topilgan zaiflik tahrirda topilganidan o‘nlab marta qimmat.",
      "People can’t review every commit with the same care; machines don’t get tired. The DevSecOps idea: security checks run automatically on every pull request and catch a problem while it is still a one-line change. The earlier a flaw is found, the cheaper the fix — one found in production costs many times more than one found in the editor.",
    ),
    analogy: t(
      "Zavoddagi har bir detalni o‘lchaydigan avtomatik sensor: inspektor faqat sensor shubha qilganini ko‘radi.",
      "An automatic sensor measuring every part on a production line: the inspector looks only at what it flags.",
    ),
    theory: [
      t(
        "“Shift left” — tekshiruvni jarayonning boshiga, kod yozilayotgan joyga suring.",
        "“Shift left” — move checks to the start of the process, where code is written.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Erta — arzon.", "Early is cheap."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Xavfsizlik tekshiruvi qachon eng foydali?",
            "When is a security check most useful?",
          ),
          options: [
            t("Har bir pull request’da", "On every pull request"),
            t("Yiliga bir marta", "Once a year"),
            t("Faqat hujumdan keyin", "Only after an attack"),
          ],
          answer: 0,
          explain: t(
            "O‘zgarish kichik, muallif hali kontekstni eslaydi.",
            "The change is small and the author still remembers it.",
          ),
        },
        {
          ask: t(
            "Avtomatik vositalar odamni to‘liq almashtiradimi?",
            "Do automated tools replace people completely?",
          ),
          options: [
            t(
              "Yo‘q: mantiq va dizayn xatolarini odam topadi",
              "No: people find logic and design flaws",
            ),
            t("Ha, butunlay", "Yes, completely"),
            t("Faqat kichik loyihalarda", "Only in small projects"),
          ],
          answer: 0,
          explain: t(
            "Masalan, “boshqa foydalanuvchining buyurtmasini ko‘rish” odatda vositaga ko‘rinmaydi.",
            "“Seeing another user’s order”, for example, is usually invisible to tools.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: TOOLS,
    title: t("SAST: kodni o‘qish", "SAST: reading the code"),
    minutes: 7,
    intro: t(
      "SAST (Static Application Security Testing) — Semgrep, CodeQL, SonarQube kabi vositalar kodni ishga tushirmasdan o‘qiydi va xavfli naqshlarni qidiradi: foydalanuvchi kiritmasi (source) tekshiruvsiz xavfli joyga (sink) — SQL so‘rovi, HTML, `eval`, shell buyrug‘iga — yetib borsa, ogohlantiradi. U tez va har bir qatorni ko‘radi, lekin dastur ishlaganda nima bo‘lishini bilmaydi va ba’zan yolg‘on signal beradi.",
      "SAST (Static Application Security Testing) — tools such as Semgrep, CodeQL and SonarQube — reads code without running it and looks for dangerous patterns: when user input (a source) reaches a dangerous place (a sink) — a SQL query, HTML, `eval`, a shell command — without a check, it warns. It is fast and sees every line, but it doesn’t know what happens at run time and sometimes raises false alarms.",
    ),
    analogy: t(
      "Grammatika tekshiruvchisi: matnni o‘qib xatoni ko‘rsatadi, lekin ma’noni har doim ham tushunmaydi.",
      "A grammar checker: it reads the text and flags mistakes, but doesn’t always get the meaning.",
    ),
    theory: [
      t(
        "Source → sink: ma’lumot qayerdan kelib, qayerga borishini kuzatish (taint analysis).",
        "Source → sink: following where data comes from and where it goes (taint analysis).",
      ),
    ],
    task: t("SAST buni topa oladimi?", "Can SAST find this?"),
    hint: t("Kodning o‘zida ko‘rinadimi?", "Is it visible in the code itself?"),
    widget: {
      type: "sort",
      buckets: [
        { id: "yes", label: t("SAST topadi", "SAST finds it") },
        { id: "no", label: t("SAST ko‘rmaydi", "SAST misses it") },
      ],
      items: [
        {
          label: t(
            "SQL so‘roviga qo‘shilgan req.params",
            "req.params joined into a SQL query",
          ),
          bucket: "yes",
        },
        {
          label: t(
            "Foydalanuvchi matni bilan chaqirilgan eval()",
            "eval() called with user text",
          ),
          bucket: "yes",
        },
        {
          label: t(
            "Serverdagi noto‘g‘ri TLS sozlamasi",
            "A wrong TLS setting on the server",
          ),
          bucket: "no",
        },
        {
          label: t(
            "Narxni brauzerdan qabul qiladigan biznes mantiq",
            "Business logic that accepts the price from the browser",
          ),
          bucket: "no",
        },
        {
          label: t(
            "innerHTML’ga yozilgan URL parametri",
            "A URL parameter written into innerHTML",
          ),
          bucket: "yes",
        },
      ],
    },
  },
  {
    id: 3,
    group: TOOLS,
    title: t("Topilmalarni saralash", "Triaging findings"),
    minutes: 10,
    intro: t(
      "SAST hisobotini ochib, hammasini tuzatishga shoshmang va hammasini e’tiborsiz ham qoldirmang. Har bir topilma uchun so‘raladi: ma’lumot haqiqatan foydalanuvchidan keladimi? U xavfli joyga yetib boradimi? Bu ishlab chiqarish kodimi yoki test? Yolg‘on signal — qoidaga izoh bilan istisno qo‘shiladi, haqiqiysi — tuzatiladi. Juda ko‘p yolg‘on signal bo‘lsa, jamoa ogohlantirishlarni o‘qimay qo‘yadi.",
      "When a SAST report opens, don’t rush to fix everything, and don’t ignore it all either. For each finding ask: does the data really come from a user? Does it reach the dangerous place? Is this production code or a test? A false alarm gets a documented exception; a real one gets fixed. Too many false alarms and the team stops reading the warnings.",
    ),
    analogy: t(
      "Tutun detektori: kuygan non uchun ham chalinadi, lekin har safar tekshirasiz.",
      "A smoke alarm goes off for burnt toast too, but you check every time.",
    ),
    theory: [
      t(
        "Istisno sababi bilan yoziladi, masalan `// nosemgrep: test fixture`.",
        "An exception is written with its reason, e.g. `// nosemgrep: test fixture`.",
      ),
    ],
    task: t(
      "Har bir topilma haqiqiy muammomi yoki yolg‘on signalmi?",
      "Is each finding a real problem or a false alarm?",
    ),
    hint: t(
      "Foydalanuvchi bu qiymatga tega oladimi?",
      "Can a user touch this value?",
    ),
    widget: { type: "triage" },
  },
  {
    id: 4,
    group: TOOLS,
    title: t("Kutubxonalar va sirlar", "Dependencies and secrets"),
    minutes: 6,
    intro: t(
      "SAST sizning kodingizni o‘qiydi, lekin ikki katta xavfni ko‘rmaydi. SCA (oldingi modul: `npm audit`, Dependabot) lockfile’ni ma’lum zaifliklar bazasi bilan solishtiradi. Sirlarni qidirish (gitleaks, GitHub secret scanning, trufflehog) commit’larda API kalitlari, tokenlar va parollarni naqshlari bo‘yicha qidiradi — eng yaxshisi pre-commit hook’da, kalit repozitoriyga tushmasidan oldin.",
      "SAST reads your code but misses two big risks. SCA (the last module: `npm audit`, Dependabot) checks the lockfile against databases of known flaws. Secret scanning (gitleaks, GitHub secret scanning, trufflehog) searches commits for API keys, tokens and passwords by their patterns — best in a pre-commit hook, before the key ever reaches the repository.",
    ),
    analogy: t(
      "Uyni tekshirish: devorlar (kod), sotib olingan mebel (kutubxonalar) va eshik ostida qolgan kalit (sirlar).",
      "Checking a house: the walls (code), the furniture you bought (dependencies) and the key left under the mat (secrets).",
    ),
    theory: [
      t(
        "Topilgan kalit — o‘chirish emas, almashtirish (rotate) kerak.",
        "A found key needs rotating, not just deleting.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Har bir vosita — o‘z xavfi uchun.", "Each tool has its own risk."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Sirlarni qidirish eng yaxshi qayerda ishlaydi?",
            "Where does secret scanning work best?",
          ),
          options: [
            t(
              "Pre-commit hook’da, commit’dan oldin",
              "In a pre-commit hook, before the commit",
            ),
            t("Faqat har chorakda", "Only every quarter"),
            t(
              "Faqat ishlab chiqarish serverida",
              "Only on the production server",
            ),
          ],
          answer: 0,
          explain: t(
            "Git tarixiga tushgan kalitni u yerdan olib bo‘lmaydi.",
            "Once a key is in Git history it can’t really be taken back.",
          ),
        },
        {
          ask: t(
            "Eski kutubxonadagi ma’lum zaiflikni qaysi vosita topadi?",
            "Which tool finds a known flaw in an old library?",
          ),
          options: [
            t("SCA", "SCA"),
            t("SAST", "SAST"),
            t("Linter", "A linter"),
          ],
          answer: 0,
          explain: t(
            "SCA versiyalarni zaifliklar bazasi bilan solishtiradi.",
            "SCA matches versions against the flaw databases.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: TOOLS,
    title: t(
      "DAST: ishlayotgan saytni sinash",
      "DAST: probing the running site",
    ),
    minutes: 7,
    intro: t(
      "DAST (Dynamic Application Security Testing) — OWASP ZAP yoki Burp Suite skaneri kabi — kodni ko‘rmaydi: u test muhitidagi ishlayotgan saytga hujumchi kabi so‘rovlar yuboradi va javoblarni tekshiradi. U sozlama xatolarini (sarlavhalar, cookie bayroqlari, TLS), haqiqatan ishlaydigan XSS va injection’larni topadi. Kamchiligi: sekinroq, faqat yetib borgan sahifalarni ko‘radi va xatoni kodning qaysi qatorida ekanini aytmaydi. Uni hech qachon ruxsatsiz, birovning saytida ishlatmang.",
      "DAST (Dynamic Application Security Testing) — such as OWASP ZAP or Burp Suite’s scanner — doesn’t see the code: it sends attacker-style requests to the running site in a test environment and checks the responses. It finds configuration mistakes (headers, cookie flags, TLS) and XSS or injection that really work. The downsides: it is slower, sees only the pages it reaches and doesn’t say which line of code is wrong. Never run it against someone else’s site without permission.",
    ),
    analogy: t(
      "SAST — chizmani tekshirish, DAST — tayyor binoning eshiklarini tortib ko‘rish.",
      "SAST checks the blueprint; DAST tries the doors of the finished building.",
    ),
    theory: [
      t(
        "DAST staging’da ishga tushiriladi, ishlab chiqarishda emas: u ma’lumot yaratishi va o‘chirishi mumkin.",
        "DAST runs against staging, not production: it may create and delete data.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "DAST kodni emas, javoblarni ko‘radi.",
      "DAST sees responses, not code.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi muammoni DAST SAST’dan yaxshiroq topadi?",
            "Which problem does DAST find better than SAST?",
          ),
          options: [
            t(
              "Serverda yetishmayotgan xavfsizlik sarlavhalari",
              "Security headers missing on the server",
            ),
            t("Koddagi o‘zgaruvchi nomi xatosi", "A misnamed variable in code"),
            t("Izohlardagi imlo xatosi", "A typo in a comment"),
          ],
          answer: 0,
          explain: t(
            "Sarlavhalar ko‘pincha kodda emas, server yoki CDN sozlamasida.",
            "Headers often live in the server or CDN settings, not the code.",
          ),
        },
        {
          ask: t("DAST’ni qayerda ishga tushirasiz?", "Where do you run DAST?"),
          options: [
            t(
              "O‘zimizning staging muhitimizda",
              "Against our own staging environment",
            ),
            t("Raqobatchining saytida", "Against a competitor’s site"),
            t(
              "Ishlab chiqarishda, eng ko‘p trafik paytida",
              "In production, at peak traffic",
            ),
          ],
          answer: 0,
          explain: t(
            "Ruxsatsiz skanerlash — qonunbuzarlik.",
            "Scanning without permission is against the law.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: PIPELINE,
    title: t("Qaysi tekshiruv topadi", "Which check catches it"),
    minutes: 8,
    intro: t(
      "Yaxshi pipeline’da har bir vosita o‘z joyida turadi: pre-commit — sirlarni qidirish; pull request — SAST va SCA (tez, har bir o‘zgarishda); staging’ga joylagandan keyin — DAST. Quyidagi beshta muammoni ularni ushlaydigan tekshiruvga moslang.",
      "In a good pipeline each tool has its place: pre-commit runs secret scanning; the pull request runs SAST and SCA (fast, on every change); after deploying to staging comes DAST. Match the five problems below to the check that catches them.",
    ),
    analogy: t(
      "Aeroportdagi nazorat: hujjat, bagaj rentgeni, so‘ng darvoza — har biri boshqa narsani tekshiradi.",
      "Airport security: documents, the baggage X-ray, then the gate — each checks something else.",
    ),
    theory: [
      t(
        "Bir xil muammoni ikki vosita topishi mumkin — bu yaxshi: qatlamli himoya.",
        "Two tools may catch the same problem — that’s fine: defence in depth.",
      ),
    ],
    task: t(
      "Har bir muammo uchun tekshiruvni tanlang.",
      "Choose the check for each problem.",
    ),
    hint: t(
      "Kodda, lockfile’da, commit’da yoki ishlayotgan saytdami?",
      "Is it in the code, the lockfile, a commit or the running site?",
    ),
    widget: { type: "pipeline" },
  },
  {
    id: 7,
    group: PIPELINE,
    title: t("Qachon to‘xtatish", "When to block"),
    minutes: 6,
    intro: t(
      "Har bir topilma birlashtirishni (merge) to‘xtatsa, jamoa vositani o‘chirib qo‘yadi; hech qaysi to‘xtatmasa, ogohlantirishlarni hech kim o‘qimaydi. Odatiy siyosat: kritik va yuqori darajadagi yangi topilmalar va har qanday sir — merge’ni to‘xtatadi; o‘rta va past — ogohlantirish va vazifa; eski kodda allaqachon bor topilmalar — alohida reja bilan tuzatiladi (baseline).",
      "If every finding blocks the merge, the team switches the tool off; if none do, nobody reads the warnings. A usual policy: new critical and high findings and any secret block the merge; medium and low become a warning and a ticket; findings already in old code are fixed on a separate plan (a baseline).",
    ),
    analogy: t(
      "Svetofor: qizil — to‘xta, sariq — ehtiyot bo‘l, yashil — o‘t.",
      "A traffic light: red stops you, amber warns you, green lets you go.",
    ),
    theory: [
      t(
        "Baseline: vosita faqat yangi kodda paydo bo‘lgan topilmalar uchun to‘xtatadi.",
        "A baseline: the tool blocks only on findings that new code introduces.",
      ),
    ],
    task: t(
      "Har bir holatda pipeline nima qiladi?",
      "What does the pipeline do in each case?",
    ),
    hint: t("Yangi va jiddiy — to‘xtatadi.", "New and serious blocks."),
    widget: {
      type: "sort",
      buckets: [
        { id: "block", label: t("Merge’ni to‘xtatadi", "Blocks the merge") },
        { id: "warn", label: t("Ogohlantiradi", "Warns") },
      ],
      items: [
        {
          label: t(
            "Yangi kodda kritik SQL injection",
            "A critical SQL injection in new code",
          ),
          bucket: "block",
        },
        {
          label: t(
            "Commit’da topilgan to‘lov tizimi kaliti",
            "A payment provider key found in a commit",
          ),
          bucket: "block",
        },
        {
          label: t(
            "Past darajali topilma: batafsil xato sahifasi staging’da",
            "A low finding: a verbose error page on staging",
          ),
          bucket: "warn",
        },
        {
          label: t(
            "Uch yillik kodda allaqachon bo‘lgan o‘rta topilma",
            "A medium finding already in three-year-old code",
          ),
          bucket: "warn",
        },
        {
          label: t(
            "Yangi qo‘shilgan kutubxonada yuqori darajali zaiflik",
            "A high-severity flaw in a newly added library",
          ),
          bucket: "block",
        },
      ],
    },
  },
  {
    id: 8,
    group: PIPELINE,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Avtomatik tekshiruvlar — xavfsizlikning xavfsizlik to‘ri: SAST kodni, SCA kutubxonalarni, sirlarni qidirish commit’larni, DAST ishlayotgan saytni ko‘radi. Ular odam ko‘rigini almashtirmaydi — ular odamga muhim narsaga e’tibor berish uchun vaqt beradi. Keyingi modul — aynan shu odam ko‘rigi: kod ko‘rigi.",
      "Automated checks are security’s safety net: SAST sees the code, SCA the dependencies, secret scanning the commits and DAST the running site. They don’t replace human review — they give people time to look at what matters. The next module is exactly that human review: code review.",
    ),
    analogy: t(
      "Avtopilot uchuvchini almashtirmaydi — uni charchoqdan saqlaydi.",
      "An autopilot doesn’t replace the pilot — it keeps them from tiring.",
    ),
    theory: [
      t(
        "Vositalarni bitta-bitta qo‘shing va har birini sozlang: yolg‘on signallar — dushman.",
        "Add tools one at a time and tune each: false alarms are the enemy.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Har bir vosita — o‘z qatlami.", "Each tool is its own layer."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "SAST va DAST’ning asosiy farqi?",
            "The main difference between SAST and DAST?",
          ),
          options: [
            t(
              "SAST kodni o‘qiydi, DAST ishlayotgan ilovani sinaydi",
              "SAST reads code, DAST probes the running app",
            ),
            t("Ikkalasi bir xil", "They’re the same"),
            t("SAST faqat Java uchun", "SAST is only for Java"),
          ],
          answer: 0,
          explain: t(
            "Ular bir-birini to‘ldiradi.",
            "They complement each other.",
          ),
        },
        {
          ask: t(
            "Jamoa SAST ogohlantirishlarini o‘qimay qo‘ydi. Eng ehtimolli sabab?",
            "The team has stopped reading SAST warnings. The likeliest cause?",
          ),
          options: [
            t("Juda ko‘p yolg‘on signal", "Too many false alarms"),
            t("Vosita juda tez", "The tool is too fast"),
            t("Kod juda xavfsiz", "The code is too secure"),
          ],
          answer: 0,
          explain: t(
            "Qoidalarni sozlang va asosli istisnolar qo‘shing.",
            "Tune the rules and add justified exceptions.",
          ),
        },
      ],
    },
  },
];
