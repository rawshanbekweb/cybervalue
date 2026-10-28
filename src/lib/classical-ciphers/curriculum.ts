// Academy Intermediate · Cryptography, module 1: classical ciphers. The
// student breaks a Caesar message by trying every key, then by counting
// letters, and reads a Vigenère message from a known first word (./tools.ts).
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "caesar" } | { type: "freq" } | { type: "vigenere" };

export const PROGRESS_KEY = "cybervalue:classic:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const SHIFT = t("Siljitish shifrlari", "Shift ciphers");
const POLY = t("Ko‘p alifboli shifrlar", "Many-alphabet ciphers");
const LESSONS_TODAY = t("Bugungi saboq", "The lesson for today");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: SHIFT,
    title: t("Sezar shifrini buzish", "Breaking a Caesar cipher"),
    minutes: 8,
    intro: t(
      "Sezar shifri har bir harfni alifboda bir xil songa suradi: 3 bo‘lsa, a → d, b → e. Kalit — shu son. Ingliz-lotin alifbosida faqat 25 ta foydali kalit bor, shuning uchun hujumchi hammasini sinab ko‘radi.",
      "A Caesar cipher moves every letter the same number of places along the alphabet: with 3, a → d and b → e. The key is that number. The Latin alphabet has only 25 useful keys, so an attacker simply tries them all.",
    ),
    analogy: t(
      "Uch xonali emas, bir xonali kodli qulf: 0 dan 9 gacha aylantirib chiqishga bir daqiqa ham ketmaydi.",
      "A lock with a one-digit code instead of three: turning it through 0 to 9 takes less than a minute.",
    ),
    theory: [
      t(
        "Barcha kalitlarni sinash brute force deyiladi. Kalitlar soni kichik bo‘lsa, shifr hech narsani himoya qilmaydi.",
        "Trying every key is called brute force. When there are few keys, the cipher protects nothing.",
      ),
      t(
        "Zamonaviy shifrlarda kalitlar soni 2¹²⁸ va undan ko‘p — ularni sinab chiqishga koinot yoshi ham yetmaydi.",
        "Modern ciphers have 2¹²⁸ keys or more — not even the age of the universe is enough to try them.",
      ),
    ],
    task: t(
      "Siljishni o‘zgartirib, xabar o‘qiladigan matnga aylanadigan kalitni toping.",
      "Change the shift until the message turns into readable text.",
    ),
    hint: t(
      "Birinchi so‘z “uchrashuv” bo‘lishi kerak.",
      "The first word should be “uchrashuv” (meeting).",
    ),
    widget: { type: "caesar" },
  },
  {
    id: 2,
    group: SHIFT,
    title: t("Kalit ko‘p bo‘lsa yetarlimi?", "Are many keys enough?"),
    minutes: 6,
    intro: t(
      "Oddiy almashtirish shifrida har bir harf boshqa harfga tasodifiy almashtiriladi. Kalitlar soni 26! — taxminan 4·10²⁶, bu brute force uchun juda ko‘p. Lekin bu shifr ham buziladi: tilning o‘zi iz qoldiradi.",
      "A simple substitution cipher swaps each letter for another at random. There are 26! keys — about 4·10²⁶, far too many to try. Yet it still falls: the language itself leaves a trail.",
    ),
    analogy: t(
      "Odamning yuzini yashirsangiz ham, yurishi va ovozi uni tanitadi.",
      "Hide a person’s face and their walk and voice still give them away.",
    ),
    theory: [
      t(
        "Har bir harf doim bir xil harfga aylansa, matndagi harflar chastotasi va takrorlanuvchi so‘zlar saqlanib qoladi.",
        "When each letter always turns into the same letter, letter frequencies and repeated words survive.",
      ),
      t(
        "Kalitlar soni — xavfsizlikning faqat bir sharti. Shifr natijasi ham tasodifiy ko‘rinishi kerak.",
        "The number of keys is only one condition of security. The output must also look random.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Brute force — kalitlarni sanash; chastota tahlili — matnning o‘zini o‘rganish.",
      "Brute force counts keys; frequency analysis studies the text itself.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Sezar shifrida nechta foydali kalit bor?",
            "How many useful keys does a Caesar cipher have?",
          ),
          options: [t("25", "25"), t("26!", "26!"), t("2¹²⁸", "2¹²⁸")],
          answer: 0,
          explain: t(
            "0 siljish matnni o‘zgartirmaydi, qolgan 25 tasini bir zumda sinash mumkin.",
            "A shift of 0 changes nothing; the other 25 can be tried in a moment.",
          ),
        },
        {
          ask: t(
            "Almashtirish shifrining kaliti juda ko‘p, lekin u baribir buziladi. Nega?",
            "A substitution cipher has a huge number of keys, yet it falls. Why?",
          ),
          options: [
            t(
              "Harflar chastotasi shifrlangan matnda ham saqlanadi",
              "Letter frequencies survive in the ciphertext",
            ),
            t(
              "Kompyuterlar 26! kalitni tez sinaydi",
              "Computers try 26! keys quickly",
            ),
            t(
              "Kalit har doim matn ichida yoziladi",
              "The key is always written in the text",
            ),
          ],
          answer: 0,
          explain: t(
            "Eng ko‘p uchraydigan shifr harfi tilning eng ko‘p uchraydigan harfiga mos keladi.",
            "The most common cipher letter matches the language’s most common letter.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: SHIFT,
    title: t("Chastota tahlili", "Frequency analysis"),
    minutes: 10,
    intro: t(
      "O‘zbek tilida eng ko‘p uchraydigan harf — “a”. Uzunroq Sezar matnida eng ko‘p uchragan shifr harfi deyarli albatta “a” ning o‘rnida turadi. Shunday qilib, 25 ta kalitni sinamasdan, kalitni bir qadamda topish mumkin.",
      "The most common letter in Uzbek is “a”. In a longer Caesar text, the most frequent cipher letter almost surely stands for “a”. So the key can be found in one step, without trying all 25.",
    ),
    analogy: t(
      "Do‘konga eng ko‘p kirgan odam ehtimol sotuvchining o‘zi.",
      "The person who walks into the shop most often is probably the shopkeeper.",
    ),
    theory: [
      t(
        "Bu usulni IX asrda arab olimi al-Kindiy yozib qoldirgan — kriptotahlilning eng qadimgi qo‘llanmasi.",
        "The Arab scholar al-Kindi wrote this method down in the 9th century — the oldest known manual of cryptanalysis.",
      ),
      t(
        "Matn qancha uzun bo‘lsa, chastotalar shuncha aniq bo‘ladi. Qisqa matnda xato bo‘lishi mumkin.",
        "The longer the text, the clearer the frequencies. On a short text it can mislead.",
      ),
    ],
    task: t(
      "Diagrammadan eng ko‘p uchragan shifr harfini toping va uni “a” deb belgilang.",
      "Find the most frequent cipher letter in the chart and mark it as “a”.",
    ),
    hint: t(
      "Eng baland ustun qaysi harfniki?",
      "Which letter has the tallest bar?",
    ),
    widget: { type: "freq" },
  },
  {
    id: 4,
    group: POLY,
    title: t("Vigenère: kalit so‘z", "Vigenère: a key word"),
    minutes: 8,
    intro: t(
      "Vigenère shifri bitta son o‘rniga kalit so‘zdan foydalanadi: har bir harf kalitning navbatdagi harfi qadar suriladi. “kalit” kaliti bilan birinchi harf 10 ga (k), ikkinchisi 0 ga (a), uchinchisi 11 ga (l) suriladi va hokazo. Bir xil harf turli joyda turli harfga aylanadi.",
      "Vigenère uses a key word instead of one number: each letter is moved by the next letter of the key. With the key “kalit”, the first letter moves 10 (k), the second 0 (a), the third 11 (l), and so on. The same letter turns into different letters in different places.",
    ),
    analogy: t(
      "Bitta qulf o‘rniga besh xil qulf navbat bilan ishlatilgan eshik.",
      "A door that uses five different locks in turn instead of one.",
    ),
    theory: [
      t(
        "Uch yuz yil davomida Vigenère “buzib bo‘lmas shifr” deb hisoblangan.",
        "For three hundred years Vigenère was called “the unbreakable cipher”.",
      ),
      t(
        "Uning zaifligi — kalitning takrorlanishi. Kalit uzunligi ma’lum bo‘lsa, matn bir nechta oddiy Sezar shifriga bo‘linadi.",
        "Its weakness is the repeating key. Once the key length is known, the text splits into several plain Caesar ciphers.",
      ),
    ],
    task: t(
      "Har bir da’voni ajrating: Vigenère haqida to‘g‘rimi yoki noto‘g‘ri?",
      "Sort each claim about Vigenère: true or false?",
    ),
    hint: t(
      "Kalit takrorlanadi — bu ham kuch, ham zaiflik.",
      "The key repeats — that is both its strength and its weakness.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "true", label: t("To‘g‘ri", "True") },
        { id: "false", label: t("Noto‘g‘ri", "False") },
      ],
      items: [
        {
          label: t(
            "Bir xil harf turli joyda turli harfga aylanishi mumkin",
            "The same letter can turn into different letters in different places",
          ),
          bucket: "true",
        },
        {
          label: t(
            "Kalit uzunligi ma’lum bo‘lsa, matn bir nechta Sezar shifriga bo‘linadi",
            "Once the key length is known, the text splits into Caesar ciphers",
          ),
          bucket: "true",
        },
        {
          label: t(
            "Harflar chastotasi butun matnda saqlanadi",
            "Letter frequencies survive across the whole text",
          ),
          bucket: "false",
        },
        {
          label: t(
            "Vigenère bugungi kunda ham xavfsiz",
            "Vigenère is still safe today",
          ),
          bucket: "false",
        },
        {
          label: t(
            "Matnning boshi ma’lum bo‘lsa, kalitni topish oson",
            "If the start of the message is known, the key is easy to find",
          ),
          bucket: "true",
        },
      ],
    },
  },
  {
    id: 5,
    group: POLY,
    title: t("Ma’lum so‘z kalitni ochadi", "A known word gives the key away"),
    minutes: 10,
    intro: t(
      "Ushlab olingan Vigenère xabari odatdagidek “salom” bilan boshlanadi deb taxmin qilamiz. Shifr harfidan ochiq harfni ayirsak, ostidagi kalit harfi chiqadi. Takrorlanadigan qism — kalitning o‘zi.",
      "We guess that an intercepted Vigenère message starts, as usual, with “salom” (hello). Subtracting each plain letter from the cipher letter gives the key letter under it. The part that repeats is the key itself.",
    ),
    analogy: t(
      "Xatning “Hurmatli…” deb boshlanishini bilsangiz, shifrning birinchi qatorini o‘qish uchun kalitni o‘zingiz tiklaysiz.",
      "Knowing a letter starts with “Dear…” lets you rebuild the key for its first line yourself.",
    ),
    theory: [
      t(
        "Bu known-plaintext hujumi: ochiq matnning bir qismi ma’lum. Ikkinchi jahon urushida Enigma shu yo‘l bilan ham buzilgan — ob-havo hisobotlari doim bir xil so‘zlar bilan boshlangan.",
        "This is a known-plaintext attack: part of the plain text is known. Enigma was broken partly this way in the Second World War — weather reports always began with the same words.",
      ),
      t(
        "Zamonaviy shifrlar shunday tuzilganki, ma’lum ochiq matn kalitni hech qachon ochib bermaydi.",
        "Modern ciphers are built so that known plain text never gives the key away.",
      ),
    ],
    task: t(
      "Ma’lum so‘zni yozing va ostidagi kalitni o‘qing. Keyin shu kalit bilan butun xabarni oching.",
      "Type the known word and read the key under it. Then open the whole message with that key.",
    ),
    hint: t(
      "“salom” deb yozing — kalit beshta harfdan iborat.",
      "Type “salom” — the key has five letters.",
    ),
    widget: { type: "vigenere" },
  },
  {
    id: 6,
    group: POLY,
    title: t("Bir martalik kalit", "The one-time pad"),
    minutes: 6,
    intro: t(
      "Agar kalit xabar bilan bir xil uzunlikda, haqiqatan tasodifiy va faqat bir marta ishlatilsa, Vigenère buzib bo‘lmas bo‘lib qoladi. Bu one-time pad deyiladi va matematik jihatdan isbotlangan yagona mukammal shifrdir.",
      "If the key is as long as the message, truly random and used only once, Vigenère becomes unbreakable. This is the one-time pad, the only cipher proven perfectly secret.",
    ),
    analogy: t(
      "Har bir xat uchun yangi, faqat ikki kishida bor bir martalik daftar varag‘i — ishlatilgach, yoqib yuboriladi.",
      "A fresh notebook page for every letter, held by only two people and burnt after use.",
    ),
    theory: [
      t(
        "Kalit takror ishlatilsa, ikki shifr matnini birlashtirish kalitni yo‘qotadi va ikki ochiq matn aralashmasi qoladi — uni tahlil qilish mumkin.",
        "Reuse the key and combining two ciphertexts cancels it, leaving a mix of the two plain texts that can be analysed.",
      ),
      t(
        "Amalda uzun tasodifiy kalitlarni xavfsiz yetkazish qiyin, shuning uchun bugun AES kabi qisqa kalitli shifrlar ishlatiladi.",
        "In practice long random keys are hard to deliver safely, so today short-key ciphers such as AES are used.",
      ),
    ],
    task: t(
      "Har bir sharoitni ajrating: one-time pad xavfsiz qoladimi yoki buziladimi?",
      "Sort each case: does the one-time pad stay secure, or does it break?",
    ),
    hint: t(
      "Uchta shart: uzunlik, tasodifiylik, bir marta.",
      "Three conditions: length, randomness, once only.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Secure") },
        { id: "broken", label: t("Buziladi", "Breaks") },
      ],
      items: [
        {
          label: t(
            "Kalit tasodifiy, xabar uzunligida va bir marta ishlatilgan",
            "The key is random, as long as the message and used once",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Bitta kalit ikki xil xabar uchun ishlatilgan",
            "One key is used for two messages",
          ),
          bucket: "broken",
        },
        {
          label: t(
            "Kalit qisqa va takrorlanadi",
            "The key is short and repeats",
          ),
          bucket: "broken",
        },
        {
          label: t(
            "Kalit sifatida kitobdan olingan matn ishlatilgan",
            "A passage from a book is used as the key",
          ),
          bucket: "broken",
        },
      ],
    },
  },
  {
    id: 7,
    group: LESSONS_TODAY,
    title: t("Eski shifrlardan saboq", "What old ciphers teach"),
    minutes: 6,
    intro: t(
      "Klassik shifrlar bugun ishlatilmaydi, lekin ularning xatolari hozir ham uchraydi: o‘zi o‘ylab topgan “maxfiy” algoritm, qisqa yoki takrorlanadigan kalit, bir kalitni qayta ishlatish.",
      "Classical ciphers are not used today, but their mistakes still appear: a home-made “secret” algorithm, a short or repeating key, reusing one key.",
    ),
    analogy: t(
      "Eski qal’a devorlari bugun himoya qilmaydi, lekin ularning qayerdan qulaganini bilish yangi devorni to‘g‘ri qurishga yordam beradi.",
      "Old castle walls protect nothing today, but knowing where they fell helps you build new ones right.",
    ),
    theory: [
      t(
        "Kerckhoffs tamoyili: shifr algoritmi hammaga ma’lum bo‘lsa ham xavfsiz qolishi kerak; maxfiy faqat kalit.",
        "Kerckhoffs’s principle: a cipher must stay secure even when everyone knows the algorithm; only the key is secret.",
      ),
      t(
        "O‘zingiz shifr yozmang — sinovdan o‘tgan standart kutubxonalardan foydalaning.",
        "Do not write your own cipher — use tested, standard libraries.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Maxfiy bo‘lishi kerak bo‘lgan yagona narsa — kalit.",
      "The only thing that must be secret is the key.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kerckhoffs tamoyiliga ko‘ra nima maxfiy bo‘lishi kerak?",
            "Under Kerckhoffs’s principle, what must be secret?",
          ),
          options: [
            t("Faqat kalit", "Only the key"),
            t("Algoritm va kalit", "The algorithm and the key"),
            t("Faqat algoritm", "Only the algorithm"),
          ],
          answer: 0,
          explain: t(
            "Algoritm baribir sizib chiqadi; xavfsizlik kalitga tayanishi kerak.",
            "Algorithms leak anyway; security must rest on the key.",
          ),
        },
        {
          ask: t(
            "Dasturchi “o‘zimning maxfiy shifrim” bilan parollarni shifrlamoqchi. To‘g‘ri maslahat?",
            "A developer wants to protect data with “my own secret cipher”. The right advice?",
          ),
          options: [
            t(
              "Sinovdan o‘tgan standart kutubxonani ishlatish",
              "Use a tested, standard library",
            ),
            t(
              "Algoritmni hech kimga ko‘rsatmaslik",
              "Show the algorithm to nobody",
            ),
            t("Shifrni ikki marta qo‘llash", "Apply the cipher twice"),
          ],
          answer: 0,
          explain: t(
            "Mutaxassislar yillab tekshirgan algoritmlar uydirma shifrdan ancha ishonchli.",
            "Algorithms experts have tested for years are far safer than a home-made one.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: LESSONS_TODAY,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: brute force, chastota tahlili, Vigenère va ma’lum ochiq matn hujumi, bir martalik kalit.",
      "A review of the module: brute force, frequency analysis, Vigenère and the known-plaintext attack, and the one-time pad.",
    ),
    analogy: t(
      "Har bir eski shifr — yangisi qaysi xatodan qochishi kerakligini ko‘rsatadigan dars.",
      "Each old cipher is a lesson in which mistake a new one must avoid.",
    ),
    theory: [
      t(
        "Yaxshi shifr: kalitlar soni juda ko‘p, natija tasodifiy ko‘rinadi va ma’lum ochiq matn kalitni ochmaydi.",
        "A good cipher: a huge number of keys, output that looks random, and known plain text that never reveals the key.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Har bir hujum shifrning qaysi zaifligidan foydalanishini eslang.",
      "Remember which weakness each attack uses.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Uzun Sezar matnining kalitini eng tez qanday topish mumkin?",
            "What is the quickest way to find the key of a long Caesar text?",
          ),
          options: [
            t(
              "Eng ko‘p uchragan harfni “a” ga moslash",
              "Match the most frequent letter to “a”",
            ),
            t("Matnni orqadan o‘qish", "Read the text backwards"),
            t(
              "Har bir so‘zni lug‘atdan qidirish",
              "Look every word up in a dictionary",
            ),
          ],
          answer: 0,
          explain: t(
            "Chastota tahlili kalitni bir qadamda beradi.",
            "Frequency analysis gives the key in one step.",
          ),
        },
        {
          ask: t(
            "Vigenère’ning asosiy zaifligi nima?",
            "What is Vigenère’s main weakness?",
          ),
          options: [
            t("Kalitning takrorlanishi", "The repeating key"),
            t("Faqat katta harflar ishlatilishi", "Using capitals only"),
            t("Bo‘sh joylarning shifrlanishi", "Spaces being encrypted"),
          ],
          answer: 0,
          explain: t(
            "Takrorlanish matnni bir nechta Sezar shifriga bo‘ladi.",
            "The repetition splits the text into several Caesar ciphers.",
          ),
        },
        {
          ask: t(
            "Xabar “salom” bilan boshlanishini bilish qaysi hujumga yo‘l ochadi?",
            "Knowing a message starts with “salom” opens the way to which attack?",
          ),
          options: [
            t("Ma’lum ochiq matn hujumi", "A known-plaintext attack"),
            t("Brute force", "Brute force"),
            t("SQL injection", "SQL injection"),
          ],
          answer: 0,
          explain: t(
            "Ochiq va shifrlangan harflarni solishtirib kalit tiklanadi.",
            "Comparing plain and cipher letters rebuilds the key.",
          ),
        },
        {
          ask: t(
            "One-time pad qachon buziladi?",
            "When does a one-time pad break?",
          ),
          options: [
            t("Kalit qayta ishlatilganda", "When the key is reused"),
            t("Xabar uzun bo‘lganda", "When the message is long"),
            t("Kalit tasodifiy bo‘lganda", "When the key is random"),
          ],
          answer: 0,
          explain: t(
            "Uning xavfsizligi kalitni bir marta ishlatishga bog‘liq.",
            "Its security depends on using each key once.",
          ),
        },
      ],
    },
  },
];
