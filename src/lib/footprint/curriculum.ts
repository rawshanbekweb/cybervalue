// Academy Intermediate · OSINT, module 5: Digital footprint. The lessons use
// ./tools.ts: a self-audit of an invented student's public traces.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "audit" };

export const PROGRESS_KEY = "cybervalue:footprint:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const SEE = t("Ko‘rish", "Seeing it");
const SHRINK = t("Kamaytirish", "Shrinking it");
const KEEP = t("Saqlash", "Keeping it small");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: SEE,
    title: t("Faol va passiv iz", "Active and passive traces"),
    minutes: 6,
    intro: t(
      "Raqamli iz — internetda siz haqingizda qolgan hamma narsa. Faol iz — o‘zingiz qoldirganingiz: postlar, izohlar, profil. Passiv iz — sizning xabaringizsiz yig‘ilgani: saytlar cookie’lari, ilovalar joylashuvi, do‘stlar belgilagan suratlar, ma’lumot brokerlari bazalari. Bu modulda OSINT usullarini o‘zingizga qo‘llaysiz.",
      "Your digital footprint is everything about you left online. Active traces are what you leave yourself: posts, comments, profiles. Passive traces are gathered without you noticing: site cookies, app location data, photos friends tag you in, data-broker databases. In this module you turn OSINT methods on yourself.",
    ),
    analogy: t(
      "Qordagi izlar: ba’zilarini o‘zingiz ko‘rasiz, ba’zilarini orqangizdan boshqalar ko‘radi.",
      "Footprints in snow: some you see yourself, others are only seen by whoever walks behind you.",
    ),
    theory: [
      t(
        "O‘z izingizni tekshirish — ruxsat talab qilmaydigan yagona to‘liq OSINT ishi.",
        "Auditing yourself is the one full OSINT job that needs nobody’s permission.",
      ),
    ],
    task: t(
      "Har bir iz faolmi yoki passivmi?",
      "Is each trace active or passive?",
    ),
    hint: t("O‘zingiz yozgan — faol.", "What you wrote yourself is active."),
    widget: {
      type: "sort",
      buckets: [
        { id: "active", label: t("Faol", "Active") },
        { id: "passive", label: t("Passiv", "Passive") },
      ],
      items: [
        {
          label: t("Instagram’dagi postingiz", "Your Instagram post"),
          bucket: "active",
        },
        {
          label: t("Forumdagi izohingiz", "Your forum comment"),
          bucket: "active",
        },
        {
          label: t("GitHub profilingiz", "Your GitHub profile"),
          bucket: "active",
        },
        {
          label: t(
            "Do‘stingiz sizni belgilagan surat",
            "A photo a friend tagged you in",
          ),
          bucket: "passive",
        },
        {
          label: t(
            "Ilova yig‘gan joylashuv tarixi",
            "Location history an app collected",
          ),
          bucket: "passive",
        },
        {
          label: t(
            "Sizib chiqqan bazadagi emailingiz",
            "Your email in a leaked database",
          ),
          bucket: "passive",
        },
      ],
    },
  },
  {
    id: 2,
    group: SEE,
    title: t("Bitta nom — hamma akkauntlar", "One handle, every account"),
    minutes: 6,
    intro: t(
      "Ko‘pchilik hamma joyda bir xil foydalanuvchi nomidan foydalanadi. Sherlock va WhatsMyName kabi vositalar bitta nomni yuzlab saytlarda tekshiradi — va sizning eski forum, o‘yin va ijtimoiy tarmoq akkauntlaringizni bir zanjirga bog‘laydi. Bir xil avatar va “bio” ham shunday qiladi.",
      "Most people use the same username everywhere. Tools such as Sherlock and WhatsMyName check one handle across hundreds of sites — and chain your old forum, gaming and social accounts together. The same avatar and bio do the same.",
    ),
    analogy: t(
      "Har bir eshikda bir xil kalit — bitta kalit topilsa, hammasi ochiladi.",
      "The same key for every door — find one and they all open.",
    ),
    theory: [
      t(
        "O‘zingizni qidiring: nomingiz, foydalanuvchi nomingiz, telefon va email bilan — qo‘shtirnoqda.",
        "Search yourself: your name, your handle, your phone and your email — in quotes.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Bir xil nom — bog‘lovchi ip.",
      "A shared handle is the thread that links.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Nega hamma joyda bir xil foydalanuvchi nomi xavfli?",
            "Why is one username everywhere risky?",
          ),
          options: [
            t(
              "Barcha akkauntlar bir odamga bog‘lanadi, eski sirlar ham",
              "Every account links back to one person, old secrets included",
            ),
            t("Xavfli emas", "It isn’t"),
            t("Saytlar sekinlashadi", "Sites slow down"),
          ],
          answer: 0,
          explain: t(
            "Bitta xato hamma akkauntni oshkor qiladi.",
            "One slip exposes every account.",
          ),
        },
        {
          ask: t(
            "Bitta nomni ko‘p saytda tekshiradigan vosita?",
            "A tool that checks one handle across many sites?",
          ),
          options: [
            t("Sherlock", "Sherlock"),
            t("Wireshark", "Wireshark"),
            t("exiftool", "exiftool"),
          ],
          answer: 0,
          explain: t("WhatsMyName ham shunday.", "WhatsMyName does the same."),
        },
      ],
    },
  },
  {
    id: 3,
    group: SHRINK,
    title: t("O‘zingizni tekshirish", "Auditing yourself"),
    minutes: 12,
    intro: t(
      "17 yoshli Sardor o‘zini tekshirdi va oltita topilma chiqdi. Har biri uchun to‘g‘ri qadamni tanlang: yashirish yoki o‘chirish, akkauntni himoyalash (parol, 2FA) yoki qoldirish. Hamma narsani o‘chirish shart emas — ba’zi izlar foydali.",
      "Sardor, 17, ran a self-audit and found six things. Choose the right step for each: hide or delete it, secure the account (password, 2FA), or keep it. Not everything has to go — some traces help.",
    ),
    analogy: t(
      "Uyni tozalash: ba’zi narsalar axlatga, ba’zilari qulfli qutiga, ba’zilari javonda qoladi.",
      "Tidying a room: some things go in the bin, some in a locked box, some stay on the shelf.",
    ),
    theory: [
      t(
        "Savol: “Bu ma’lumot begonaga meni topish, aldash yoki akkauntimga kirishga yordam beradimi?”",
        "Ask: “Would this help a stranger find me, trick me or get into my accounts?”",
      ),
    ],
    task: t(
      "Oltita topilmaning har biri uchun to‘g‘ri qadamni tanlang.",
      "Choose the right step for all six findings.",
    ),
    hint: t("Ikkitasini qoldirsa bo‘ladi.", "Two of them can stay."),
    widget: { type: "audit" },
  },
  {
    id: 4,
    group: SHRINK,
    title: t("Sizib chiqishlar", "Breaches"),
    minutes: 6,
    intro: t(
      "Saytlar buziladi va foydalanuvchilar bazasi sizib chiqadi. haveibeenpwned.com emailingiz qaysi sizib chiqishlarda borligini ko‘rsatadi. Eng katta xavf — bir xil parolni ko‘p joyda ishlatish: hujumchi sizib chiqqan parolni boshqa saytlarda sinaydi (credential stuffing).",
      "Sites get breached and their user databases leak. haveibeenpwned.com shows which breaches your email is in. The biggest danger is reusing a password: attackers try leaked passwords on other sites (credential stuffing).",
    ),
    analogy: t(
      "Bitta kalit yo‘qolsa, faqat o‘sha eshik qulfini almashtirish — agar har eshikda alohida kalit bo‘lsa.",
      "Lose one key and you change only that lock — if every door had its own key.",
    ),
    theory: [
      t(
        "Parol menejeri har sayt uchun uzun, tasodifiy parol yaratadi va eslab qoladi.",
        "A password manager makes and remembers a long random password for each site.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Bitta parol — bitta sayt.", "One password, one site."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Emailingiz sizib chiqishda topildi. Birinchi qadam?",
            "Your email turned up in a breach. The first step?",
          ),
          options: [
            t(
              "O‘sha parolni hamma joyda almashtirish va 2FA yoqish",
              "Change that password everywhere and turn on 2FA",
            ),
            t("Emailni o‘chirish", "Delete the email account"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Hujumchi aynan shu parolni sinaydi.",
            "That password is what attackers will try.",
          ),
        },
        {
          ask: t("Credential stuffing nima?", "What is credential stuffing?"),
          options: [
            t(
              "Sizib chiqqan login va parollarni boshqa saytlarda sinash",
              "Trying leaked logins and passwords on other sites",
            ),
            t("Parolni unutish", "Forgetting a password"),
            t("Kuchli parol yaratish", "Making a strong password"),
          ],
          answer: 0,
          explain: t(
            "Takroriy parol — ochiq eshik.",
            "A reused password is an open door.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: SHRINK,
    title: t("Maxfiylik sozlamalari", "Privacy settings"),
    minutes: 6,
    intro: t(
      "Ko‘p ilovalarda standart sozlamalar ochiq: profil hammaga ko‘rinadi, telefon raqam bo‘yicha topish mumkin, suratlarda joylashuv saqlanadi. Har bir ilovada bir marta sozlamalarni ko‘rib chiqing — 10 daqiqa ko‘p xavfni yopadi.",
      "Many apps start with open settings: the profile is public, people can find you by phone number, photos keep their location. Go through each app’s settings once — ten minutes closes a lot of risk.",
    ),
    analogy: t(
      "Yangi uyga ko‘chganda birinchi ish — qulflarni tekshirish.",
      "The first thing in a new home is checking the locks.",
    ),
    theory: [
      t(
        "Telefon kamerasida joylashuvni o‘chirish — barcha yangi suratlardan GPS’ni olib tashlaydi.",
        "Turning location off in the phone camera removes GPS from every new photo.",
      ),
    ],
    task: t(
      "Har bir sozlamani o‘zgartirish kerakmi yoki u allaqachon to‘g‘rimi?",
      "Should each setting be changed, or is it already right?",
    ),
    hint: t(
      "Ochiq va topiladigan — o‘zgartiring.",
      "Public and findable — change it.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "change", label: t("O‘zgartirish kerak", "Change it") },
        { id: "fine", label: t("To‘g‘ri", "Already right") },
      ],
      items: [
        {
          label: t(
            "Kamerada “joylashuvni saqlash” yoqilgan",
            "“Save location” is on in the camera",
          ),
          bucket: "change",
        },
        {
          label: t(
            "Telegram’da raqam “Hamma”ga ko‘rinadi",
            "Telegram shows your number to “Everybody”",
          ),
          bucket: "change",
        },
        {
          label: t(
            "Do‘stlar ro‘yxati hammaga ochiq",
            "Your friends list is public",
          ),
          bucket: "change",
        },
        {
          label: t(
            "Ikki bosqichli tasdiq yoqilgan",
            "Two-step verification is on",
          ),
          bucket: "fine",
        },
        {
          label: t(
            "Profil faqat do‘stlarga ko‘rinadi",
            "The profile is visible to friends only",
          ),
          bucket: "fine",
        },
      ],
    },
  },
  {
    id: 6,
    group: KEEP,
    title: t("O‘chirishni so‘rash", "Asking for removal"),
    minutes: 6,
    intro: t(
      "O‘zingiz o‘chira olmaydigan ma’lumot uchun egasidan so‘rash mumkin: sayt administratori, qidiruv tizimi (Google’ning “Results about you” xizmati), ma’lumot brokeri. Shaxsga doir ma’lumotlar qonunlari (O‘zbekistonda 2019-yilgi qonun, Yevropada GDPR) shaxsga o‘z ma’lumotini o‘chirishni talab qilish huquqini beradi.",
      "For what you can’t delete yourself, ask whoever holds it: the site’s administrator, a search engine (Google’s “Results about you”), a data broker. Personal-data laws (Uzbekistan’s 2019 law, the GDPR in Europe) give people the right to ask for their data to be deleted.",
    ),
    analogy: t(
      "Gazetadagi noto‘g‘ri e’lonni olib tashlashni muharrirdan so‘rash.",
      "Asking the editor to take down a wrong notice in the paper.",
    ),
    theory: [
      t(
        "Internet hech narsani to‘liq unutmaydi: arxivlar va skrinshotlar qolishi mumkin. Eng yaxshi himoya — joylashdan oldin o‘ylash.",
        "The internet never fully forgets: archives and screenshots may remain. The best protection is thinking before posting.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Egasidan so‘rang; qonun sizning tomonda.",
      "Ask the holder; the law is on your side.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Eski forumda telefon raqamingiz bor, akkauntga kira olmaysiz. Nima qilasiz?",
            "An old forum shows your phone number and you can’t log in. What do you do?",
          ),
          options: [
            t(
              "Forum administratoriga o‘chirish so‘rovini yuborasiz",
              "Send the forum’s administrator a removal request",
            ),
            t("Forumni buzasiz", "Hack the forum"),
            t("Hech narsa qilib bo‘lmaydi", "Nothing can be done"),
          ],
          answer: 0,
          explain: t(
            "Qonun shaxsga o‘chirishni so‘rash huquqini beradi.",
            "The law gives you the right to ask.",
          ),
        },
        {
          ask: t(
            "Post o‘chirildi. U endi butunlay yo‘qmi?",
            "A post was deleted. Is it gone for good?",
          ),
          options: [
            t(
              "Shart emas — arxiv yoki skrinshot qolishi mumkin",
              "Not necessarily — an archive or screenshot may remain",
            ),
            t("Ha, butunlay", "Yes, completely"),
            t("Faqat bir kunga", "Only for a day"),
          ],
          answer: 0,
          explain: t("Joylashdan oldin o‘ylang.", "Think before you post."),
        },
      ],
    },
  },
  {
    id: 7,
    group: KEEP,
    title: t("Reja tuzish", "Making a plan"),
    minutes: 6,
    intro: t(
      "Iz kamaytirish — bir martalik ish emas. Avval eng xavflisi: qayta ishlatilgan parollar, ochiq telefon va manzil, joylashuv. Keyin — eski akkauntlarni yopish va sozlamalar. Har 6 oyda o‘zingizni qayta qidiring.",
      "Shrinking your footprint isn’t a one-off. Start with the riskiest: reused passwords, a public phone or address, location sharing. Then close old accounts and fix settings. Search yourself again every six months.",
    ),
    analogy: t(
      "Shifokor ko‘rigi: bir marta emas, muntazam.",
      "A check-up: not once, but regularly.",
    ),
    theory: [
      t(
        "Google Alerts’ga ismingizni qo‘ying — yangi narsa chiqsa, xabar keladi.",
        "Put your name into Google Alerts — you’ll hear when something new appears.",
      ),
    ],
    task: t(
      "Har bir qadamni bugun qilish kerakmi yoki shu oy ichida?",
      "Should each step happen today, or this month?",
    ),
    hint: t(
      "Akkaunt xavfi va joylashuv — bugun.",
      "Account risk and location — today.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "today", label: t("Bugun", "Today") },
        { id: "month", label: t("Shu oy", "This month") },
      ],
      items: [
        {
          label: t(
            "Sizib chiqqan parolni almashtirish",
            "Change the leaked password",
          ),
          bucket: "today",
        },
        {
          label: t(
            "Asosiy akkauntlarda 2FA yoqish",
            "Turn on 2FA on main accounts",
          ),
          bucket: "today",
        },
        {
          label: t("Telefon raqamini yashirish", "Hide your phone number"),
          bucket: "today",
        },
        {
          label: t(
            "Eski o‘yin akkauntlarini o‘chirish",
            "Delete old gaming accounts",
          ),
          bucket: "month",
        },
        {
          label: t(
            "Eski suratlardagi belgilarni ko‘rib chiqish",
            "Review tags on old photos",
          ),
          bucket: "month",
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
      "Modulni va butun OSINT domenini takrorlaymiz: faol va passiv iz, foydalanuvchi nomi, o‘z-o‘zini tekshirish, sizib chiqishlar, sozlamalar, o‘chirish so‘rovlari va reja.",
      "A review of the module and the whole OSINT domain: active and passive traces, usernames, self-audit, breaches, settings, removal requests and the plan.",
    ),
    analogy: t(
      "Boshqalarni o‘rganishni bilgan odam o‘zini ham himoya qila oladi.",
      "Whoever knows how to research others can protect themselves.",
    ),
    theory: [
      t(
        "Tabriklaymiz: OSINT domeni tugadi.",
        "Congratulations: the OSINT domain is done.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t("Bitta parol — bitta sayt.", "One password, one site."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Do‘stingiz sizni belgilagan surat — qanday iz?",
            "A photo a friend tagged you in is which kind of trace?",
          ),
          options: [
            t("Passiv", "Passive"),
            t("Faol", "Active"),
            t("Iz emas", "Not a trace"),
          ],
          answer: 0,
          explain: t(
            "Siz joylamagansiz, lekin u siz haqingizda.",
            "You didn’t post it, but it is about you.",
          ),
        },
        {
          ask: t(
            "Har kungi bir xil geoteg nimani oshkor qiladi?",
            "What does the same geotag every day give away?",
          ),
          options: [
            t(
              "Kundalik yo‘lingiz va joyingizni",
              "Your daily route and whereabouts",
            ),
            t("Hech narsani", "Nothing"),
            t("Faqat ob-havoni", "Only the weather"),
          ],
          answer: 0,
          explain: t(
            "Begona sizni qayerdan topishni biladi.",
            "A stranger learns where to find you.",
          ),
        },
        {
          ask: t("Qaysi iz qolsa bo‘ladi?", "Which trace can stay?"),
          options: [
            t(
              "Maktab saytidagi olimpiada yutug‘i haqidagi xabar",
              "A school-site note about an olympiad win",
            ),
            t("Ochiq telefon raqami", "A public phone number"),
            t("Uy manzili bilan rezyume", "A CV with your home address"),
          ],
          answer: 0,
          explain: t(
            "Unda sizni topish yoki aldashga yordam beradigan narsa yo‘q.",
            "Nothing in it helps anyone find or trick you.",
          ),
        },
        {
          ask: t(
            "O‘zingizni qanchalik tez-tez qidirish kerak?",
            "How often should you search yourself?",
          ),
          options: [
            t("Har 6 oyda", "Every six months"),
            t("Hech qachon", "Never"),
            t("Faqat bir marta", "Just once"),
          ],
          answer: 0,
          explain: t("Iz doim o‘sib boradi.", "A footprint keeps growing."),
        },
      ],
    },
  },
];
