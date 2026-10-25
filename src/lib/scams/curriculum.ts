// Firibgarlik simulyatori (Scam simulator): eight everyday situations from
// Uzbekistan on a pretend phone. The student first decides what to do, then
// finds every red flag in the conversation. Banks, apps and people are made
// up; "QulayBank", "TezPay" and "BozorPlus" are not real brands.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Part = { text: Text; flag?: string };
export type Message = { from: "them" | "me"; parts: Part[] };
export type Choice = { label: Text; right: boolean; feedback: Text };
export type Scenario = {
  channel: "call" | "sms" | "telegram" | "market";
  sender: Text;
  detail: Text;
  messages: Message[];
  /** What each red flag in the messages means. */
  flags: Record<string, Text>;
  choices: Choice[];
  scam: boolean;
};

export type Widget = CommonWidget | { type: "scam"; scenario: Scenario };

export const PROGRESS_KEY = "cybervalue:scams:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const p = (uz: string, en: string, flag?: string): Part => ({
  text: t(uz, en),
  flag,
});

const VOICE = t("Qo‘ng‘iroq va SMS", "Calls and texts");
const CHAT = t("Messenjerlar", "Messengers");
const MONEY = t("Savdo va pul", "Buying, selling and money");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: VOICE,
    title: t("“Bank xavfsizlik xizmati”", "“The bank’s security team”"),
    minutes: 6,
    intro: t(
      "Eng ko‘p uchraydigan firibgarlik: bankdan qo‘ng‘iroq qilishyapti, kartangizdan pul yechilyapti, uni to‘xtatish uchun SMS kod kerak emish.",
      "The most common scam of all: “the bank” calls, money is leaving your card, and to stop it they need the code from an SMS.",
    ),
    analogy: t(
      "Uyingiz kalitini “qulfni almashtiramiz” degan notanish odamga berishga o‘xshaydi. Haqiqiy usta kalitingizni so‘ramaydi.",
      "Like handing your house key to a stranger who says they will change your lock. A real locksmith never asks for your key.",
    ),
    theory: [
      t(
        "SMS kod — bu sizning imzoingiz. Kodni aytsangiz, firibgar sizning nomingizdan pul o‘tkazadi yoki yangi qurilmani ulaydi.",
        "The SMS code is your signature. Say it, and the scammer moves money or adds a new device in your name.",
      ),
      t(
        "Qo‘ng‘iroq qiluvchining raqami bankning rasmiy raqamiga o‘xshatilishi mumkin. Raqamga emas, so‘rovga qarang.",
        "The caller’s number can be faked to look like the bank’s. Judge the request, not the number.",
      ),
      t(
        "To‘g‘ri yo‘l: go‘shakni qo‘ying va kartangiz orqasidagi rasmiy raqamga o‘zingiz qo‘ng‘iroq qiling.",
        "The right move: hang up and call the official number on the back of your card yourself.",
      ),
    ],
    task: t(
      "Nima qilishni tanlang, keyin suhbatdagi barcha xavf belgilarini toping.",
      "Choose what to do, then find every red flag in the call.",
    ),
    hint: t(
      "Xavf belgilari: kim ekanini aytishi, shoshiltirishi va nima so‘rashiga qarang.",
      "Red flags: who they say they are, how they rush you and what they ask for.",
    ),
    widget: {
      type: "scam",
      scenario: {
        channel: "call",
        sender: t("+998 71 2__ __ 00", "+998 71 2__ __ 00"),
        detail: t("Kiruvchi qo‘ng‘iroq", "Incoming call"),
        messages: [
          {
            from: "them",
            parts: [
              p("Assalomu alaykum, ", "Hello, "),
              p(
                "QulayBank xavfsizlik xizmatidan bezovta qilyapmiz.",
                "this is the QulayBank security team.",
                "official",
              ),
            ],
          },
          {
            from: "them",
            parts: [
              p(
                "Hozir kartangizdan Samarqandga 2 400 000 so‘m o‘tkazilyapti. ",
                "Right now 2,400,000 som is being sent from your card to Samarkand. ",
                "fear",
              ),
              p(
                "Siz qilmagan bo‘lsangiz, darhol bekor qilishimiz kerak.",
                "If it wasn’t you, we must cancel it immediately.",
                "rush",
              ),
            ],
          },
          {
            from: "me",
            parts: [
              p(
                "Yo‘q, men hech narsa o‘tkazmadim!",
                "No, I didn’t send anything!",
              ),
            ],
          },
          {
            from: "them",
            parts: [
              p(
                "Tushunarli. Hozir sizga SMS keladi. ",
                "I see. You will get an SMS now. ",
              ),
              p(
                "Undagi 6 xonali kodni menga ayting, ",
                "Read me the 6-digit code in it, ",
                "code",
              ),
              p(
                "aks holda 2 daqiqada pul ketadi.",
                "or the money is gone in 2 minutes.",
                "rush",
              ),
            ],
          },
        ],
        flags: {
          official: t(
            "Rasmiy xizmat nomidan gapirish — ishonch uyg‘otish usuli. Buni tekshirib bo‘lmaydi.",
            "Speaking for an official service builds trust you cannot check.",
          ),
          fear: t(
            "Katta summa va begona shahar — sizni qo‘rqitib, o‘ylashga vaqt bermaslik uchun.",
            "A big sum and a strange city are there to scare you out of thinking.",
          ),
          rush: t(
            "“Darhol”, “2 daqiqada” — bosim. Haqiqiy bank sizni shoshiltirmaydi.",
            "“Immediately”, “in 2 minutes” is pressure. A real bank does not rush you.",
          ),
          code: t(
            "SMS kodni so‘rash — bu aniq firibgarlik. Bank kodni hech qachon so‘ramaydi.",
            "Asking for the SMS code is a certain scam. A bank never asks for it.",
          ),
        },
        choices: [
          {
            label: t(
              "Kodni aytaman — pulni qutqarish kerak",
              "Read out the code — I must save the money",
            ),
            right: false,
            feedback: t(
              "Aynan shu kod bilan firibgar pulni yechadi. Kod — sizning imzoingiz.",
              "That very code is what the scammer uses to take the money. The code is your signature.",
            ),
          },
          {
            label: t(
              "Kartam raqamini aytib, tekshirishlarini so‘rayman",
              "Give my card number and ask them to check",
            ),
            right: false,
            feedback: t(
              "Suhbatni davom ettirish ham xavfli: firibgar sizdan yana ma’lumot oladi.",
              "Keeping the call going is risky too: the scammer gets more out of you.",
            ),
          },
          {
            label: t(
              "Go‘shakni qo‘yaman va karta orqasidagi raqamga o‘zim qo‘ng‘iroq qilaman",
              "Hang up and call the number on the back of my card myself",
            ),
            right: true,
            feedback: t(
              "To‘g‘ri. Agar rostdan muammo bo‘lsa, bank buni o‘zi qo‘ng‘iroq qilganingizda aytadi.",
              "Right. If there really is a problem, the bank will tell you when you call them.",
            ),
          },
        ],
        scam: true,
      },
    },
  },
  {
    id: 2,
    group: VOICE,
    title: t("Haqiqiy bank SMS", "A real bank text"),
    minutes: 4,
    intro: t(
      "Har bir xabar firibgarlik emas. Bank to‘lovdan keyin xabar yuboradi — unda havola ham, so‘rov ham bo‘lmaydi.",
      "Not every message is a scam. A bank texts you after a payment — with no link and no request.",
    ),
    analogy: t(
      "Do‘kondagi chek kabi: u faqat nima bo‘lganini aytadi, sizdan hech narsa talab qilmaydi.",
      "Like a shop receipt: it only says what happened and asks nothing of you.",
    ),
    theory: [
      t(
        "Xavfsiz xabar: summa, vaqt, qoldiq. Havola yo‘q, kod so‘ralmaydi, qo‘ng‘iroq qilish talab qilinmaydi.",
        "A safe message: amount, time, balance. No link, no code request, no demand to call.",
      ),
      t(
        "Agar to‘lovni siz qilmagan bo‘lsangiz, xabardagi raqamga emas, ilovadagi yoki karta orqasidagi raqamga murojaat qiling.",
        "If you did not make the payment, contact the bank through its app or the number on your card, not one in a message.",
      ),
    ],
    task: t(
      "Bu xabarga qanday munosabatda bo‘lish to‘g‘ri?",
      "What is the right way to treat this message?",
    ),
    hint: t(
      "Xabarda nima so‘ralayotganiga qarang. Hech narsa so‘ralmasa?",
      "Look at what the message asks for. And if it asks for nothing?",
    ),
    widget: {
      type: "scam",
      scenario: {
        channel: "sms",
        sender: t("QulayBank", "QulayBank"),
        detail: t("SMS · bugun 12:41", "SMS · today 12:41"),
        messages: [
          {
            from: "them",
            parts: [
              p(
                "Karta *4417: 12:40 da 45 000 so‘m to‘landi, “Non uyi” do‘koni. Qoldiq: 312 000 so‘m.",
                "Card *4417: 45,000 som paid at 12:40, “Non uyi” bakery. Balance: 312,000 som.",
              ),
            ],
          },
        ],
        flags: {},
        choices: [
          {
            label: t(
              "Darhol bankka qo‘ng‘iroq qilib, kartani bloklayman",
              "Call the bank at once and block the card",
            ),
            right: false,
            feedback: t(
              "Agar bu to‘lovni o‘zingiz qilgan bo‘lsangiz, kartani bloklash shart emas. Xabar faqat xabar beradi.",
              "If you made this payment yourself, there is nothing to block. The message only informs you.",
            ),
          },
          {
            label: t(
              "To‘lovni men qilganimni tekshiraman — ha, non oldim. Hammasi joyida",
              "Check that the payment was mine — yes, I bought bread. All is fine",
            ),
            right: true,
            feedback: t(
              "To‘g‘ri. Havola yo‘q, hech narsa so‘ralmaydi — bu oddiy bildirishnoma.",
              "Right. No link, nothing asked — this is an ordinary notification.",
            ),
          },
          {
            label: t(
              "SMS ga javob yozib, “bu nima?” deb so‘rayman",
              "Reply to the SMS asking “what is this?”",
            ),
            right: false,
            feedback: t(
              "Bank SMS lariga javob yozish befoyda. Savol bo‘lsa, ilova yoki rasmiy raqam orqali murojaat qiling.",
              "Replying to bank texts does nothing. If in doubt, use the app or the official number.",
            ),
          },
        ],
        scam: false,
      },
    },
  },
  {
    id: 3,
    group: VOICE,
    title: t("“Siz yutdingiz!”", "“You have won!”"),
    minutes: 5,
    intro: t(
      "Siz hech qanday tanlovda qatnashmagansiz, lekin telefon “yutuq” haqida xabar qilmoqda. Faqat “yetkazib berish” uchun ozgina to‘lash kerak emish.",
      "You never entered a draw, yet your phone says you won. You just need to pay a little for “delivery”.",
    ),
    analogy: t(
      "Ko‘chada “sizga mashina sovg‘a, faqat kalit uchun 100 ming bering” deyishlariga o‘xshaydi.",
      "Like a stranger saying “here’s a free car, just pay 100,000 for the key”.",
    ),
    theory: [
      t(
        "Haqiqiy yutuq uchun to‘lov olinmaydi. “Yetkazib berish”, “soliq”, “rasmiylashtirish” — bahonalar.",
        "A real prize costs nothing. “Delivery”, “tax” and “processing” are pretexts.",
      ),
      t(
        "Havoladagi sahifa haqiqiy bankka o‘xshatilgan bo‘lishi mumkin. Domenni diqqat bilan o‘qing: qulaybank.uz va qulaybank-bonus.top boshqa-boshqa saytlar.",
        "The linked page may copy a real bank. Read the domain carefully: qulaybank.uz and qulaybank-bonus.top are different sites.",
      ),
    ],
    task: t(
      "Nima qilishni tanlang va xabardagi xavf belgilarini toping.",
      "Choose what to do and find the red flags in the message.",
    ),
    hint: t(
      "Uch narsaga qarang: kutilmagan yutuq, to‘lov va havolaning manzili.",
      "Look at three things: the surprise prize, the payment and the link’s address.",
    ),
    widget: {
      type: "scam",
      scenario: {
        channel: "sms",
        sender: t("BONUS-UZ", "BONUS-UZ"),
        detail: t("SMS · noma’lum jo‘natuvchi", "SMS · unknown sender"),
        messages: [
          {
            from: "them",
            parts: [
              p(
                "Tabriklaymiz! Siz QulayBank aksiyasida iPhone 16 yutib oldingiz! ",
                "Congratulations! You won an iPhone 16 in the QulayBank promotion! ",
                "prize",
              ),
              p(
                "Sovg‘ani olish uchun yetkazib berish xizmati 99 000 so‘mni to‘lang: ",
                "To receive it, pay the 99,000 som delivery fee: ",
                "fee",
              ),
              p(
                "qulaybank-bonus.top/olish",
                "qulaybank-bonus.top/olish",
                "link",
              ),
              p(
                " Aksiya bugun soat 23:59 da tugaydi.",
                " The offer ends today at 23:59.",
                "rush",
              ),
            ],
          },
        ],
        flags: {
          prize: t(
            "Qatnashmagan tanlovdagi “yutuq” — firibgarlikning eng eski usuli.",
            "A “prize” from a draw you never entered is the oldest trick there is.",
          ),
          fee: t(
            "Yutuq uchun pul so‘rash — asosiy maqsad shu. Haqiqiy sovg‘a bepul.",
            "Asking money for a prize is the whole point. A real gift is free.",
          ),
          link: t(
            "Domen bankniki emas: “-bonus.top” — arzon, bir martalik sayt. U karta ma’lumotlarini o‘g‘irlaydi.",
            "The domain is not the bank’s: “-bonus.top” is a cheap throwaway site that steals card details.",
          ),
          rush: t(
            "“Bugun tugaydi” — o‘ylab ko‘rishga vaqt qoldirmaslik uchun.",
            "“Ends today” is there to stop you thinking it over.",
          ),
        },
        choices: [
          {
            label: t(
              "Havolani ochib, to‘lov qilaman — 99 ming arzon",
              "Open the link and pay — 99,000 is cheap",
            ),
            right: false,
            feedback: t(
              "Sayt karta ma’lumotlarini oladi va 99 ming emas, kartadagi hamma pulni yechadi.",
              "The site takes your card details and empties the card, not just 99,000.",
            ),
          },
          {
            label: t(
              "Havolani ochmayman, xabarni o‘chirib, raqamni bloklayman",
              "Don’t open the link; delete the message and block the sender",
            ),
            right: true,
            feedback: t(
              "To‘g‘ri. Agar bank aksiyasi haqida bilmoqchi bo‘lsangiz, bank ilovasini o‘zingiz oching.",
              "Right. To check on any bank promotion, open the bank’s app yourself.",
            ),
          },
          {
            label: t(
              "Havolani ochib, faqat qarab chiqaman",
              "Open the link just to have a look",
            ),
            right: false,
            feedback: t(
              "Ochishning o‘zi ham xavfli: sahifa sizni aldash uchun yaratilgan va ba’zan zararli fayl yuklaydi.",
              "Even opening it is risky: the page is built to trick you and may download something harmful.",
            ),
          },
        ],
        scam: true,
      },
    },
  },
  {
    id: 4,
    group: CHAT,
    title: t("Do‘stning buzilgan akkaunti", "A friend’s hacked account"),
    minutes: 5,
    intro: t(
      "Do‘stingizning Telegram akkauntidan xabar keldi: tezda pul kerak. Yozuv uslubi biroz g‘alati.",
      "A message from your friend’s Telegram account: they need money fast. The writing feels a bit off.",
    ),
    analogy: t(
      "Do‘stingiz kiyimida boshqa odam eshigingizni qoqqandek: tashqi ko‘rinish tanish, lekin ichida begona.",
      "Like a stranger at your door in your friend’s clothes: the outside is familiar, the person is not.",
    ),
    theory: [
      t(
        "Akkauntlar ko‘pincha SMS kod yoki soxta “ovoz berish” havolasi orqali buziladi. Keyin firibgar barcha kontaktlarga yozadi.",
        "Accounts are usually taken over through an SMS code or a fake “voting” link. The scammer then writes to every contact.",
      ),
      t(
        "Tekshirish oson: do‘stingizga boshqa yo‘l bilan — oddiy qo‘ng‘iroq bilan — bog‘laning.",
        "Checking is easy: reach your friend another way — a normal phone call.",
      ),
    ],
    task: t(
      "Nima qilishni tanlang va suhbatdagi xavf belgilarini toping.",
      "Choose what to do and find the red flags in the chat.",
    ),
    hint: t(
      "Qo‘ng‘iroq qilishdan qochishi va begona karta raqami — eng muhim belgilar.",
      "Avoiding a call and a stranger’s card number are the key signs.",
    ),
    widget: {
      type: "scam",
      scenario: {
        channel: "telegram",
        sender: t("Jasur (sinfdosh)", "Jasur (classmate)"),
        detail: t("oxirgi marta yaqinda ko‘rindi", "last seen recently"),
        messages: [
          {
            from: "them",
            parts: [
              p("Salom, qalaysan? ", "Hi, how are you? "),
              p(
                "Iltimos, tez 500 000 so‘m tashlab tur, ",
                "Please send me 500,000 som quickly, ",
                "money",
              ),
              p("kechqurun qaytaraman.", "I’ll pay you back tonight."),
            ],
          },
          {
            from: "me",
            parts: [
              p(
                "Nima bo‘ldi? Qo‘ng‘iroq qilaymi?",
                "What happened? Shall I call you?",
              ),
            ],
          },
          {
            from: "them",
            parts: [
              p(
                "Hozir gaplasha olmayman, yig‘ilishdaman. ",
                "I can’t talk now, I’m in a meeting. ",
                "nocall",
              ),
              p(
                "Mana bu kartaga tashla: 8600 12** **** 7731, egasi Akmal R.",
                "Send it to this card: 8600 12** **** 7731, owner Akmal R.",
                "card",
              ),
            ],
          },
        ],
        flags: {
          money: t(
            "To‘satdan va shoshilinch pul so‘rash — buzilgan akkauntning birinchi belgisi.",
            "A sudden, urgent request for money is the first sign of a hijacked account.",
          ),
          nocall: t(
            "Qo‘ng‘iroqdan qochish: firibgar ovozi bilan aldana olmaydi.",
            "Avoiding a call: the scammer cannot fake the voice.",
          ),
          card: t(
            "Pul do‘stingizga emas, begona odam kartasiga so‘ralmoqda.",
            "The money goes to a stranger’s card, not your friend’s.",
          ),
        },
        choices: [
          {
            label: t(
              "Do‘st-ku, darhol tashlab beraman",
              "It’s my friend — send it right away",
            ),
            right: false,
            feedback: t(
              "Pul firibgar kartasiga ketadi, do‘stingiz esa bundan bexabar.",
              "The money goes to the scammer’s card; your friend knows nothing about it.",
            ),
          },
          {
            label: t(
              "Jasurga oddiy telefon orqali qo‘ng‘iroq qilib, so‘rayman",
              "Call Jasur on his phone number and ask",
            ),
            right: true,
            feedback: t(
              "To‘g‘ri. Agar akkaunt buzilgan bo‘lsa, Jasurga ham, boshqa do‘stlarga ham ayting.",
              "Right. If the account was hacked, tell Jasur and your other friends too.",
            ),
          },
          {
            label: t(
              "Shu chatda “bu rostdan senmisan?” deb so‘rayman",
              "Ask in this chat: “is it really you?”",
            ),
            right: false,
            feedback: t(
              "Firibgar albatta “ha, menman” deb javob beradi. Boshqa kanal orqali tekshiring.",
              "The scammer will of course say “yes, it’s me”. Check another way.",
            ),
          },
        ],
        scam: true,
      },
    },
  },
  {
    id: 5,
    group: CHAT,
    title: t("“Uydan turib kuniga 300 ming”", "“300,000 a day from home”"),
    minutes: 5,
    intro: t(
      "Telegramda ish taklifi: oddiy vazifalar uchun katta pul. Birinchi kun hatto ozgina pul ham to‘lashadi.",
      "A job offer on Telegram: big money for simple tasks. On day one they even pay you a little.",
    ),
    analogy: t(
      "Baliq ovidagi xo‘rak: avval kichik yutuq beriladi, keyin katta ilmoq tortiladi.",
      "Bait on a fishing hook: first a small win, then the big pull.",
    ),
    theory: [
      t(
        "Sxema: oson vazifa → kichik to‘lov → “katta vazifa uchun depozit kiriting” → pul qaytmaydi.",
        "The pattern: easy task → small payout → “make a deposit for bigger tasks” → the money never comes back.",
      ),
      t(
        "Haqiqiy ish beruvchi sizdan pul so‘ramaydi. Ishga kirish uchun to‘lov — doim firibgarlik.",
        "A real employer does not ask you for money. Paying to get a job is always a scam.",
      ),
    ],
    task: t(
      "Nima qilishni tanlang va xabarlardagi xavf belgilarini toping.",
      "Choose what to do and find the red flags in the messages.",
    ),
    hint: t(
      "Daromad miqdori, “tajriba shart emas” va depozitga e’tibor bering.",
      "Look at the pay, “no experience needed” and the deposit.",
    ),
    widget: {
      type: "scam",
      scenario: {
        channel: "telegram",
        sender: t("HR Menejer Dilnoza", "HR Manager Dilnoza"),
        detail: t(
          "sizga birinchi marta yozmoqda",
          "writing to you for the first time",
        ),
        messages: [
          {
            from: "them",
            parts: [
              p(
                "Assalomu alaykum! Kompaniyamizga masofaviy xodim kerak. ",
                "Hello! Our company needs a remote worker. ",
              ),
              p(
                "Kuniga 300 000 so‘mdan, tajriba shart emas — ",
                "300,000 som a day, no experience needed — ",
                "money",
              ),
              p(
                "faqat mahsulotlarga layk bosasiz.",
                "you just like products.",
                "easy",
              ),
            ],
          },
          {
            from: "me",
            parts: [
              p("Qiziq. Nima qilish kerak?", "Interesting. What do I do?"),
            ],
          },
          {
            from: "them",
            parts: [
              p(
                "Birinchi 3 ta vazifa uchun 15 000 so‘m tashladik ✅ ",
                "We’ve sent you 15,000 som for the first 3 tasks ✅ ",
                "bait",
              ),
              p(
                "Endi VIP vazifalar uchun 200 000 so‘m depozit kiriting, ",
                "Now make a 200,000 som deposit for VIP tasks, ",
                "deposit",
              ),
              p("u foyda bilan qaytariladi.", "it comes back with profit."),
            ],
          },
        ],
        flags: {
          money: t(
            "Tajribasiz ish uchun kuniga 300 ming — haqiqatga to‘g‘ri kelmaydi.",
            "300,000 a day with no experience is not realistic.",
          ),
          easy: t(
            "Ma’nosiz oson vazifa — sizni jalb qilish uchun.",
            "A pointless, easy task is there to draw you in.",
          ),
          bait: t(
            "Kichik to‘lov ishonch qozonish uchun. Bu keyingi katta pulning xo‘ragi.",
            "The small payout buys your trust. It is bait for the bigger sum.",
          ),
          deposit: t(
            "Ish uchun depozit so‘rash — firibgarlikning asosiy qismi. Pul qaytmaydi.",
            "A deposit to work is the core of the scam. The money never returns.",
          ),
        },
        choices: [
          {
            label: t(
              "15 ming kelgan-ku, depozit kiritaman",
              "They paid 15,000 — I’ll make the deposit",
            ),
            right: false,
            feedback: t(
              "15 ming — xo‘rak. Depozitdan keyin “yana to‘lang” deyiladi, keyin akkaunt yo‘qoladi.",
              "The 15,000 was bait. After the deposit comes “pay more”, then the account vanishes.",
            ),
          },
          {
            label: t(
              "Hech narsa to‘lamayman, suhbatni to‘xtatib, akkauntga shikoyat qilaman",
              "Pay nothing, stop the chat and report the account",
            ),
            right: true,
            feedback: t(
              "To‘g‘ri. Ish uchun pul to‘lash — doim firibgarlik.",
              "Right. Paying to work is always a scam.",
            ),
          },
          {
            label: t(
              "Kichikroq depozit — 50 ming bilan sinab ko‘raman",
              "Try a smaller deposit — 50,000",
            ),
            right: false,
            feedback: t(
              "Summa kichik bo‘lsa ham natija bir xil: pul qaytmaydi.",
              "A smaller sum ends the same way: the money does not come back.",
            ),
          },
        ],
        scam: true,
      },
    },
  },
  {
    id: 6,
    group: CHAT,
    title: t("Soxta ilova fayli", "A fake app file"),
    minutes: 5,
    intro: t(
      "Guruhda “davlat subsidiyasi” haqida xabar: pul olish uchun yangi ilovani o‘rnatish kerak. Ilova fayl ko‘rinishida yuborilgan.",
      "A group post about a “state subsidy”: to get it, install a new app. The app is sent as a file.",
    ),
    analogy: t(
      "Notanish odam “bu dori, iching” deb idishsiz tabletka berishiga o‘xshaydi.",
      "Like a stranger handing you an unlabelled pill and saying “it’s medicine”.",
    ),
    theory: [
      t(
        ".apk fayl — Android ilovasi. Chatdan o‘rnatilgan ilova SMS larni o‘qib, kodlarni firibgarga yuborishi mumkin.",
        "An .apk file is an Android app. One installed from a chat can read your SMS and send the codes to a scammer.",
      ),
      t(
        "Davlat xizmatlari va banklar ilovalari faqat rasmiy do‘konda (Google Play, App Store) bo‘ladi.",
        "Government and bank apps live only in the official stores (Google Play, App Store).",
      ),
    ],
    task: t(
      "Nima qilishni tanlang va xabardagi xavf belgilarini toping.",
      "Choose what to do and find the red flags in the post.",
    ),
    hint: t(
      "Fayl turi, “subsidiya” va so‘ralgan ruxsatlarga qarang.",
      "Look at the file type, the “subsidy” and the permissions it wants.",
    ),
    widget: {
      type: "scam",
      scenario: {
        channel: "telegram",
        sender: t("Mahalla yangiliklari 📢", "Neighbourhood news 📢"),
        detail: t("guruh · 3 412 a’zo", "group · 3,412 members"),
        messages: [
          {
            from: "them",
            parts: [
              p(
                "Diqqat! Har bir oilaga 1 200 000 so‘m subsidiya ajratildi! ",
                "Attention! Every family gets a 1,200,000 som subsidy! ",
                "prize",
              ),
              p(
                "Olish uchun “Davlat Yordam” ilovasini o‘rnating: ",
                "To receive it, install the “State Help” app: ",
              ),
              p("DavlatYordam_v2.apk", "DavlatYordam_v2.apk", "apk"),
            ],
          },
          {
            from: "them",
            parts: [
              p(
                "O‘rnatishda SMS va bildirishnomalarga ruxsat bering, ",
                "When installing, allow access to SMS and notifications, ",
                "perm",
              ),
              p("aks holda pul tushmaydi.", "or the money won’t arrive."),
            ],
          },
        ],
        flags: {
          prize: t(
            "Hammaga “pul berilmoqda” — ishonchli manbasiz va’da.",
            "“Money for everyone” is a promise with no trustworthy source.",
          ),
          apk: t(
            "Chatda yuborilgan .apk — rasmiy do‘kondan emas. Bu telefonni boshqaradigan dastur bo‘lishi mumkin.",
            "An .apk sent in a chat is not from the official store. It may be software that takes over the phone.",
          ),
          perm: t(
            "SMS ga ruxsat — kodlaringizni o‘qish uchun. Subsidiya ilovasiga bu kerak emas.",
            "SMS access is for reading your codes. A subsidy app does not need it.",
          ),
        },
        choices: [
          {
            label: t(
              "Faylni o‘rnatib, ruxsatlarni beraman",
              "Install the file and allow the permissions",
            ),
            right: false,
            feedback: t(
              "Ilova SMS kodlarni firibgarga yuboradi — kartangiz va akkauntlaringiz xavf ostida qoladi.",
              "The app forwards your SMS codes to the scammer — your card and accounts are at risk.",
            ),
          },
          {
            label: t(
              "Faylni ochmayman; rasmiy saytdan yoki do‘kondan tekshiraman va guruhga ogohlantiraman",
              "Don’t open it; check the official site or store, and warn the group",
            ),
            right: true,
            feedback: t(
              "To‘g‘ri. Rasmiy dasturlar faqat rasmiy do‘konda. Boshqalarni ogohlantirish ham muhim.",
              "Right. Official apps live only in the official store. Warning others matters too.",
            ),
          },
          {
            label: t(
              "O‘rnataman, lekin ruxsat bermayman",
              "Install it but refuse the permissions",
            ),
            right: false,
            feedback: t(
              "Begona ilovani o‘rnatishning o‘zi xavfli: u keyinroq ruxsat so‘rashi yoki zaiflikdan foydalanishi mumkin.",
              "Installing an unknown app is risky in itself: it can ask again later or abuse a weakness.",
            ),
          },
        ],
        scam: true,
      },
    },
  },
  {
    id: 7,
    group: MONEY,
    title: t("E’lon saytidagi “xaridor”", "The “buyer” on a classifieds site"),
    minutes: 6,
    intro: t(
      "Siz eski velosipedni sotmoqchisiz. Xaridor darhol rozi bo‘ladi va pulni “havola orqali” yuborishni taklif qiladi.",
      "You are selling an old bike. A buyer agrees at once and offers to send the money “through a link”.",
    ),
    analogy: t(
      "Pul olish uchun seyfingiz kodini aytishingiz kerak, deyishlariga o‘xshaydi — mantiqsiz.",
      "Like being told you must share your safe’s code to receive money — it makes no sense.",
    ),
    theory: [
      t(
        "Pul qabul qilish uchun karta raqami yetarli. Amal qilish muddati, CVV yoki SMS kod faqat pul YECHISH uchun kerak.",
        "To receive money, the card number is enough. The expiry date, CVV or SMS code are only for TAKING money.",
      ),
      t(
        "Firibgarlar sotuvchini sayt chatidan messenjerga olib chiqadi — u yerda sayt himoya qilmaydi.",
        "Scammers move sellers from the site’s chat to a messenger, where the site cannot protect them.",
      ),
    ],
    task: t(
      "Nima qilishni tanlang va suhbatdagi xavf belgilarini toping.",
      "Choose what to do and find the red flags in the chat.",
    ),
    hint: t(
      "Messenjerga o‘tish, havola va karta ma’lumotlari so‘rovi.",
      "Moving to a messenger, the link and the request for card details.",
    ),
    widget: {
      type: "scam",
      scenario: {
        channel: "market",
        sender: t("Xaridor · BozorPlus", "Buyer · BozorPlus"),
        detail: t(
          "“Velosiped, 26 dyuym — 900 000 so‘m”",
          "“Bike, 26 inch — 900,000 som”",
        ),
        messages: [
          {
            from: "them",
            parts: [
              p(
                "Salom, velosiped hali bormi? Ko‘rmasdan olaman! ",
                "Hi, is the bike still there? I’ll take it unseen! ",
                "unseen",
              ),
              p(
                "Telegramda yozing, shu yerda noqulay: @bozor_xaridor",
                "Write to me on Telegram, it’s awkward here: @bozor_xaridor",
                "move",
              ),
            ],
          },
          {
            from: "them",
            parts: [
              p(
                "Pulni BozorPlus xavfsiz to‘lovi orqali yubordim. ",
                "I sent the money through BozorPlus safe payment. ",
              ),
              p(
                "Olish uchun bu havolani oching: bozorplus-pay.site/qabul ",
                "To receive it, open this link: bozorplus-pay.site/qabul ",
                "link",
              ),
              p(
                "va karta raqami, amal qilish muddati va CVV ni kiriting.",
                "and enter your card number, expiry date and CVV.",
                "card",
              ),
            ],
          },
        ],
        flags: {
          unseen: t(
            "Mahsulotni ko‘rmasdan, savdolashmasdan olishga rozilik — g‘ayrioddiy.",
            "Agreeing to buy unseen, without haggling, is unusual.",
          ),
          move: t(
            "Sayt chatidan chiqarish — sayt himoyasi va shikoyat tugmasidan uzoqlashtirish.",
            "Moving you off the site’s chat takes you away from its protection and report button.",
          ),
          link: t(
            "Domen saytniki emas: “-pay.site” — soxta to‘lov sahifasi.",
            "The domain is not the site’s: “-pay.site” is a fake payment page.",
          ),
          card: t(
            "Pul olish uchun CVV va muddat kerak emas. Bu ma’lumotlar bilan kartadan pul yechiladi.",
            "Receiving money needs no CVV or expiry date. With them, money is taken from the card.",
          ),
        },
        choices: [
          {
            label: t(
              "Havolani ochib, ma’lumotlarni kiritaman",
              "Open the link and enter the details",
            ),
            right: false,
            feedback: t(
              "Bu sahifa karta ma’lumotlarini o‘g‘irlaydi — pul tushmaydi, aksincha yechiladi.",
              "The page steals your card details — no money arrives; money leaves.",
            ),
          },
          {
            label: t(
              "Faqat sayt chatida gaplashaman, havolani ochmayman va xaridorga shikoyat qilaman",
              "Keep to the site’s chat, don’t open the link, and report the buyer",
            ),
            right: true,
            feedback: t(
              "To‘g‘ri. Uchrashib, naqd yoki o‘z bankingiz ilovasi orqali hisoblashish xavfsizroq.",
              "Right. Meeting in person and settling in cash or through your own bank app is safer.",
            ),
          },
          {
            label: t(
              "Faqat karta raqamini kiritaman, CVV ni emas",
              "Enter only the card number, not the CVV",
            ),
            right: false,
            feedback: t(
              "Soxta sahifani ishlatishni davom ettirmang: keyingi qadamda u SMS kodni so‘raydi.",
              "Don’t keep using a fake page: its next step asks for the SMS code.",
            ),
          },
        ],
        scam: true,
      },
    },
  },
  {
    id: 8,
    group: MONEY,
    title: t("“Oyiga 40% foyda”", "“40% profit a month”"),
    minutes: 6,
    intro: t(
      "Instagramdagi tanish blogger kriptovalyuta “investitsiya klubi”ni reklama qilmoqda: kafolatlangan katta foyda.",
      "A blogger you follow is promoting a crypto “investment club”: guaranteed, big returns.",
    ),
    analogy: t(
      "Qor odam yasashga o‘xshaydi: yangi qo‘shilganlarning puli eskilariga “foyda” sifatida beriladi, oxirida hammasi eriydi.",
      "Like a snowman: new members’ money is paid to older ones as “profit”, and in the end it all melts.",
    ),
    theory: [
      t(
        "Hech bir halol investitsiya oyiga 40% va kafolat bermaydi. Kafolatlangan yuqori foyda — piramida belgisi.",
        "No honest investment pays 40% a month with a guarantee. Guaranteed high returns are the mark of a pyramid.",
      ),
      t(
        "“Do‘st olib kelsang bonus” — yangi qurbonlarni jalb qilish tizimi.",
        "“Bring a friend for a bonus” is the system for recruiting new victims.",
      ),
    ],
    task: t(
      "Nima qilishni tanlang va reklamadagi xavf belgilarini toping.",
      "Choose what to do and find the red flags in the advert.",
    ),
    hint: t(
      "Foyda miqdori, “kafolat” va do‘st taklif qilish uchun bonus.",
      "The size of the profit, the “guarantee” and the bonus for bringing friends.",
    ),
    widget: {
      type: "scam",
      scenario: {
        channel: "telegram",
        sender: t("CryptoKlub UZ 💎", "CryptoKlub UZ 💎"),
        detail: t("kanal · reklama", "channel · advert"),
        messages: [
          {
            from: "them",
            parts: [
              p(
                "Pulingizni ishlating! Oyiga 40% foyda, ",
                "Put your money to work! 40% profit a month, ",
                "profit",
              ),
              p("100% kafolat bilan. ", "100% guaranteed. ", "guarantee"),
              p(
                "Minimal kirish — atigi 500 000 so‘m.",
                "Minimum entry — just 500,000 som.",
              ),
            ],
          },
          {
            from: "them",
            parts: [
              p(
                "Har bir taklif qilingan do‘st uchun +10% bonus! ",
                "+10% bonus for every friend you invite! ",
                "pyramid",
              ),
              p(
                "Joylar cheklangan — bugun qo‘shiling!",
                "Places are limited — join today!",
                "rush",
              ),
            ],
          },
        ],
        flags: {
          profit: t(
            "Oyiga 40% — yiliga bir necha baravar. Bunday daromad halol bozorda yo‘q.",
            "40% a month is several times your money in a year. No honest market pays that.",
          ),
          guarantee: t(
            "Investitsiyada kafolat bo‘lmaydi. “100% kafolat” — yolg‘on.",
            "Investments carry no guarantee. “100% guaranteed” is a lie.",
          ),
          pyramid: t(
            "Do‘st olib kelish uchun bonus — piramida tuzilmasi belgisi.",
            "A bonus for bringing friends is the mark of a pyramid scheme.",
          ),
          rush: t(
            "“Joylar cheklangan” — shoshiltirish usuli.",
            "“Places are limited” is a way to rush you.",
          ),
        },
        choices: [
          {
            label: t(
              "Bir oy sinab ko‘raman, keyin pulni olaman",
              "Try it for a month, then take the money out",
            ),
            right: false,
            feedback: t(
              "Bunday klublar dastlab kichik “foyda” ko‘rsatadi, lekin pulni yechishga yo‘l qo‘ymaydi.",
              "Such clubs show a small “profit” at first but never let you withdraw.",
            ),
          },
          {
            label: t(
              "Qo‘shilmayman; bu piramida ekanini tushuntirib, oilamni ogohlantiraman",
              "Don’t join; explain it’s a pyramid and warn my family",
            ),
            right: true,
            feedback: t(
              "To‘g‘ri. Kafolatlangan katta foyda va’dasi doim piramida yoki firibgarlik.",
              "Right. A promise of big guaranteed profit is always a pyramid or a scam.",
            ),
          },
          {
            label: t(
              "Do‘stlarimni ham taklif qilib, bonus olaman",
              "Invite my friends too and get the bonus",
            ),
            right: false,
            feedback: t(
              "Bu bilan do‘stlaringizni ham qurbonga aylantirasiz.",
              "That turns your friends into victims as well.",
            ),
          },
        ],
        scam: true,
      },
    },
  },
];
