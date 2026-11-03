// Academy Intermediate · Social engineering, module 2: Personal protection.
// The lessons use ./tools.ts: eight habits to review.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "habits" };

export const PROGRESS_KEY = "cybervalue:personal:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const ACCOUNTS = t("Hisoblar", "Accounts");
const DEVICES = t("Qurilmalar", "Devices");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: ACCOUNTS,
    title: t("Parollar", "Passwords"),
    minutes: 5,
    intro: t(
      "Eng ko‘p uchraydigan xato — bitta parolni ko‘p joyda ishlatish. Biror sayt sizib chiqsa, hujumchilar o‘sha email va parolni boshqa saytlarda avtomatik sinab ko‘radi (credential stuffing). Yaxshi parol uzun bo‘ladi: tasodifiy so‘zlardan iborat ibora (masalan, to‘rt-besh so‘z) murakkab, lekin qisqa paroldan kuchliroq. Har bir sayt uchun alohida parol — eng muhim qoida.",
      "The most common mistake is reusing one password in many places. When a site leaks, attackers automatically try the same email and password elsewhere (credential stuffing). A good password is long: a passphrase of random words (four or five, say) beats a short, complicated one. A different password for every site is the most important rule of all.",
    ),
    analogy: t(
      "Uy, mashina va ofis uchun bitta kalit — bittasini yo‘qotsangiz, hammasi ochiq.",
      "One key for your home, car and office — lose it once and everything is open.",
    ),
    theory: [
      t(
        "haveibeenpwned.com emailingiz qaysi sizishlarda borligini ko‘rsatadi.",
        "haveibeenpwned.com shows which breaches your email appears in.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Uzun va har joyda boshqa.", "Long, and different everywhere."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("Qaysi parol eng kuchli?", "Which password is the strongest?"),
          options: [
            t("olma-daryo-kitob-shamol-7", "apple-river-book-wind-7"),
            t("P@ss1", "P@ss1"),
            t("12345678", "12345678"),
          ],
          answer: 0,
          explain: t(
            "Uzunlik murakkablikdan muhimroq.",
            "Length matters more than complexity.",
          ),
        },
        {
          ask: t("Credential stuffing nima?", "What is credential stuffing?"),
          options: [
            t(
              "Sizib chiqqan parollarni boshqa saytlarda sinash",
              "Trying leaked passwords on other sites",
            ),
            t("Parolni uzaytirish", "Making a password longer"),
            t("Parolni shifrlash", "Encrypting a password"),
          ],
          answer: 0,
          explain: t(
            "Takroriy parollar shuning uchun xavfli.",
            "That is why reused passwords are dangerous.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: ACCOUNTS,
    title: t("Parol menejeri", "Password managers"),
    minutes: 5,
    intro: t(
      "Yuzlab alohida parolni eslab qolish mumkin emas — buni parol menejeri qiladi (Bitwarden, 1Password, KeePassXC yoki brauzerning o‘zi). Siz faqat bitta uzun asosiy iborani eslaysiz, qolganini menejer yaratadi va to‘ldiradi. Bonusi: menejer parolni faqat haqiqiy saytda to‘ldiradi, o‘xshatilgan phishing saytida esa yo‘q — bu ham himoya.",
      "Nobody can remember hundreds of different passwords — a password manager does it for you (Bitwarden, 1Password, KeePassXC or the browser’s own). You remember one long master passphrase; the manager creates and fills in the rest. Bonus: it only fills on the real site, not on a look-alike phishing site — a protection in itself.",
    ),
    analogy: t(
      "Barcha kalitlarni bitta mustahkam seyfda saqlash.",
      "Keeping all your keys in one strong safe.",
    ),
    theory: [
      t(
        "Parol menejerining o‘zida ham MFA yoqing.",
        "Turn on MFA for the password manager itself.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Bitta asosiy ibora.", "One master passphrase."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Parol menejeri bilan nechta parolni eslaysiz?",
            "With a password manager, how many passwords do you remember?",
          ),
          options: [
            t("Bittasini — asosiy iborani", "One — the master passphrase"),
            t("Hammasini", "All of them"),
            t("Hech birini", "None"),
          ],
          answer: 0,
          explain: t(
            "Qolganlarini menejer tasodifiy yaratadi.",
            "The manager generates the rest at random.",
          ),
        },
        {
          ask: t(
            "Menejer parolni to‘ldirmadi. Bu nimani anglatishi mumkin?",
            "The manager didn’t fill in your password. What might that mean?",
          ),
          options: [
            t(
              "Sayt haqiqiy emas — o‘xshatilgan bo‘lishi mumkin",
              "The site isn’t the real one — it may be a look-alike",
            ),
            t("Parolni qo‘lda kiritish kerak", "Type it in by hand"),
            t("Hech narsa", "Nothing"),
          ],
          answer: 0,
          explain: t("Manzil satrini tekshiring.", "Check the address bar."),
        },
      ],
    },
  },
  {
    id: 3,
    group: ACCOUNTS,
    title: t("MFA va tiklash", "MFA and recovery"),
    minutes: 6,
    intro: t(
      "Ikki bosqichli tasdiqlash (MFA) parol o‘g‘irlansa ham hisobni himoya qiladi. Eng kuchlisi — passkey yoki xavfsizlik kaliti (phishing’ga chidamli), keyin autentifikator ilovasi, eng zaifi — SMS (SIM almashtirish mumkin), lekin u ham MFA’siz holatdan ancha yaxshi. Avval eng muhim hisoblarda yoqing: pochta (boshqa hisoblarni tiklash kaliti), bank, parol menejeri. Tiklash kodlarini xavfsiz joyda saqlang.",
      "Multi-factor authentication (MFA) protects an account even if the password is stolen. The strongest is a passkey or security key (phishing-resistant), then an authenticator app; the weakest is SMS (SIM swaps happen), though it is still far better than nothing. Turn it on for the most important accounts first: email (the reset key for everything else), your bank, and the password manager. Keep recovery codes somewhere safe.",
    ),
    analogy: t(
      "Kalit va qorovul: kalit o‘g‘irlansa ham, qorovul sizni taniydi.",
      "A key and a guard: even if the key is stolen, the guard knows your face.",
    ),
    theory: [
      t(
        "MFA so‘rovini o‘zingiz kirmagan paytda tasdiqlamang (MFA fatigue).",
        "Never approve an MFA prompt when you aren’t signing in (MFA fatigue).",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Avval pochta.", "Email first."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "MFA’ni birinchi navbatda qayerda yoqasiz?",
            "Where do you turn on MFA first?",
          ),
          options: [
            t("Asosiy pochtada", "Your main email"),
            t("O‘yin forumida", "A gaming forum"),
            t("Ob-havo saytida", "A weather site"),
          ],
          answer: 0,
          explain: t(
            "Pochta orqali boshqa parollar tiklanadi.",
            "Other passwords are reset through email.",
          ),
        },
        {
          ask: t(
            "Hech qayerga kirmayapsiz, lekin MFA so‘rovi keldi. Nima qilasiz?",
            "You aren’t signing in, but an MFA prompt arrives. What do you do?",
          ),
          options: [
            t(
              "Rad etaman va parolni o‘zgartiraman",
              "Deny it and change the password",
            ),
            t("Tasdiqlayman", "Approve it"),
            t("E’tibor bermayman", "Ignore it"),
          ],
          answer: 0,
          explain: t(
            "Kimdir parolingizni biladi.",
            "Someone knows your password.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: DEVICES,
    title: t("Odatlarni ko‘rib chiqish", "Reviewing habits"),
    minutes: 7,
    intro: t(
      "Quyida Azizning sakkizta xavfsizlik odati. Ulardan to‘rttasini tuzatish kerak. Har birini o‘qing: parol takrorlanadimi, eng muhim hisob himoyalanganmi, qurilmalar yangilanganmi va zavod sozlamalari qolganmi?",
      "Below are eight of Aziz’s security habits. Four of them need fixing. Read each one: is a password reused, is the most important account protected, are devices up to date, and are factory settings still in place?",
    ),
    analogy: t(
      "Uyni tekshirish: eshik qulflanganmi, deraza yopiqmi, kalit gilam ostida emasmi.",
      "Checking a house: is the door locked, the window shut, the key not under the mat?",
    ),
    theory: [
      t(
        "Har yili bir marta shunday ro‘yxat bilan o‘zingizni tekshiring.",
        "Run through a list like this once a year.",
      ),
    ],
    task: t(
      "Tuzatish kerak bo‘lgan odatlarni belgilang.",
      "Tick the habits that need fixing.",
    ),
    hint: t(
      "Takroriy parol, MFA’siz pochta, eski telefon, zavod paroli.",
      "A reused password, email without MFA, an old phone, a factory password.",
    ),
    widget: { type: "habits" },
  },
  {
    id: 5,
    group: DEVICES,
    title: t("Yangilanishlar", "Updates"),
    minutes: 5,
    intro: t(
      "Yangilanish kelganda, uning ichida ko‘pincha xavfsizlik tuzatishlari bo‘ladi. Tuzatish chiqqach, hujumchilar zaiflikni tez o‘rganib oladi va yangilanmagan qurilmalarni qidiradi. Shuning uchun telefon, kompyuter, brauzer va ilovalarda avtomatik yangilanishni yoqing. Ishlab chiqaruvchi endi yangilanish bermaydigan qurilma (masalan, eski router) almashtirilishi kerak.",
      "Updates often contain security fixes. Once a fix is out, attackers study the flaw quickly and hunt for devices that haven’t updated. So turn on automatic updates for your phone, computer, browser and apps. A device the maker no longer updates (an old router, for example) should be replaced.",
    ),
    analogy: t(
      "Teshik topilgan devorni darhol yamash — o‘g‘rilar ham teshikni bilib olgan.",
      "Patching a hole in the wall at once — the burglars know about it too.",
    ),
    theory: [
      t(
        "Faqat rasmiy do‘konlardan (App Store, Google Play) ilova o‘rnating.",
        "Install apps only from official stores (App Store, Google Play).",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Avtomatik yangilanish.", "Automatic updates."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Nega yangilanishni kechiktirish xavfli?",
            "Why is putting off updates risky?",
          ),
          options: [
            t(
              "Ma’lum zaifliklar ochiq qoladi",
              "Known vulnerabilities stay open",
            ),
            t("Telefon og‘irlashadi", "The phone gets heavier"),
            t("Xavfli emas", "It isn’t"),
          ],
          answer: 0,
          explain: t(
            "Tuzatish chiqqach, zaiflik hammaga ma’lum bo‘ladi.",
            "Once a fix is out, the flaw is public.",
          ),
        },
        {
          ask: t(
            "Router endi yangilanish olmaydi. Nima qilasiz?",
            "Your router no longer gets updates. What do you do?",
          ),
          options: [
            t("Yangisiga almashtiraman", "Replace it"),
            t("Shunday qoldiraman", "Leave it as it is"),
            t(
              "O‘chirib qo‘yaman va internetsiz yashayman",
              "Unplug it and live offline",
            ),
          ],
          answer: 0,
          explain: t(
            "Yangilanmaydigan qurilma — doimiy teshik.",
            "A device without updates is a permanent hole.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: DEVICES,
    title: t("Zaxira nusxalar", "Backups"),
    minutes: 5,
    intro: t(
      "Telefon yo‘qolishi, disk buzilishi yoki ransomware fayllarni shifrlab qo‘yishi mumkin. Zaxira nusxa — yagona ishonchli javob. 3-2-1 qoidasi: ma’lumotning 3 nusxasi, 2 xil joyda, 1 tasi uydan tashqarida (masalan, bulutda). Tashqi diskni zaxiradan keyin uzib qo‘ying — shunda ransomware unga yetib bormaydi. Va vaqti-vaqti bilan biror faylni tiklab ko‘ring.",
      "A phone can be lost, a disk can fail, or ransomware can encrypt your files. A backup is the only reliable answer. The 3-2-1 rule: 3 copies of your data, on 2 different kinds of storage, 1 of them away from home (in the cloud, for example). Unplug the external disk after backing up so ransomware can’t reach it. And now and then, try restoring a file.",
    ),
    analogy: t(
      "Muhim hujjatlarning nusxasini qarindoshingiznikida saqlash.",
      "Keeping copies of important papers at a relative’s house.",
    ),
    theory: [
      t(
        "Bulut sinxronizatsiyasi zaxira emas: o‘chirilgan fayl hamma joyda o‘chadi.",
        "Cloud sync isn’t a backup: delete a file and it disappears everywhere.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("3-2-1.", "3-2-1."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "3-2-1 qoidasidagi “1” nima?",
            "What is the “1” in the 3-2-1 rule?",
          ),
          options: [
            t("Bitta nusxa uydan tashqarida", "One copy away from home"),
            t("Bitta parol", "One password"),
            t("Yiliga bir marta", "Once a year"),
          ],
          answer: 0,
          explain: t(
            "Yong‘in yoki o‘g‘irlik hammasini birdan yo‘q qilmasin.",
            "So a fire or theft can’t take everything at once.",
          ),
        },
        {
          ask: t(
            "Nega tashqi diskni zaxiradan keyin uzish kerak?",
            "Why unplug the external disk after a backup?",
          ),
          options: [
            t(
              "Ransomware unga yetib bormasligi uchun",
              "So ransomware can’t reach it",
            ),
            t("Disk tezroq ishlashi uchun", "So the disk runs faster"),
            t("Kerak emas", "You don’t need to"),
          ],
          answer: 0,
          explain: t(
            "Ulanib turgan disk ham shifrlanadi.",
            "A connected disk gets encrypted too.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: DEVICES,
    title: t("Shaxsiy reja", "A personal plan"),
    minutes: 5,
    intro: t(
      "Hammasini birdaniga qilish shart emas. Eng ko‘p foyda beradigan tartib: 1) pochtada MFA, 2) parol menejeri va takroriy parollarni almashtirish, 3) avtomatik yangilanishlar, 4) zaxira nusxa, 5) router va boshqa qurilmalarning zavod parollarini almashtirish. Har bir qadamni to‘g‘ri guruhga ajrating.",
      "You don’t have to do it all at once. The order that pays off most: 1) MFA on email, 2) a password manager and replacing reused passwords, 3) automatic updates, 4) backups, 5) changing factory passwords on the router and other devices. Sort each step into the right group.",
    ),
    analogy: t(
      "Ta’mirni eng ko‘p chakkalayotgan joydan boshlash.",
      "Fixing the roof where it leaks most first.",
    ),
    theory: [
      t(
        "Oila a’zolaringizga ham shu rejani tuzishda yordam bering.",
        "Help your family make the same plan.",
      ),
    ],
    task: t("Qadamlarni ajrating.", "Sort the steps."),
    hint: t(
      "Pochta va parollar — birinchi.",
      "Email and passwords come first.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "first", label: t("Birinchi navbatda", "Do first") },
        { id: "later", label: t("Keyinroq", "Later") },
      ],
      items: [
        { label: t("Pochtada MFA", "MFA on email"), bucket: "first" },
        {
          label: t(
            "Takroriy parollarni almashtirish",
            "Replacing reused passwords",
          ),
          bucket: "first",
        },
        {
          label: t(
            "Parol menejerini o‘rnatish",
            "Setting up a password manager",
          ),
          bucket: "first",
        },
        {
          label: t(
            "Aqlli lampaning zavod parolini almashtirish",
            "Changing a smart bulb’s factory password",
          ),
          bucket: "later",
        },
        {
          label: t(
            "Eski forum hisobini o‘chirish",
            "Deleting an old forum account",
          ),
          bucket: "later",
        },
        {
          label: t(
            "Ijtimoiy tarmoq profilini yopiq qilish",
            "Making a social media profile private",
          ),
          bucket: "later",
        },
      ],
    },
  },
  {
    id: 8,
    group: DEVICES,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Shaxsiy himoya besh odatga sig‘adi: har joyda boshqa parol (menejer bilan), muhim hisoblarda MFA, avtomatik yangilanishlar, 3-2-1 zaxira va zavod sozlamalarini almashtirish. Bular ish joyida ham xuddi shunday ishlaydi. Keyingi modul — xabardorlik dasturlari: shu odatlarni butun jamoaga qanday o‘rgatish.",
      "Personal protection comes down to five habits: a different password everywhere (with a manager), MFA on important accounts, automatic updates, 3-2-1 backups and changing factory settings. They work exactly the same at work. Next module: awareness programmes — how to teach these habits to a whole team.",
    ),
    analogy: t(
      "Tish yuvish kabi: har kuni, oddiy, lekin foydasi katta.",
      "Like brushing your teeth: simple and daily, but it pays off.",
    ),
    theory: [
      t(
        "Mukammallik shart emas — har bir qadam xavfni kamaytiradi.",
        "You don’t need perfection — every step reduces the risk.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Menejer, MFA, yangilanish, zaxira.",
      "A manager, MFA, updates, backups.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi MFA usuli phishing’ga eng chidamli?",
            "Which MFA method resists phishing best?",
          ),
          options: [
            t("Passkey yoki xavfsizlik kaliti", "A passkey or security key"),
            t("SMS kod", "An SMS code"),
            t("Email kod", "An email code"),
          ],
          answer: 0,
          explain: t(
            "U faqat haqiqiy sayt bilan ishlaydi.",
            "It only works with the real site.",
          ),
        },
        {
          ask: t(
            "Bulut sinxronizatsiyasi zaxira o‘rnini bosadimi?",
            "Does cloud sync replace a backup?",
          ),
          options: [
            t(
              "Yo‘q, o‘chirilgan fayl hamma joyda o‘chadi",
              "No, a deleted file disappears everywhere",
            ),
            t("Ha, har doim", "Yes, always"),
            t("Faqat rasmlar uchun", "Only for photos"),
          ],
          answer: 0,
          explain: t(
            "Zaxira — alohida, versiyali nusxa.",
            "A backup is a separate, versioned copy.",
          ),
        },
      ],
    },
  },
];
