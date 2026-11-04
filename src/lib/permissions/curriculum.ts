// Academy Intermediate · Software and trust, module 3: App permissions and
// sandboxing. The lessons use ./tools.ts: eight permission requests.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "requests" };

export const PROGRESS_KEY = "cybervalue:permissions:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const LIMITS = t("Cheklovlar", "Limits");
const CHOICES = t("Tanlovlar", "Choices");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: LIMITS,
    title: t("Sandbox nima", "What a sandbox is"),
    minutes: 5,
    intro: t(
      "Zamonaviy telefon va brauzerlarda har bir ilova o‘z “qutisi”da — sandbox’da ishlaydi: boshqa ilovalarning fayllarini ko‘rmaydi va tizimni o‘zgartira olmaydi. Kamera, joylashuv yoki kontaktlar kabi narsalarga kirish uchun ilova ruxsat (permission) so‘raydi va qarorni siz qabul qilasiz. Shunday qilib, bitta yomon ilova butun qurilmani buzolmaydi.",
      "On modern phones and browsers every app runs in its own box — a sandbox: it can’t see other apps’ files or change the system. To reach things like the camera, location or contacts, the app asks for a permission and you decide. That way one bad app can’t take over the whole device.",
    ),
    analogy: t(
      "Mehmonxona xonasi: mehmon o‘z xonasida erkin, lekin boshqa xonalarga kalit faqat ruxsat bilan.",
      "A hotel room: guests are free in their own room, but other doors need permission.",
    ),
    theory: [
      t(
        "Brauzerda har bir sayt ham o‘z sandbox’ida — boshqa saytlarning ma’lumotlarini o‘qiy olmaydi.",
        "In a browser each site has its own sandbox too — it can’t read other sites’ data.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Har kim o‘z qutisida.", "Everyone stays in their own box."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Sandbox nima qiladi?", "What does a sandbox do?"),
          options: [
            t(
              "Ilovani boshqa ilova va tizimdan ajratadi",
              "Keeps an app apart from other apps and the system",
            ),
            t("Ilovani tezlashtiradi", "Makes the app faster"),
            t("Reklamani o‘chiradi", "Removes ads"),
          ],
          answer: 0,
          explain: t(
            "Qo‘shimcha kirish faqat ruxsat orqali.",
            "Extra access comes only through permissions.",
          ),
        },
        {
          ask: t(
            "Kameraga kirish uchun ilova nima qiladi?",
            "What does an app do to reach the camera?",
          ),
          options: [
            t("Ruxsat so‘raydi", "Asks for a permission"),
            t("O‘zi kiradi", "Just uses it"),
            t("Parol taxmin qiladi", "Guesses a password"),
          ],
          answer: 0,
          explain: t(
            "Qarorni foydalanuvchi qabul qiladi.",
            "The user makes the call.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: LIMITS,
    title: t("Ruxsat turlari", "Kinds of permission"),
    minutes: 6,
    intro: t(
      "Ruxsatlar xavfi har xil. Bildirishnoma — kam xavfli. Kamera, mikrofon, joylashuv, kontaktlar, SMS — shaxsiy ma’lumot. Eng xavflilari: Accessibility (ekrandagi hamma narsani o‘qish va bosish), qurilma administratori, boshqa ilovalar ustidan chizish va brauzer kengaytmasidagi “barcha saytlardagi ma’lumotlarni o‘qish va o‘zgartirish”. Bular deyarli to‘liq boshqaruv beradi va ko‘p firibgar ilovalar aynan shularni so‘raydi.",
      "Permissions carry different risks. Notifications are low risk. Camera, microphone, location, contacts and SMS are personal data. The most dangerous are Accessibility (read and tap everything on screen), device administrator, drawing over other apps, and a browser extension’s “read and change your data on all websites”. These give near-full control, and many scam apps ask for exactly these.",
    ),
    analogy: t(
      "Uy kaliti: bitta xonaning kaliti va butun uyning bosh kaliti farq qiladi.",
      "House keys: a key to one room is not the same as the master key.",
    ),
    theory: [
      t(
        "Android va iOS “faqat bir marta” va “faqat ishlatilayotganda” variantlarini beradi.",
        "Android and iOS offer “only this time” and “only while in use” options.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Accessibility — eng kuchli ruxsat.",
      "Accessibility is the most powerful permission.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi ruxsat eng xavfli?",
            "Which permission is the most dangerous?",
          ),
          options: [
            t(
              "Accessibility (ekranni o‘qish va bosish)",
              "Accessibility (read and tap the screen)",
            ),
            t("Bildirishnomalar", "Notifications"),
            t("Tebranish", "Vibration"),
          ],
          answer: 0,
          explain: t(
            "U ilovaga telefonni siz kabi boshqarish imkonini beradi.",
            "It lets an app use the phone as if it were you.",
          ),
        },
        {
          ask: t(
            "Joylashuv uchun eng yaxshi variant?",
            "The best location option?",
          ),
          options: [
            t("Faqat ilova ishlatilayotganda", "Only while using the app"),
            t("Har doim, fonda ham", "Always, even in the background"),
            t("Farqi yo‘q", "It doesn’t matter"),
          ],
          answer: 0,
          explain: t(
            "Kerak paytda — va boshqa vaqtda emas.",
            "When needed — and not otherwise.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: CHOICES,
    title: t("So‘rovlarni baholash", "Judging requests"),
    minutes: 8,
    intro: t(
      "Quyida sakkizta ilova va ular so‘ragan ruxsat. Har biri uchun bitta savol bering: bu ilova o‘z ishini bajarish uchun shu ruxsatga muhtojmi? To‘rttasi ortiqcha narsa so‘rayapti.",
      "Below are eight apps and the permission each asks for. Ask one question of each: does this app need this to do its job? Four are asking for more than they need.",
    ),
    analogy: t(
      "Santexnik uyingizga kiradi — lekin yotoqxona shkafingiz kalitini so‘ramaydi.",
      "A plumber comes into your house — but doesn’t ask for the key to your wardrobe.",
    ),
    theory: [
      t(
        "Ortiqcha ruxsat so‘ragan ilova — rad eting yoki o‘chiring.",
        "If an app asks for too much, deny it or uninstall it.",
      ),
    ],
    task: t(
      "Ortiqcha so‘rovlarni belgilang.",
      "Tick the requests the app doesn’t need.",
    ),
    hint: t(
      "Fonar, kalkulyator, vidjet va kupon kengaytmasi.",
      "The torch, the calculator, the widget and the coupon extension.",
    ),
    widget: { type: "requests" },
  },
  {
    id: 4,
    group: CHOICES,
    title: t("Brauzer kengaytmalari", "Browser extensions"),
    minutes: 6,
    intro: t(
      "Brauzer kengaytmasi siz ochgan sahifalarni o‘qiy oladi — parollar, bank va pochta ham shu sahifalarda. Shuning uchun faqat rasmiy do‘kondan, ko‘p foydalanuvchili va ishonchli nashriyotchidan kengaytma o‘rnating, “barcha saytlar” huquqini faqat haqiqatan kerak bo‘lganda bering va ishlatmayotganlarini o‘chiring. Ba’zan mashhur kengaytma sotib olinadi va yangilanishda zararli kod qo‘shiladi.",
      "A browser extension can read the pages you open — and passwords, banking and email live on those pages. So install extensions only from the official store, with many users and a trusted publisher; grant “all sites” access only when it is really needed; and remove the ones you don’t use. Sometimes a popular extension is sold and harmful code arrives in an update.",
    ),
    analogy: t(
      "Kengaytma — elkangizdan qarab turgan yordamchi: kimligini bilishingiz kerak.",
      "An extension is a helper reading over your shoulder: you should know who it is.",
    ),
    theory: [
      t(
        "Chrome va Firefox’da kengaytmani “faqat bosilganda” ishlaydigan qilib qo‘yish mumkin.",
        "Chrome and Firefox let you set an extension to run only when clicked.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kam, ishonchli va kerakli.", "Few, trusted and needed."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kengaytma “barcha saytlardagi ma’lumotlarni o‘qish” huquqini so‘raydi. Bu nimani anglatadi?",
            "An extension asks to “read your data on all websites”. What does that mean?",
          ),
          options: [
            t(
              "U bank va pochta sahifalarini ham o‘qiy oladi",
              "It can read your bank and email pages too",
            ),
            t("Faqat rasmlarni ko‘radi", "It only sees images"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t("Bu juda keng huquq.", "That is a very broad grant."),
        },
        {
          ask: t(
            "Ishlatilmayotgan kengaytmalar bilan nima qilasiz?",
            "What do you do with extensions you don’t use?",
          ),
          options: [
            t("O‘chiraman", "Remove them"),
            t("Qoldiraman", "Keep them"),
            t("Yana o‘rnataman", "Install more"),
          ],
          answer: 0,
          explain: t(
            "Har bir kengaytma — qo‘shimcha xavf.",
            "Every extension adds risk.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: CHOICES,
    title: t("Xavfsiz va xavfli odatlar", "Safe and risky habits"),
    minutes: 5,
    intro: t(
      "Ruxsatlarni boshqarish bir martalik ish emas. Har bir odatni to‘g‘ri guruhga ajrating.",
      "Managing permissions isn’t a one-off job. Sort each habit into the right group.",
    ),
    analogy: t(
      "Uy kalitlarini kimga berganingizni vaqti-vaqti bilan tekshirish.",
      "Checking from time to time who has a key to your house.",
    ),
    theory: [
      t(
        "Android: Sozlamalar → Maxfiylik → Ruxsatlar boshqaruvi. iOS: Sozlamalar → Maxfiylik.",
        "Android: Settings → Privacy → Permission manager. iOS: Settings → Privacy.",
      ),
    ],
    task: t("Odatlarni ajrating.", "Sort the habits."),
    hint: t("Kam va kerakli — xavfsiz.", "Few and needed is safe."),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Safe") },
        { id: "risky", label: t("Xavfli", "Risky") },
      ],
      items: [
        {
          label: t(
            "“Faqat ishlatilayotganda” joylashuv",
            "Location “only while in use”",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Ruxsatlarni oyda bir marta ko‘rib chiqish",
            "Reviewing permissions once a month",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Faqat rasmiy do‘kondan o‘rnatish",
            "Installing only from the official store",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Har bir so‘rovga o‘ylamay “Ruxsat” bosish",
            "Tapping “Allow” on every request without thinking",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "Noma’lum ilovaga Accessibility berish",
            "Giving an unknown app Accessibility",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "Saytdan APK fayl yuklab o‘rnatish",
            "Installing an APK downloaded from a website",
          ),
          bucket: "risky",
        },
      ],
    },
  },
  {
    id: 6,
    group: CHOICES,
    title: t("Kompyuterda eng kam huquq", "Least privilege on a computer"),
    minutes: 5,
    intro: t(
      "Kompyuterda ham shu tamoyil: kundalik ish oddiy (administrator bo‘lmagan) hisobda qilinadi. Windows’da UAC oynasi dastur administrator huquqini so‘raganda ogohlantiradi; macOS dasturlarga fayl va kamera uchun ruxsat so‘raydi; Linux’da sudo faqat kerak bo‘lganda ishlatiladi. Oddiy hisobda ochilgan zararli fayl butun tizimni o‘zgartira olmaydi.",
      "The same principle applies on a computer: daily work happens in a standard (non-admin) account. On Windows the UAC prompt warns when a program asks for admin rights; macOS asks before apps reach files or the camera; on Linux sudo is used only when needed. A harmful file opened in a standard account can’t change the whole system.",
    ),
    analogy: t(
      "Ish joyida hamma bosh kalit bilan yurmaydi.",
      "At work, not everyone carries the master key.",
    ),
    theory: [
      t(
        "Administrator hisobini faqat o‘rnatish va sozlash uchun ishlating.",
        "Use the admin account only for installing and configuring.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Kundalik ish — oddiy hisobda.",
      "Daily work in a standard account.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kundalik ishni qaysi hisobda qilish kerak?",
            "Which account should daily work happen in?",
          ),
          options: [
            t("Oddiy (administrator emas)", "A standard (non-admin) one"),
            t("Administrator", "Administrator"),
            t("Mehmon hisobi bilan hamma", "Everyone in the guest account"),
          ],
          answer: 0,
          explain: t(
            "Xato yoki zararli fayl kamroq zarar qiladi.",
            "A mistake or a harmful file does less damage.",
          ),
        },
        {
          ask: t(
            "PDF ko‘ruvchi ochilganda UAC administrator huquqini so‘radi. Nima qilasiz?",
            "A PDF viewer triggers a UAC admin prompt when it opens. What do you do?",
          ),
          options: [
            t("Rad etaman va sababini tekshiraman", "Decline and find out why"),
            t("Har doim “Ha” bosaman", "Always click “Yes”"),
            t("UAC’ni o‘chiraman", "Turn UAC off"),
          ],
          answer: 0,
          explain: t(
            "PDF ko‘rish uchun administrator kerak emas.",
            "Viewing a PDF doesn’t need admin rights.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: CHOICES,
    title: t("Ruxsatlarni qayta ko‘rish", "Reviewing permissions"),
    minutes: 5,
    intro: t(
      "Vaqt o‘tishi bilan ilovalar ko‘payadi va ular olgan ruxsatlar unutiladi. Android ishlatilmagan ilovalarning ruxsatlarini avtomatik olib tashlaydi, iOS esa joylashuvdan qaysi ilova qachon foydalanganini ko‘rsatadi. Oyda bir marta ro‘yxatni ko‘rib chiqing: kerak bo‘lmagan ruxsatni olib tashlang, ishlatilmagan ilovani o‘chiring.",
      "Over time apps pile up and the permissions they were given are forgotten. Android removes permissions from unused apps automatically, and iOS shows which app used your location and when. Once a month, look through the list: revoke what isn’t needed and uninstall what you don’t use.",
    ),
    analogy: t(
      "Bahorgi tozalash: kerak bo‘lmagan narsalar uydan chiqariladi.",
      "Spring cleaning: things you don’t need leave the house.",
    ),
    theory: [
      t(
        "Kompaniyalarda MDM ruxsatlar va ilovalarni markaziy boshqaradi.",
        "In companies, MDM manages apps and permissions centrally.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Muntazam va kamaytirish.", "Regularly, and trimming."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ishlatilmagan ilovaning ruxsatlari bilan nima qilinadi?",
            "What happens to an unused app’s permissions?",
          ),
          options: [
            t(
              "Olib tashlanadi yoki ilova o‘chiriladi",
              "They are revoked, or the app is removed",
            ),
            t("Qoladi", "They stay"),
            t("Ko‘paytiriladi", "They are increased"),
          ],
          answer: 0,
          explain: t(
            "Ishlatilmagan huquq — keraksiz xavf.",
            "An unused grant is needless risk.",
          ),
        },
        {
          ask: t(
            "Kompaniya telefonlarida ruxsatlarni nima boshqaradi?",
            "What manages permissions on company phones?",
          ),
          options: [t("MDM", "MDM"), t("DNS", "DNS"), t("VPN", "VPN")],
          answer: 0,
          explain: t("Mobile Device Management.", "Mobile Device Management."),
        },
      ],
    },
  },
  {
    id: 8,
    group: CHOICES,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Har bir ilova o‘z sandbox’ida va faqat ishiga kerak bo‘lgan ruxsatni oladi. Eng kuchli ruxsatlar (Accessibility, qurilma administratori, barcha saytlar) — faqat ishonchli va haqiqatan kerak bo‘lgan ilovalarga. Kundalik ish — oddiy hisobda, ruxsatlar esa muntazam qayta ko‘riladi. Keyingi modul — muddati o‘tgan dasturlar.",
      "Every app lives in its sandbox and gets only what its job needs. The strongest permissions (Accessibility, device admin, all sites) go only to trusted apps that truly need them. Daily work happens in a standard account, and permissions get reviewed regularly. Next module: software past its end of life.",
    ),
    analogy: t(
      "Har bir xodimga faqat o‘z ishi uchun kalit.",
      "Each employee gets keys only for their own job.",
    ),
    theory: [
      t(
        "“Bu ilova nega shuni so‘rayapti?” — eng foydali savol.",
        "“Why does this app want that?” is the most useful question.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Kerakli, kam, ko‘rib chiqilgan.", "Needed, few, reviewed."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Fonar ilovasi kontaktlaringizni so‘radi. Nima qilasiz?",
            "A torch app asks for your contacts. What do you do?",
          ),
          options: [
            t("Rad etaman yoki o‘chiraman", "Deny it, or uninstall the app"),
            t("Ruxsat beraman", "Allow it"),
            t("Do‘stlarga ham tavsiya qilaman", "Recommend it to friends"),
          ],
          answer: 0,
          explain: t(
            "Chiroqqa kontakt kerak emas.",
            "A torch needs no contacts.",
          ),
        },
        {
          ask: t(
            "Sandbox’dan tashqariga chiqish uchun ilova nimaga muhtoj?",
            "What does an app need to reach outside its sandbox?",
          ),
          options: [
            t("Siz bergan ruxsatga", "A permission you grant"),
            t("Internetga", "The internet"),
            t("Katta ekranga", "A big screen"),
          ],
          answer: 0,
          explain: t("Qaror sizda.", "The decision is yours."),
        },
      ],
    },
  },
];
