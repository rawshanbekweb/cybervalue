// Academy Intermediate · Social engineering, module 1: Manipulation tactics.
// The lessons use ./tools.ts: a phishing email to read for warning signs.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "signs" };

export const PROGRESS_KEY = "cybervalue:manipulation:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const TACTICS = t("Usullar", "Tactics");
const CHANNELS = t("Kanallar", "Channels");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: TACTICS,
    title: t("Ijtimoiy muhandislik", "Social engineering"),
    minutes: 5,
    intro: t(
      "Ijtimoiy muhandislik — texnikani emas, odamni aldash: odam o‘zi parolni aytadi, havolani bosadi yoki pul o‘tkazadi. Ko‘p hodisalar shundan boshlanadi, chunki eng kuchli himoyani ham to‘g‘ri parolni kiritgan foydalanuvchi ochib beradi. Maqsad — odamlarni ayblash emas, balki aldash belgilarini tanib olishga va shubha bo‘lsa to‘xtab tekshirishga o‘rgatish.",
      "Social engineering means tricking people rather than technology: the person hands over the password, clicks the link or sends the money themselves. Many incidents start this way, because even the strongest defence opens for a user who types the right password. The aim isn’t to blame people but to teach them to recognise the signs, and to stop and check when something feels off.",
    ),
    analogy: t(
      "Qulf qanchalik mustahkam bo‘lmasin, kalitni o‘zingiz bersangiz, foydasi yo‘q.",
      "However strong the lock, it doesn’t help if you hand over the key.",
    ),
    theory: [
      t(
        "Phishing (email), smishing (SMS), vishing (telefon) — bir xil usul, turli kanal.",
        "Phishing (email), smishing (SMS), vishing (phone) — the same trick, different channels.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Odamni aldash.", "Tricking the person."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Ijtimoiy muhandislik nimani nishonga oladi?",
            "What does social engineering target?",
          ),
          options: [
            t(
              "Odamlarning ishonchi va odatlarini",
              "People’s trust and habits",
            ),
            t("Faqat serverlarni", "Only servers"),
            t("Faqat tarmoq kabellarini", "Only network cables"),
          ],
          answer: 0,
          explain: t(
            "Texnik himoyani chetlab o‘tadi.",
            "It goes around technical defences.",
          ),
        },
        {
          ask: t(
            "Telefon orqali aldash qanday ataladi?",
            "What is phone-based deception called?",
          ),
          options: [
            t("Vishing", "Vishing"),
            t("Smishing", "Smishing"),
            t("Spoofing", "Spoofing"),
          ],
          answer: 0,
          explain: t(
            "Voice + phishing. SMS orqali — smishing.",
            "Voice + phishing. By SMS it’s smishing.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: TACTICS,
    title: t("Ta’sir tamoyillari", "Levers of influence"),
    minutes: 6,
    intro: t(
      "Aldovchilar bir necha psixologik tamoyilga tayanadi. Shoshiltirish (“2 soat ichida”), obro‘ (“direktor so‘radi”), qo‘rquv (“hisobingiz bloklanadi”), ochko‘zlik yoki qiziqish (“siz yutdingiz”), yordam berish istagi (“iltimos, tez yordam bering”) va boshqalarning ham qilgani (“butun bo‘lim allaqachon tasdiqladi”). Ularning barchasi bitta narsani xohlaydi: siz o‘ylashdan oldin harakat qilishingizni.",
      "Scammers lean on a handful of psychological levers. Urgency (“within 2 hours”), authority (“the director asked”), fear (“your account will be blocked”), greed or curiosity (“you’ve won”), the wish to help (“please, I need this quickly”) and social proof (“the whole department has already confirmed”). They all want the same thing: for you to act before you think.",
    ),
    analogy: t(
      "Bozordagi “oxirgi dona, faqat bugun!” — o‘ylashga vaqt bermaslik uchun.",
      "The market’s “last one, today only!” — so you don’t stop to think.",
    ),
    theory: [
      t(
        "Kuchli his-tuyg‘u (qo‘rquv, hayajon) sezsangiz — bu to‘xtash uchun signal.",
        "When you feel a strong emotion (fear, excitement), that’s the signal to pause.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("Shoshiltirish, obro‘, qo‘rquv.", "Urgency, authority, fear."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“Hisobingiz bugun yopiladi” qaysi tamoyil?",
            "Which lever is “your account closes today”?",
          ),
          options: [
            t("Shoshiltirish va qo‘rquv", "Urgency and fear"),
            t("Minnatdorchilik", "Gratitude"),
            t("Hech qaysi", "None"),
          ],
          answer: 0,
          explain: t(
            "Vaqt cheklovi o‘ylashga to‘sqinlik qiladi.",
            "A deadline gets in the way of thinking.",
          ),
        },
        {
          ask: t(
            "“Bosh direktor sizdan shaxsan so‘rayapti” qaysi tamoyil?",
            "Which lever is “the CEO is asking you personally”?",
          ),
          options: [
            t("Obro‘ (authority)", "Authority"),
            t("Qiziqish", "Curiosity"),
            t("Ochko‘zlik", "Greed"),
          ],
          answer: 0,
          explain: t(
            "Rahbarga yo‘q deyish qiyin — aldovchi buni biladi.",
            "Saying no to a boss is hard — scammers know it.",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: TACTICS,
    title: t("Xatni o‘qish", "Reading a message"),
    minutes: 8,
    intro: t(
      "Quyida xodimga kelgan xat. U sakkiz qismdan iborat va beshtasi aldash belgisi. Har bir qismni o‘qing: yuboruvchi kim, nima so‘ralyapti, qanday bosim bor va tekshirishga imkon berilganmi?",
      "Below is an email an employee received. It has eight parts, and five of them are warning signs. Read each part: who sent it, what is being asked, what pressure is applied, and is there a way to check?",
    ),
    analogy: t(
      "Detektiv kabi: har bir mayda narsa iz bo‘lishi mumkin.",
      "Like a detective: every small detail could be a clue.",
    ),
    theory: [
      t(
        "Havola ustiga sichqonchani olib boring (bosmasdan) — haqiqiy manzil ko‘rinadi.",
        "Hover over a link without clicking to see where it really goes.",
      ),
    ],
    task: t("Aldash belgilarini belgilang.", "Tick the warning signs."),
    hint: t(
      "Domen, shoshilish, havola, obro‘ va tekshirishni taqiqlash.",
      "The domain, the rush, the link, authority, and being told not to check.",
    ),
    widget: { type: "signs" },
  },
  {
    id: 4,
    group: CHANNELS,
    title: t("Telefon va bahona", "Phone calls and pretexts"),
    minutes: 6,
    intro: t(
      "Pretexting — ishonchli bahona o‘ylab topish: “bankdan qo‘ng‘iroq qilyapman”, “men yangi IT xodimiman”, “yetkazib berish xizmatidanman”. Telefon raqami ham soxtalashtirilishi mumkin (caller ID spoofing), endi esa sun’iy intellekt bilan ovozni ham taqlid qilish mumkin. Qoida oddiy: so‘rov g‘alati bo‘lsa, qo‘ng‘iroqni tugating va o‘zingiz biladigan rasmiy raqamga qayta qo‘ng‘iroq qiling.",
      "Pretexting is inventing a believable story: “I’m calling from the bank”, “I’m the new IT person”, “I’m from the delivery company”. Caller IDs can be faked (spoofing), and now voices can be imitated with AI too. The rule is simple: if a request is odd, hang up and call back on an official number you already know.",
    ),
    analogy: t(
      "Eshik oldidagi “gaz xodimi”ga hujjatini so‘rash va idoraga qo‘ng‘iroq qilib tekshirish.",
      "Asking the “gas inspector” at the door for ID — and calling the office to check.",
    ),
    theory: [
      t(
        "Bank, IT yoki politsiya hech qachon telefonda parol yoki SMS kodni so‘ramaydi.",
        "Banks, IT and the police never ask for a password or SMS code over the phone.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Qayta qo‘ng‘iroq — rasmiy raqamga.",
      "Call back on the official number.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“Bankdan” qo‘ng‘iroq SMS kodni so‘rayapti. Nima qilasiz?",
            "A caller “from the bank” asks for an SMS code. What do you do?",
          ),
          options: [
            t(
              "Tugataman va kartadagi rasmiy raqamga qo‘ng‘iroq qilaman",
              "Hang up and call the official number on my card",
            ),
            t("Kodni aytaman", "Read out the code"),
            t("Faqat yarmini aytaman", "Say only half of it"),
          ],
          answer: 0,
          explain: t(
            "SMS kod — eshik kaliti. Uni hech kimga aytmaysiz.",
            "The SMS code is a door key. You never tell anyone.",
          ),
        },
        {
          ask: t(
            "Ekrandagi raqam bankniki. Bu ishonchlimi?",
            "The number on screen is the bank’s. Is that trustworthy?",
          ),
          options: [
            t(
              "Yo‘q, raqam soxtalashtirilishi mumkin",
              "No, numbers can be faked",
            ),
            t("Ha, har doim", "Yes, always"),
            t("Faqat kechqurun", "Only in the evening"),
          ],
          answer: 0,
          explain: t(
            "Caller ID spoofing oddiy hodisa.",
            "Caller ID spoofing is common.",
          ),
        },
      ],
    },
  },
  {
    id: 5,
    group: CHANNELS,
    title: t("SMS, messenjer va QR", "SMS, messengers and QR codes"),
    minutes: 5,
    intro: t(
      "Aldash Telegram, WhatsApp, SMS va hatto QR kodlar orqali ham keladi: “posilkangiz kutilmoqda”, “do‘stingiz pul so‘rayapti”, “to‘xtash joyi uchun QR orqali to‘lang”. Telefonda havolaning to‘liq manzili ko‘rinmaydi, shuning uchun ehtiyot bo‘lish yanada muhim. Har bir harakatni to‘g‘ri guruhga ajrating.",
      "Scams also arrive by Telegram, WhatsApp, SMS and even QR codes: “your parcel is waiting”, “a friend needs money”, “pay for parking with this QR”. On a phone the full link is hidden, so caution matters even more. Sort each reaction into the right group.",
    ),
    analogy: t(
      "Notanish odamning qo‘lingizga tutqazgan qog‘ozi — o‘qishdan oldin kimdanligini bilib oling.",
      "A note a stranger hands you — find out who it’s from before acting on it.",
    ),
    theory: [
      t(
        "Do‘st “pul kerak” desa — boshqa yo‘l bilan, masalan qo‘ng‘iroq qilib tekshiring.",
        "If a friend writes “I need money”, check another way — call them.",
      ),
    ],
    task: t("Harakatlarni ajrating.", "Sort the reactions."),
    hint: t(
      "Boshqa kanal orqali tekshirish — xavfsiz.",
      "Checking through another channel is safe.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Safe") },
        { id: "risky", label: t("Xavfli", "Risky") },
      ],
      items: [
        {
          label: t(
            "Do‘stga qo‘ng‘iroq qilib, pul so‘raganini tekshirish",
            "Calling a friend to check they really asked for money",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "SMS’dagi “posilka” havolasiga karta ma’lumotini kiritish",
            "Entering card details on a “parcel” SMS link",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "Pochta xizmatining rasmiy ilovasida trek raqamni tekshirish",
            "Checking a tracking number in the courier’s official app",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Ustunga yopishtirilgan QR orqali to‘lash",
            "Paying through a QR sticker stuck on a post",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "Shubhali xabarni IT bo‘limiga yuborish",
            "Forwarding a suspicious message to IT",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "“Admin”ga Telegram’da tasdiqlash kodini yuborish",
            "Sending a login code to an “admin” on Telegram",
          ),
          bucket: "risky",
        },
      ],
    },
  },
  {
    id: 6,
    group: CHANNELS,
    title: t("Jismoniy usullar", "In person"),
    minutes: 5,
    intro: t(
      "Ijtimoiy muhandislik ofisda ham bo‘ladi. Tailgating — begona odam xodim ortidan yopiq eshikdan kirib oladi (“qo‘lim band, eshikni ushlab turing”). Topilgan USB fleshkani kompyuterga ulash zararli dasturni ishga tushirishi mumkin. Qorovul yoki ta’mirchi qiyofasidagi odam ham bahona bo‘lishi mumkin. Notanish odamni muloyimlik bilan qabulxonaga yo‘naltirish — qo‘pollik emas.",
      "Social engineering happens in the office too. Tailgating is a stranger following an employee through a locked door (“my hands are full, could you hold it?”). Plugging in a USB stick you found can run malware. Someone dressed as a guard or repair worker can be a pretext as well. Politely sending a stranger to reception isn’t rude.",
    ),
    analogy: t(
      "Uyingiz eshigini notanishga ochib, “balki qo‘shnidir” deb o‘ylamaysiz.",
      "You don’t open your front door to a stranger thinking “maybe it’s a neighbour”.",
    ),
    theory: [
      t(
        "Topilgan qurilmalar IT bo‘limiga topshiriladi, ulanmaydi.",
        "Devices you find go to IT; they don’t get plugged in.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Notanish — qabulxonaga, fleshka — IT’ga.",
      "Strangers to reception, USB sticks to IT.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Avtoturargohda kompaniya logotipli fleshka topdingiz. Nima qilasiz?",
            "You find a USB stick with the company logo in the car park. What do you do?",
          ),
          options: [
            t("IT bo‘limiga topshiraman", "Hand it to IT"),
            t("Kompyuterimga ulab ko‘raman", "Plug it into my computer"),
            t("Uyga olib ketaman", "Take it home"),
          ],
          answer: 0,
          explain: t(
            "Fleshka ulanishi bilan dastur ishga tushishi mumkin.",
            "A stick can run code the moment it’s plugged in.",
          ),
        },
        {
          ask: t(
            "Notanish odam “kartamni unutdim” deb ortingizdan kirmoqchi. To‘g‘ri yo‘l?",
            "A stranger says “I forgot my badge” and wants to follow you in. The right move?",
          ),
          options: [
            t(
              "Muloyimlik bilan qabulxonaga yo‘naltirish",
              "Politely send them to reception",
            ),
            t("Eshikni ushlab turish", "Hold the door"),
            t("O‘z kartamni berish", "Lend them my badge"),
          ],
          answer: 0,
          explain: t(
            "Haqiqiy xodim buni tushunadi.",
            "A real colleague will understand.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: CHANNELS,
    title: t("To‘xtash, tekshirish, xabar berish", "Stop, check, report"),
    minutes: 5,
    intro: t(
      "Eng yaxshi javob uch qadam. To‘xtang: shoshilmang, his-tuyg‘u bosimini sezing. Tekshiring: boshqa kanal orqali — rasmiy raqam, shaxsan so‘rash, kompaniya portali. Xabar bering: shubhali xatni IT yoki xavfsizlik jamoasiga yuboring, hatto bosib qo‘ygan bo‘lsangiz ham. Tez xabar — kichik zarar; jim turish — katta zarar. Yaxshi jamoada xabar bergan odam maqtaladi, ayblanmaydi.",
      "The best response is three steps. Stop: don’t rush, notice the emotional pressure. Check: through another channel — an official number, asking in person, the company portal. Report: forward the suspicious message to IT or security, even if you already clicked. A quick report means small damage; staying quiet means big damage. In a good team, the person who reports is thanked, not blamed.",
    ),
    analogy: t(
      "Yong‘in signalini bosgan odam qahramon, “balki shunchaki tutundir” deb jim turgan esa emas.",
      "Whoever pulls the fire alarm is the hero — not the one who thought “probably just smoke”.",
    ),
    theory: [
      t(
        "Ko‘p pochta dasturlarida “Report phishing” tugmasi bor.",
        "Many mail apps have a “Report phishing” button.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("To‘xtash, tekshirish, xabar berish.", "Stop, check, report."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Havolani bosib, parol kiritib qo‘ydingiz. Endi?",
            "You clicked the link and typed your password. Now what?",
          ),
          options: [
            t(
              "Darhol parolni o‘zgartirib, IT’ga xabar beraman",
              "Change the password at once and tell IT",
            ),
            t("Hech kimga aytmayman", "Tell no one"),
            t("Ertaga o‘ylab ko‘raman", "Think about it tomorrow"),
          ],
          answer: 0,
          explain: t(
            "Har bir daqiqa muhim — tez xabar zararni kamaytiradi.",
            "Every minute counts — a quick report limits the damage.",
          ),
        },
        {
          ask: t(
            "Xat haqiqatan direktordanmi — qanday tekshirasiz?",
            "How do you check an email really is from the director?",
          ),
          options: [
            t(
              "Unga o‘zim biladigan raqamga qo‘ng‘iroq qilaman",
              "Call them on a number I already know",
            ),
            t("Xatga javob yozib so‘rayman", "Reply to the email and ask"),
            t(
              "Xatdagi raqamga qo‘ng‘iroq qilaman",
              "Call the number in the email",
            ),
          ],
          answer: 0,
          explain: t(
            "Xatning o‘zidagi kontaktlar aldovchiga olib boradi.",
            "Contact details in the email lead back to the scammer.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: CHANNELS,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 5,
    intro: t(
      "Aldash belgilari kanaldan qat’i nazar bir xil: shoshiltirish, obro‘ yoki qo‘rquv bosimi, odatdan tashqari so‘rov (parol, kod, pul, sovg‘a kartalari), o‘xshatilgan manzil va tekshirishni taqiqlash. Javob ham bir xil: to‘xtash, boshqa kanal orqali tekshirish va xabar berish. Keyingi modul — shaxsiy himoya: parol menejeri, MFA va zaxira nusxalar.",
      "The warning signs are the same whatever the channel: urgency, pressure from authority or fear, an unusual request (password, code, money, gift cards), a look-alike address and being told not to check. The response is the same too: stop, check through another channel, and report. Next module: personal protection — password managers, MFA and backups.",
    ),
    analogy: t(
      "Yo‘l harakati qoidasi kabi: to‘xta, qara, keyin o‘t.",
      "Like crossing the road: stop, look, then go.",
    ),
    theory: [
      t(
        "Aldangan odam ahmoq emas — aldovchilar professional.",
        "People who get fooled aren’t stupid — scammers are professionals.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Bosim + g‘alati so‘rov = to‘xtang.",
      "Pressure + an odd request = stop.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi so‘rov eng shubhali?",
            "Which request is the most suspicious?",
          ),
          options: [
            t(
              "“Direktor uchun tezda sovg‘a kartalari sotib oling”",
              "“Buy gift cards for the director, quickly”",
            ),
            t(
              "“Ertangi yig‘ilish soat 10 da”",
              "“Tomorrow’s meeting is at 10”",
            ),
            t(
              "“Hisobotni portalga yuklang”",
              "“Upload the report to the portal”",
            ),
          ],
          answer: 0,
          explain: t(
            "Shoshilish, obro‘ va g‘alati to‘lov usuli birga.",
            "Urgency, authority and an odd way to pay, all at once.",
          ),
        },
        {
          ask: t(
            "Hamkasbingiz phishing’ni bosib qo‘ydi va xabar berdi. Jamoa nima qilishi kerak?",
            "A colleague clicked a phishing link and reported it. What should the team do?",
          ),
          options: [
            t(
              "Xabari uchun minnatdorchilik bildirib, birga tuzatish",
              "Thank them for reporting and fix it together",
            ),
            t("Uni jazolash", "Punish them"),
            t("Hammaga ustidan kulish", "Laugh about it in front of everyone"),
          ],
          answer: 0,
          explain: t(
            "Jazolansa, keyingi safar hech kim xabar bermaydi.",
            "Punish them, and next time no one reports.",
          ),
        },
      ],
    },
  },
];
