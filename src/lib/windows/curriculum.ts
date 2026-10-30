// Academy Intermediate · System security, module 2: Windows basics. The
// lessons use ./tools.ts: a share's access list, and a night of Security
// log events.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "acl" } | { type: "events" };

export const PROGRESS_KEY = "cybervalue:windows:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const ACCOUNTS = t("Hisoblar va huquqlar", "Accounts and rights");
const DOMAIN = t("Domen", "The domain");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: ACCOUNTS,
    title: t("Hisoblar va UAC", "Accounts and UAC"),
    minutes: 6,
    intro: t(
      "Windows’da har bir jarayon biror hisob nomidan ishlaydi. Oddiy (standard) foydalanuvchi o‘z fayllari va sozlamalarini o‘zgartiradi; administrator tizim fayllari, Program Files va HKLM registriga yozadi; SYSTEM — operatsion tizimning o‘zi, eng yuqori huquq. UAC (User Account Control) administrator hisobida ham ishni oddiy huquq bilan boshlaydi va tizimga tegadigan amal uchun alohida tasdiq so‘raydi. Kundalik ish uchun oddiy hisob, boshqaruv uchun alohida admin hisobi — eng kam huquq tamoyili.",
      "On Windows every process runs as some account. A standard user changes their own files and settings; an administrator writes to system files, Program Files and the HKLM registry; SYSTEM is the operating system itself, the highest privilege. UAC (User Account Control) starts even an administrator’s work with standard rights and asks for a separate confirmation before anything touches the system. A standard account for daily work and a separate admin account for administration — that is least privilege.",
    ),
    analogy: t(
      "Ofis xodimi o‘z stolini tartiblaydi, lekin server xonasiga faqat ruxsatnoma bilan kiradi.",
      "An office worker tidies their own desk but enters the server room only with a pass.",
    ),
    theory: [
      t(
        "`whoami /groups` joriy hisob qaysi guruhlarda ekanini ko‘rsatadi.",
        "`whoami /groups` shows which groups the current account is in.",
      ),
    ],
    task: t(
      "Bu amal administrator huquqini talab qiladimi?",
      "Does this action need administrator rights?",
    ),
    hint: t(
      "O‘z narsangizmi yoki butun tizimnikimi?",
      "Is it yours, or the whole system’s?",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "admin", label: t("Admin kerak", "Needs admin") },
        {
          id: "user",
          label: t("Oddiy hisob yetadi", "A standard account will do"),
        },
      ],
      items: [
        {
          label: t(
            "C:\\Program Files ga dastur o‘rnatish",
            "Installing a program into C:\\Program Files",
          ),
          bucket: "admin",
        },
        {
          label: t(
            "O‘z ish stoli fonini almashtirish",
            "Changing your own wallpaper",
          ),
          bucket: "user",
        },
        {
          label: t(
            "Yangi lokal foydalanuvchi qo‘shish",
            "Adding a new local user",
          ),
          bucket: "admin",
        },
        {
          label: t(
            "O‘z Documents papkangizdagi faylni tahrirlash",
            "Editing a file in your own Documents",
          ),
          bucket: "user",
        },
        {
          label: t(
            "HKLM registridagi xizmat sozlamasini o‘zgartirish",
            "Changing a service setting in the HKLM registry",
          ),
          bucket: "admin",
        },
      ],
    },
  },
  {
    id: 2,
    group: ACCOUNTS,
    title: t("NTFS huquqlari", "NTFS permissions"),
    minutes: 6,
    intro: t(
      "Har bir fayl va papkada ACL (Access Control List) bor: “kimga — nima” yozuvlari ro‘yxati. Asosiy huquqlar: O‘qish (Read), O‘zgartirish (Modify — o‘qish, yozish, o‘chirish) va To‘liq nazorat (Full control — yana huquqlarni o‘zgartirish va egalik). Huquqlar papkadan ichidagilarga meros bo‘lib o‘tadi. “Deny” yozuvi “Allow” dan ustun turadi. Eng keng tarqalgan xato — “Everyone” yoki “Domain Users” ga ortiqcha huquq berish.",
      "Every file and folder has an ACL (Access Control List): a list of “who — what” entries. The main rights are Read, Modify (read, write, delete) and Full control (also change permissions and take ownership). Permissions are inherited from a folder by what is inside it. A “Deny” entry beats an “Allow”. The most common mistake is giving “Everyone” or “Domain Users” more than they need.",
    ),
    analogy: t(
      "Arxiv xonasi eshigidagi ro‘yxat: kim faqat o‘qiydi, kim yozadi, kim kalitni boshqaga beradi.",
      "The list on an archive room door: who may only read, who may write, who may hand out keys.",
    ),
    theory: [
      t(
        "`icacls D:\\Payroll` papkaning ACL’ini buyruq satrida ko‘rsatadi.",
        "`icacls D:\\Payroll` shows a folder’s ACL on the command line.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Full control — huquqlarni ham o‘zgartiradi.",
      "Full control can change permissions too.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi huquq faylning huquqlarini ham o‘zgartirishga ruxsat beradi?",
            "Which right also lets someone change a file’s permissions?",
          ),
          options: [
            t("Full control", "Full control"),
            t("Modify", "Modify"),
            t("Read", "Read"),
          ],
          answer: 0,
          explain: t(
            "Shuning uchun Full control faqat administratorlarga.",
            "That’s why Full control is for administrators only.",
          ),
        },
        {
          ask: t(
            "Bir foydalanuvchiga ham Allow, ham Deny yozuvi tegishli. Natija?",
            "One user matches both an Allow and a Deny entry. The result?",
          ),
          options: [
            t("Deny ustun turadi", "Deny wins"),
            t("Allow ustun turadi", "Allow wins"),
            t("Tasodifiy", "It’s random"),
          ],
          answer: 0,
          explain: t(
            "Aniq taqiq har doim ruxsatdan kuchli.",
            "An explicit deny always beats an allow.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: ACCOUNTS,
    title: t("Ulashilgan papka huquqlari", "A share’s permissions"),
    minutes: 8,
    intro: t(
      "Quyida `D:\\Payroll` papkasining ACL’i. Bu papkani faqat HR (ish haqi) jamoasi ochishi kerak, lekin tizim va zaxira nusxa uchun ham huquqlar zarur. Qaysi yozuvlar ortiqcha?",
      "Below is the ACL of the `D:\\Payroll` folder. Only the HR payroll team should open it, though the system and backups need rights too. Which entries are too much?",
    ),
    analogy: t(
      "Seyf: buxgalteriya, xavfsizlik xizmati va inkassatorda kalit bor — ammo farroshda ham bo‘lsa, muammo.",
      "A safe: accounting, security and the cash courier have keys — if the cleaner has one too, that’s a problem.",
    ),
    theory: [
      t(
        "Huquqlar guruhlarga beriladi, alohida odamlarga emas: odam ketsa, guruhdan chiqariladi.",
        "Grant rights to groups, not to people: when someone leaves, they leave the group.",
      ),
    ],
    task: t(
      "Ortiqcha yozuvlarni belgilang.",
      "Tick the entries that shouldn’t be there.",
    ),
    hint: t(
      "Ikkitasi butun kompaniyani qamrab oladi.",
      "Two of them cover the whole company.",
    ),
    widget: { type: "acl" },
  },
  {
    id: 4,
    group: DOMAIN,
    title: t("Active Directory", "Active Directory"),
    minutes: 7,
    intro: t(
      "Kompaniyada yuzlab kompyuterni bittalab sozlab bo‘lmaydi, shuning uchun Windows Active Directory (AD) ishlatadi. Domen kontroller (DC) — barcha hisoblar, guruhlar va kompyuterlar saqlanadigan server; xodim istalgan kompyuterga bitta domen hisobi bilan kiradi. OU (Organizational Unit) — bo‘limlar bo‘yicha papkalar. “Domain Admins” guruhi butun domenni boshqaradi, shuning uchun hujumchilarning asosiy nishoni — unga a’zolarni kam va kuzatuvda saqlang.",
      "A company can’t set up hundreds of computers one by one, so Windows uses Active Directory (AD). A domain controller (DC) is the server holding every account, group and computer; an employee signs in to any machine with one domain account. OUs (Organizational Units) are folders by department. The “Domain Admins” group controls the whole domain, which makes it attackers’ main target — keep its members few and watched.",
    ),
    analogy: t(
      "Universitetning markaziy kadrlar bo‘limi: talaba kartasi barcha binolarda ishlaydi.",
      "A university’s central records office: one student card opens every building.",
    ),
    theory: [
      t(
        "Kerberos — AD’ning asosiy autentifikatsiya protokoli: parol tarmoq bo‘ylab yuborilmaydi, chipta (ticket) beriladi.",
        "Kerberos is AD’s main authentication protocol: the password isn’t sent over the network; a ticket is issued instead.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("DC — markaz.", "The DC is the centre."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Domen hisoblari qayerda saqlanadi?",
            "Where are domain accounts stored?",
          ),
          options: [
            t("Domen kontrollerda", "On the domain controller"),
            t("Har bir noutbukda alohida", "On each laptop separately"),
            t("Foydalanuvchining telefonida", "On the user’s phone"),
          ],
          answer: 0,
          explain: t(
            "Shuning uchun DC — eng muhim himoyalanadigan server.",
            "That makes the DC the most important server to protect.",
          ),
        },
        {
          ask: t(
            "Nega Domain Admins a’zolari kam bo‘lishi kerak?",
            "Why should Domain Admins have few members?",
          ),
          options: [
            t(
              "Bitta buzilgan a’zo — butun domen hujumchi qo‘lida",
              "One compromised member hands over the whole domain",
            ),
            t("Litsenziya qimmat", "The licence is expensive"),
            t("Guruh sekin ishlaydi", "The group is slow"),
          ],
          answer: 0,
          explain: t(
            "Kundalik ish uchun admin bo‘lmagan hisob ishlatiladi.",
            "Daily work uses a non-admin account.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: DOMAIN,
    title: t("Group Policy", "Group Policy"),
    minutes: 6,
    intro: t(
      "Group Policy (GPO) — bir joyda yozilgan sozlamalar AD’dagi barcha kompyuter va foydalanuvchilarga avtomatik qo‘llanadi: parol siyosati, ekranni qulflash, USB’ni o‘chirish, firewall, dastur o‘rnatishni taqiqlash. Siyosat OU’ga bog‘lanadi va kompyuterlar uni muntazam yangilaydi (`gpupdate /force` darhol). Bitta GPO butun tarmoqni mustahkamlaydi — lekin xato GPO ham butun tarmoqni buzadi, shuning uchun avval sinov OU’sida tekshiriladi.",
      "Group Policy (GPO) applies settings written once to every computer and user in AD: password policy, screen lock, disabling USB storage, the firewall, blocking software installs. A policy is linked to an OU, and computers refresh it regularly (`gpupdate /force` does it now). One GPO hardens the whole network — and one wrong GPO breaks it, so it is tried on a test OU first.",
    ),
    analogy: t(
      "Maktab ichki tartib qoidalari: har bir sinfga alohida emas, bir marta e’lon qilinadi.",
      "School rules: announced once, not class by class.",
    ),
    theory: [
      t(
        "`gpresult /r` kompyuterga qaysi siyosatlar qo‘llanganini ko‘rsatadi.",
        "`gpresult /r` shows which policies a computer received.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Bir marta yozib, hammaga qo‘llash.",
      "Write once, apply everywhere.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "500 kompyuterda ekranni 10 daqiqadan keyin qulflash kerak. Eng yaxshi yo‘l?",
            "500 computers must lock after 10 minutes idle. The best way?",
          ),
          options: [
            t("Bitta GPO’ni OU’ga bog‘lash", "Link one GPO to the OU"),
            t(
              "Har bir kompyuterda qo‘lda sozlash",
              "Set it by hand on each computer",
            ),
            t("Xodimlarga xat yozish", "Email the staff"),
          ],
          answer: 0,
          explain: t(
            "Yangi kompyuter ham OU’ga qo‘shilishi bilan sozlamani oladi.",
            "A new computer gets the setting as soon as it joins the OU.",
          ),
        },
        {
          ask: t(
            "Yangi GPO’ni birinchi qayerda sinaysiz?",
            "Where do you try a new GPO first?",
          ),
          options: [
            t("Sinov OU’sida", "On a test OU"),
            t("Butun domenda birdaniga", "On the whole domain at once"),
            t("Domen kontrollerlarda", "On the domain controllers"),
          ],
          answer: 0,
          explain: t(
            "Xato GPO minglab kompyuterni bir vaqtda buzadi.",
            "A wrong GPO breaks thousands of machines at once.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: DOMAIN,
    title: t("Security log’ni o‘qish", "Reading the Security log"),
    minutes: 9,
    intro: t(
      "Windows Event Viewer’dagi Security logi har bir muhim hodisani raqam (Event ID) bilan yozadi. Quyida fayl serverdagi bir kecha: tunda besh hodisa ketma-ket. Har biriga ma’nosini bering — keyin ular birgalikda qanday hikoya aytishini o‘ylang.",
      "The Security log in Windows Event Viewer records each important event with a number (Event ID). Below is one night on a file server: five events in a row after midnight. Give each its meaning — then think about the story they tell together.",
    ),
    analogy: t(
      "Bino qorovulining jurnali: kim, qachon, qaysi eshikdan kirdi — va kimdir jurnal sahifasini yirtib oldi.",
      "A building guard’s logbook: who came in, when, through which door — and someone tore out a page.",
    ),
    theory: [
      t(
        "Logon type 10 — masofaviy ish stoli (RDP) orqali kirish.",
        "Logon type 10 is a sign-in over Remote Desktop (RDP).",
      ),
    ],
    task: t(
      "Har bir Event ID ning ma’nosini tanlang.",
      "Choose what each Event ID means.",
    ),
    hint: t(
      "4624/4625 — kirish, 4720 — yaratish, 4732 — guruh, 1102 — tozalash.",
      "4624/4625 are logons, 4720 creation, 4732 groups, 1102 clearing.",
    ),
    widget: { type: "events" },
  },
  {
    id: 7,
    group: DOMAIN,
    title: t("Himoya vositalari", "Built-in defences"),
    minutes: 6,
    intro: t(
      "Windows’ning o‘zida kuchli himoya bor, faqat yoqish kerak. Microsoft Defender — antivirus va xavfli xatti-harakatlarni bloklash. BitLocker — diskni shifrlaydi: noutbuk o‘g‘irlansa, ma’lumot o‘qilmaydi. LAPS — har bir kompyuterning lokal Administrator paroli har xil va avtomatik almashadi, shuning uchun bitta parol sizsa, butun tarmoq ochilmaydi. Windows Update — xavfsizlik tuzatishlarini har oy (Patch Tuesday) beradi.",
      "Windows has strong defences built in; they just need switching on. Microsoft Defender is antivirus plus blocking of risky behaviour. BitLocker encrypts the disk: a stolen laptop’s data can’t be read. LAPS gives every computer a different local Administrator password that rotates automatically, so one leaked password doesn’t open the whole network. Windows Update delivers security fixes every month (Patch Tuesday).",
    ),
    analogy: t(
      "Uydagi signalizatsiya, seyf va har xonaga alohida kalit.",
      "A house alarm, a safe and a different key for every room.",
    ),
    theory: [
      t(
        "Hamma kompyuterda bir xil lokal admin paroli — tarmoq bo‘ylab tarqalishning (lateral movement) eng oson yo‘li.",
        "The same local admin password everywhere is the easiest route for lateral movement.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Har bir vosita — o‘z xavfi uchun.", "Each tool has its own risk."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Noutbuk taksida qoldi. Qaysi vosita ma’lumotni saqlab qoladi?",
            "A laptop was left in a taxi. Which tool keeps the data safe?",
          ),
          options: [
            t("BitLocker", "BitLocker"),
            t("Defender", "Defender"),
            t("Group Policy", "Group Policy"),
          ],
          answer: 0,
          explain: t(
            "Shifrlangan diskni boshqa kompyuterga ulasa ham o‘qib bo‘lmaydi.",
            "An encrypted disk can’t be read even in another computer.",
          ),
        },
        {
          ask: t(
            "LAPS qaysi muammoni hal qiladi?",
            "Which problem does LAPS solve?",
          ),
          options: [
            t(
              "Barcha kompyuterlarda bir xil lokal admin paroli",
              "The same local admin password on every computer",
            ),
            t("Sekin internet", "Slow internet"),
            t("Eski printer drayverlari", "Old printer drivers"),
          ],
          answer: 0,
          explain: t(
            "Har bir kompyuter — o‘z paroli, o‘zi almashadi.",
            "Each machine has its own password, rotated for you.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: DOMAIN,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Windows xavfsizligi uch ustunga tayanadi: kim (hisoblar va guruhlar), nimaga (ACL’lar va siyosatlar) va nima bo‘ldi (loglar). Keyingi modulda ko‘ramiz: bu ustunlardan biri bo‘sh qolsa, hujumchi oddiy hisobdan administratorgacha qanday ko‘tariladi.",
      "Windows security rests on three pillars: who (accounts and groups), what they may touch (ACLs and policies) and what happened (logs). The next module shows how an attacker climbs from an ordinary account to administrator when one of those pillars is weak.",
    ),
    analogy: t(
      "Bino: kim kiradi, qaysi xonaga va kamerada nima ko‘rindi.",
      "A building: who comes in, which rooms they reach and what the cameras saw.",
    ),
    theory: [
      t(
        "Security log hajmini oshiring va loglarni SIEM’ga yuboring — 1102 dan keyin ham dalil qoladi.",
        "Make the Security log larger and ship it to a SIEM — the evidence survives a 1102.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kim, nimaga, nima bo‘ldi.", "Who, what, what happened."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Tunda 4720, keyin 4732 (Administrators), keyin 1102. Bu nima?",
            "At night: 4720, then 4732 (Administrators), then 1102. What is it?",
          ),
          options: [
            t(
              "Hujumchi o‘ziga admin hisob ochib, izini o‘chirgan",
              "An attacker made themselves an admin account and wiped the trail",
            ),
            t("Odatiy yangilanish", "A routine update"),
            t("Printer xatosi", "A printer error"),
          ],
          answer: 0,
          explain: t(
            "1102 ning o‘zi — darhol tekshiriladigan signal.",
            "A 1102 on its own is a signal to investigate at once.",
          ),
        },
        {
          ask: t(
            "Huquqlar kimga beriladi?",
            "Who should permissions be granted to?",
          ),
          options: [
            t("Guruhlarga", "Groups"),
            t("Har bir odamga alohida", "Each person individually"),
            t("Everyone ga", "Everyone"),
          ],
          answer: 0,
          explain: t(
            "Odam ketsa — guruhdan chiqariladi, huquqlar o‘zgarmaydi.",
            "When someone leaves, they leave the group; the ACL stays as is.",
          ),
        },
      ],
    },
  },
];
