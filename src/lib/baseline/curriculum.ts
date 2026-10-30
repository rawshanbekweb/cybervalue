// Academy Intermediate · System security, module 5: Patching and
// baselines. The lessons use ./tools.ts: a server compared against its
// security baseline.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "drift" };

export const PROGRESS_KEY = "cybervalue:baseline:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const PATCHING = t("Yangilanishlar", "Patching");
const BASELINES = t("Bazaviy sozlamalar", "Baselines");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: PATCHING,
    title: t("Nega yangilash kerak", "Why patch"),
    minutes: 5,
    intro: t(
      "Ko‘p buzilishlar yangi, noma’lum zaiflik orqali emas, balki allaqachon tuzatilgan, lekin o‘rnatilmagan zaiflik orqali sodir bo‘ladi. Tuzatish e’lon qilingach, hujumchilar uni tahlil qilib, bir necha kun ichida eksploit yozadi — yangilanmagan serverlar shu “oyna” ichida qoladi. Shuning uchun patch boshqaruvi: nimalar borligini bilish, yangilanishni sinash, tez o‘rnatish va o‘rnatilganini tekshirish.",
      "Most breaches don’t use a new, unknown flaw — they use one that was fixed long ago but never installed. Once a fix is published, attackers study it and often have an exploit within days; unpatched servers sit inside that window. So patch management means knowing what you run, testing updates, installing them quickly and checking that they landed.",
    ),
    analogy: t(
      "Avtomobil zavodi tormozdagi nuqson uchun bepul ta’mir e’lon qildi — lekin servisga bormaganlar xavf ostida qoladi.",
      "A carmaker announces a free brake recall — but owners who never visit the garage stay at risk.",
    ),
    theory: [
      t(
        "CISA KEV — haqiqatan hujumlarda ishlatilayotgan zaifliklar ro‘yxati; ular birinchi navbatda yopiladi.",
        "CISA’s KEV list names flaws exploited in real attacks; those are closed first.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Tuzatish chiqqach, vaqt ketadi.",
      "Once the fix is out, the clock is running.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ko‘p buzilishlar qanday zaiflik orqali bo‘ladi?",
            "Most breaches use which kind of flaw?",
          ),
          options: [
            t(
              "Tuzatish chiqqan, lekin o‘rnatilmagan",
              "One with a fix that was never installed",
            ),
            t("Hech kim bilmagan yangi zaiflik", "A brand-new unknown flaw"),
            t("Faqat apparat nosozligi", "Only hardware faults"),
          ],
          answer: 0,
          explain: t(
            "Yangilash — eng arzon va eng samarali himoya.",
            "Patching is the cheapest, most effective defence.",
          ),
        },
        {
          ask: t(
            "Qaysi zaiflik birinchi yopiladi?",
            "Which flaw is closed first?",
          ),
          options: [
            t(
              "Internetga ochiq tizimdagi, hujumlarda ishlatilayotgan zaiflik",
              "One being exploited, on an internet-facing system",
            ),
            t(
              "Ichki test serveridagi past darajali zaiflik",
              "A low one on an internal test server",
            ),
            t("Eng eski e’lon qilingani", "Whichever was announced first"),
          ],
          answer: 0,
          explain: t(
            "Daraja + ochiqlik + haqiqiy hujumlar = ustuvorlik.",
            "Severity, exposure and real attacks set the order.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: PATCHING,
    title: t("Ustuvorlik", "Priorities"),
    minutes: 6,
    intro: t(
      "Hammasini birdaniga yangilab bo‘lmaydi, shuning uchun navbat tuziladi. Kritik va haqiqatan ishlatilayotgan zaiflik internetga ochiq tizimda — 24–72 soat ichida. Yuqori daraja — bir-ikki hafta. Qolganlari — oylik muntazam yangilanish oynasida. Yangilab bo‘lmasa (masalan, eski uskuna), vaqtinchalik chora ko‘riladi: tarmoqdan ajratish, xizmatni o‘chirish yoki firewall qoidasi.",
      "You can’t patch everything at once, so you queue. A critical, actively exploited flaw on an internet-facing system: within 24–72 hours. High severity: within a week or two. The rest: in the regular monthly maintenance window. Where patching is impossible (old equipment, say), you mitigate meanwhile: isolate it, switch the service off or add a firewall rule.",
    ),
    analogy: t(
      "Shifoxona navbati: og‘ir bemor darhol, rejali ko‘rik keyinroq.",
      "A hospital queue: the critical patient now, the routine check-up later.",
    ),
    theory: [
      t(
        "Har bir yangilanish avval sinov serverida, keyin ishlab chiqarishda.",
        "Each update goes on a test server first, then production.",
      ),
    ],
    task: t(
      "Har bir yangilanish qachon o‘rnatiladi?",
      "When does each update go in?",
    ),
    hint: t(
      "Ochiq va ishlatilayotgan — darhol.",
      "Exposed and exploited means now.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "now", label: t("72 soat ichida", "Within 72 hours") },
        { id: "window", label: t("Oylik oynada", "Monthly window") },
      ],
      items: [
        {
          label: t(
            "Internetga ochiq VPN’da ishlatilayotgan kritik zaiflik",
            "A critical, exploited flaw in the internet-facing VPN",
          ),
          bucket: "now",
        },
        {
          label: t(
            "Ichki printer drayveridagi past zaiflik",
            "A low flaw in an internal printer driver",
          ),
          bucket: "window",
        },
        {
          label: t(
            "Veb-serverdagi masofadan kod bajarish zaifligi, eksploiti ochiq",
            "Remote code execution in the web server, with a public exploit",
          ),
          bucket: "now",
        },
        {
          label: t(
            "Matn muharririning yangi versiyasi",
            "A new version of a text editor",
          ),
          bucket: "window",
        },
        {
          label: t(
            "Ofis kompyuterlari uchun o‘rta darajali brauzer yangilanishi",
            "A medium browser update for office PCs",
          ),
          bucket: "window",
        },
      ],
    },
  },
  {
    id: 3,
    group: PATCHING,
    title: t("Avtomatlashtirish", "Automating it"),
    minutes: 6,
    intro: t(
      "Yuzlab serverni qo‘lda yangilab bo‘lmaydi. Linux’da `unattended-upgrades` xavfsizlik yangilanishlarini o‘zi o‘rnatadi; Windows’da WSUS yoki Intune yangilanishlarni boshqaradi. Lekin “o‘rnatildi” — “ishlayapti” degani emas: kernel va kutubxonalar faqat qayta yuklash yoki xizmatni qayta ishga tushirgandan keyin almashadi. `needrestart` yoki `/var/run/reboot-required` qaysi server qayta yuklanishni kutayotganini ko‘rsatadi.",
      "Hundreds of servers can’t be patched by hand. On Linux, `unattended-upgrades` installs security updates itself; on Windows, WSUS or Intune manage them. But “installed” doesn’t mean “running”: a kernel or library is only replaced after a reboot or service restart. `needrestart` or `/var/run/reboot-required` show which servers are waiting for one.",
    ),
    analogy: t(
      "Yangi qulf olib keldingiz, lekin eshikka o‘rnatmadingiz.",
      "You bought a new lock but never fitted it to the door.",
    ),
    theory: [
      t(
        "`uname -r` ishlayotgan kernelni ko‘rsatadi; o‘rnatilgan versiya bilan solishtiring.",
        "`uname -r` shows the running kernel; compare it with the installed one.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "O‘rnatilgan ≠ ishlayotgan.",
      "Installed isn’t the same as running.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Yangi kernel o‘rnatildi, server qayta yuklanmadi. Qaysi kernel ishlayapti?",
            "A new kernel was installed but the server never rebooted. Which kernel runs?",
          ),
          options: [
            t("Eskisi", "The old one"),
            t("Yangisi", "The new one"),
            t("Ikkalasi", "Both"),
          ],
          answer: 0,
          explain: t(
            "Tuzatish faqat qayta yuklashdan keyin kuchga kiradi.",
            "The fix takes effect only after the reboot.",
          ),
        },
        {
          ask: t(
            "Debian/Ubuntu’da xavfsizlik yangilanishlarini nima avtomatik o‘rnatadi?",
            "What installs security updates automatically on Debian/Ubuntu?",
          ),
          options: [
            t("unattended-upgrades", "unattended-upgrades"),
            t("cron’dagi rm -rf", "rm -rf in cron"),
            t("ufw", "ufw"),
          ],
          answer: 0,
          explain: t(
            "Natijani loglar va monitoring bilan tekshiring.",
            "Check the result in logs and monitoring.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: BASELINES,
    title: t("Bazaviy sozlama nima", "What a baseline is"),
    minutes: 6,
    intro: t(
      "Baseline — tizim qanday sozlanishi kerakligining yozma standarti: qaysi xizmatlar yoqilgan, qaysi portlar ochiq, parol va SSH siyosati, loglar, huquqlar. CIS Benchmarks — eng mashhur tayyor baseline’lar, Linux, Windows, bulut va ma’lumotlar bazalari uchun. Har bir yangi server shu standart bo‘yicha quriladi, shuning uchun “yaxshi” holat aniq bo‘ladi va undan har qanday chetga chiqishni ko‘rish mumkin.",
      "A baseline is a written standard for how a system should be set up: which services run, which ports are open, password and SSH policy, logging, permissions. The CIS Benchmarks are the best-known ready-made baselines, for Linux, Windows, cloud and databases. Every new server is built to the standard, so “good” is clearly defined and any departure from it can be seen.",
    ),
    analogy: t(
      "Oshxonadagi retsept: har bir oshpaz bir xil taom tayyorlashi uchun.",
      "A restaurant recipe: so every cook makes the same dish.",
    ),
    theory: [
      t(
        "Baseline kodda saqlanadi (Ansible, Terraform, GPO) — qo‘lda emas.",
        "A baseline lives in code (Ansible, Terraform, GPO), not in someone’s head.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Yozilgan standart.", "A written standard."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("CIS Benchmarks nima?", "What are the CIS Benchmarks?"),
          options: [
            t(
              "Tizimlar uchun tayyor xavfsiz sozlama standartlari",
              "Ready-made secure configuration standards for systems",
            ),
            t("Antivirus dasturi", "An antivirus product"),
            t("Tezlik testi", "A speed test"),
          ],
          answer: 0,
          explain: t(
            "Ular har bir sozlama uchun sabab va tekshiruv beradi.",
            "They give a reason and a check for every setting.",
          ),
        },
        {
          ask: t(
            "Baseline qayerda saqlangani yaxshi?",
            "Where is a baseline best kept?",
          ),
          options: [
            t(
              "Kodda (masalan, Ansible), versiyalar bilan",
              "In code (e.g. Ansible), under version control",
            ),
            t("Administratorning xotirasida", "In an administrator’s memory"),
            t("Stikerda", "On a sticky note"),
          ],
          answer: 0,
          explain: t(
            "Shunda har bir server bir xil quriladi va o‘zgarish ko‘rinadi.",
            "Then every server is built the same and changes are visible.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: BASELINES,
    title: t("Sozlama siljishini topish", "Finding configuration drift"),
    minutes: 9,
    intro: t(
      "Server baseline bo‘yicha qurilgan edi, lekin bir yil davomida odamlar “vaqtincha” o‘zgartirishlar kiritdi. Bu — configuration drift. Quyida joriy holat baseline bilan yonma-yon. Qaysi sozlamalar siljigan?",
      "The server was built to the baseline, but over a year people made “temporary” changes. That is configuration drift. Below, its current state sits beside the baseline. Which settings have drifted?",
    ),
    analogy: t(
      "Yil boshida tartibga solingan ombor: yil oxirida qutilar boshqa joylarda.",
      "A stockroom tidied in January: by December the boxes have moved.",
    ),
    theory: [
      t(
        "Versiya raqamlarini diqqat bilan solishtiring: 6.8.0-31 va 6.8.0-49 bir xil emas.",
        "Compare version numbers carefully: 6.8.0-31 isn’t 6.8.0-49.",
      ),
    ],
    task: t(
      "Siljigan sozlamalarni belgilang.",
      "Tick the settings that have drifted.",
    ),
    hint: t("To‘rttasi siljigan.", "Four have drifted."),
    widget: { type: "drift" },
  },
  {
    id: 6,
    group: BASELINES,
    title: t("Siljishga qarshi", "Keeping drift away"),
    minutes: 6,
    intro: t(
      "Siljishni bir marta tuzatish yetmaydi — u yana qaytadi. Uch odat: baseline’ni muntazam avtomatik tekshirish (OpenSCAP, Lynis, CIS-CAT, bulutda AWS Config); o‘zgarishlarni faqat kod va ko‘rib chiqish orqali kiritish; va “o‘zgarmas infratuzilma” — serverni tahrirlash o‘rniga, yangi baseline’dan qayta qurish. Har bir topilgan siljish ham tuzatiladi, ham sababi so‘raladi: kim, nega, va jarayon qayerda yo‘l qo‘ydi.",
      "Fixing drift once isn’t enough — it comes back. Three habits: check against the baseline automatically and regularly (OpenSCAP, Lynis, CIS-CAT, AWS Config in the cloud); make changes only through code and review; and “immutable infrastructure” — rebuild a server from the baseline rather than editing it. Each drift found is fixed and its cause asked about: who, why, and where the process let it through.",
    ),
    analogy: t(
      "Bog‘ni har hafta o‘tdan tozalash va yangi urug‘ni faqat ro‘yxat bo‘yicha ekish.",
      "Weeding the garden every week and planting only from the plan.",
    ),
    theory: [
      t(
        "“Vaqtincha” o‘zgarishga muddat va egasi yoziladi — aks holda u abadiy qoladi.",
        "Give a “temporary” change an owner and an end date — or it stays for ever.",
      ),
    ],
    task: t(
      "Bu siljishning oldini oladimi yoki uni keltirib chiqaradimi?",
      "Does this prevent drift or cause it?",
    ),
    hint: t(
      "Qo‘lda va hujjatsiz — siljish.",
      "By hand and unrecorded means drift.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "prevent", label: t("Oldini oladi", "Prevents it") },
        { id: "cause", label: t("Keltirib chiqaradi", "Causes it") },
      ],
      items: [
        {
          label: t(
            "Har kecha avtomatik baseline tekshiruvi",
            "A nightly automatic baseline check",
          ),
          bucket: "prevent",
        },
        {
          label: t(
            "Serverga SSH bilan kirib, sozlamani qo‘lda “tezda” o‘zgartirish",
            "SSHing in to change a setting by hand “just quickly”",
          ),
          bucket: "cause",
        },
        {
          label: t(
            "O‘zgarishlarni Ansible orqali, pull request bilan kiritish",
            "Changing settings through Ansible with a pull request",
          ),
          bucket: "prevent",
        },
        {
          label: t(
            "Muddatsiz “vaqtincha” firewall istisnosi",
            "A “temporary” firewall exception with no end date",
          ),
          bucket: "cause",
        },
        {
          label: t(
            "Serverni tahrirlash o‘rniga yangi baseline’dan qayta qurish",
            "Rebuilding a server from the baseline instead of editing it",
          ),
          bucket: "prevent",
        },
      ],
    },
  },
  {
    id: 7,
    group: BASELINES,
    title: t("Hisobot va o‘lchash", "Reporting and measuring"),
    minutes: 5,
    intro: t(
      "Rahbariyat “xavfsizmizmi?” deb so‘raganda, raqam kerak: baseline’ga mos serverlar foizi, kritik yangilanishni o‘rnatishgacha o‘rtacha vaqt va muddati o‘tgan yangilanishlar soni. Ular vaqt bo‘yicha kuzatiladi — maqsad 100 foiz emas, balki barqaror yaxshilanish va istisnolarning har biri uchun asos.",
      "When management asks “are we secure?”, you need numbers: the share of servers matching the baseline, the average time to install a critical patch, and the count of overdue updates. They are tracked over time — the goal isn’t 100 percent but steady improvement, with a reason recorded for every exception.",
    ),
    analogy: t(
      "Shifokor tahlil natijasini bir marta emas, har oy solishtiradi.",
      "A doctor compares test results month after month, not once.",
    ),
    theory: [
      t(
        "Ko‘rib bo‘lmaydigan narsani boshqarib bo‘lmaydi: avval inventar, keyin o‘lchov.",
        "You can’t manage what you can’t see: inventory first, then measure.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Raqam va trend.", "A number and its trend."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Patch boshqaruvi uchun foydali o‘lchov?",
            "A useful patch management measure?",
          ),
          options: [
            t(
              "Kritik yangilanishni o‘rnatishgacha o‘rtacha vaqt",
              "Average time to install a critical patch",
            ),
            t("Serverlar rangi", "The colour of the servers"),
            t("Yozilgan email soni", "Emails sent"),
          ],
          answer: 0,
          explain: t(
            "U oyna qancha vaqt ochiq turganini ko‘rsatadi.",
            "It shows how long the window stays open.",
          ),
        },
        {
          ask: t(
            "Baseline va patchlarning birinchi sharti?",
            "The first condition for baselines and patching?",
          ),
          options: [
            t(
              "To‘liq inventar: nima borligini bilish",
              "A full inventory: knowing what you have",
            ),
            t("Eng qimmat firewall", "The most expensive firewall"),
            t("Ko‘proq parol", "More passwords"),
          ],
          answer: 0,
          explain: t(
            "Bilmagan serveringizni yangilay olmaysiz.",
            "You can’t patch a server you don’t know about.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: BASELINES,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Yangilanish va baseline — bir-birini to‘ldiradi: yangilanish ma’lum zaifliklarni yopadi, baseline esa sozlama xatolarining qaytib kelishiga yo‘l qo‘ymaydi. Shu bilan Tizim xavfsizligi yo‘nalishi tugaydi: mustahkamlash, Windows, autentifikatsiya va endi tizimni shu holatda saqlash.",
      "Patching and baselines work together: patches close known flaws, and the baseline stops configuration mistakes creeping back. That completes the System security domain: hardening, Windows, authentication, and now keeping systems in that state.",
    ),
    analogy: t(
      "Tibbiy ko‘rik va sog‘lom turmush tarzi: biri kasallikni davolaydi, ikkinchisi qaytishiga yo‘l qo‘ymaydi.",
      "A check-up and a healthy routine: one treats the illness, the other keeps it from returning.",
    ),
    theory: [
      t(
        "Har bir tuzatilgan siljish — baseline’ga yoki avtomatik tekshiruvga yangi qoida.",
        "Each drift you fix can become a new baseline rule or automatic check.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Yopish va saqlash.", "Close it and keep it closed."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Configuration drift nima?", "What is configuration drift?"),
          options: [
            t(
              "Tizimning vaqt o‘tib baseline’dan uzoqlashishi",
              "A system moving away from its baseline over time",
            ),
            t("Diskning to‘lishi", "A disk filling up"),
            t("Sekin tarmoq", "A slow network"),
          ],
          answer: 0,
          explain: t(
            "Odatda qo‘lda “vaqtincha” o‘zgarishlardan.",
            "Usually from hand-made “temporary” changes.",
          ),
        },
        {
          ask: t(
            "Eski uskunani yangilab bo‘lmaydi. Nima qilinadi?",
            "Old equipment can’t be patched. What do you do?",
          ),
          options: [
            t(
              "Vaqtinchalik chora: ajratish, xizmatni o‘chirish yoki firewall",
              "Mitigate: isolate it, switch the service off or firewall it",
            ),
            t("E’tiborsiz qoldirish", "Ignore it"),
            t("Internetga ochish", "Expose it to the internet"),
          ],
          answer: 0,
          explain: t(
            "Va uni almashtirish rejasini tuzing.",
            "And plan its replacement.",
          ),
        },
      ],
    },
  },
];
