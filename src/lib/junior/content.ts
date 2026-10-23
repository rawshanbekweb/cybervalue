import { base64Encode, caesar, type Text } from "./logic";

// Cybervalue Academy Junior: an entry point for 7th-grade students. Every text
// is a { uz, en } pair, so a mission is edited in one place and cannot lose a
// translation (tests assert both sides are present).

export type MissionId =
  | "password"
  | "phishing"
  | "cipher"
  | "footprint"
  | "ctf"
  | "ethics"
  | "permissions"
  | "wifi";

export type Mission = {
  id: MissionId;
  number: number;
  title: Text;
  minutes: number;
  hook: Text;
  goal: Text;
};

export const MISSIONS: readonly Mission[] = [
  {
    id: "password",
    number: 1,
    title: { uz: "Parol ustasi", en: "Password master" },
    minutes: 5,
    hook: {
      uz: "Parolingni buzish uchun kompyuterga qancha vaqt kerak bo‘ladi?",
      en: "How long would a computer need to crack your password?",
    },
    goal: {
      uz: "Hujumchi kamida 10 yilda ham topa olmaydigan parol yarating.",
      en: "Build a password an attacker could not guess in at least 10 years.",
    },
  },
  {
    id: "phishing",
    number: 2,
    title: { uz: "Fishingni top", en: "Spot the phish" },
    minutes: 6,
    hook: {
      uz: "Aldovchilar sizni xabar orqali tuzoqqa tushirishga urinadi.",
      en: "Scammers try to trap you with a message.",
    },
    goal: {
      uz: "5 ta xabardan kamida 4 tasini to‘g‘ri aniqlang.",
      en: "Classify at least 4 of the 5 messages correctly.",
    },
  },
  {
    id: "cipher",
    number: 3,
    title: { uz: "Maxfiy shifr", en: "The secret cipher" },
    minutes: 5,
    hook: {
      uz: "Yuliy Sezar 2000 yil oldin xabarlarini shunday yashirgan.",
      en: "Julius Caesar hid his messages like this 2,000 years ago.",
    },
    goal: {
      uz: "Shifrlangan xabarni oching va yashirin so‘zni toping.",
      en: "Decode the message and find the hidden word.",
    },
  },
  {
    id: "footprint",
    number: 4,
    title: { uz: "Raqamli iz", en: "Digital footprint" },
    minutes: 5,
    hook: {
      uz: "Bitta oddiy post sizning haqingizda juda ko‘p narsani aytib beradi.",
      en: "One ordinary post can tell a stranger a lot about you.",
    },
    goal: {
      uz: "Postdagi xavfli joylarni belgilang.",
      en: "Mark every risky detail in the post.",
    },
  },
  {
    id: "ctf",
    number: 5,
    title: { uz: "Birinchi CTF", en: "Your first CTF" },
    minutes: 8,
    hook: {
      uz: "Xakerlar musobaqasi: yashirin bayroqlarni topasiz.",
      en: "A hackers’ contest: you hunt for hidden flags.",
    },
    goal: {
      uz: "Uchta bayroqni toping: CV{...} ko‘rinishida.",
      en: "Find three flags that look like CV{...}.",
    },
  },
  {
    id: "ethics",
    number: 6,
    title: { uz: "Etik xaker qoidalari", en: "The ethical hacker’s rules" },
    minutes: 4,
    hook: {
      uz: "Bilim kuch beradi. Kuch esa mas’uliyat talab qiladi.",
      en: "Knowledge is power, and power comes with responsibility.",
    },
    goal: {
      uz: "5 ta vaziyatda to‘g‘ri qaror qabul qiling.",
      en: "Make the right call in all 5 situations.",
    },
  },
  {
    id: "permissions",
    number: 7,
    title: { uz: "Ruxsatlar ovchisi", en: "Permission hunter" },
    minutes: 5,
    hook: {
      uz: "Oddiy fonar ilovasi nega kontaktlaringizni so‘raydi?",
      en: "Why would a simple flashlight app want your contacts?",
    },
    goal: {
      uz: "Ikki ilovaning har bir ruxsatini to‘g‘ri bering yoki rad eting.",
      en: "Allow or deny every permission of two apps correctly.",
    },
  },
  {
    id: "wifi",
    number: 8,
    title: { uz: "Wi-Fi tuzog‘i", en: "The Wi-Fi trap" },
    minutes: 5,
    hook: {
      uz: "Bepul Wi-Fi qulay — lekin uni kim tarqatayotganini bilasizmi?",
      en: "Free Wi-Fi is handy — but do you know who is running it?",
    },
    goal: {
      uz: "6 ta vaziyatda xavfsiz va xavfli harakatni ajrating.",
      en: "Tell the safe move from the risky one in all 6 situations.",
    },
  },
];

export const MISSION_IDS = MISSIONS.map((mission) => mission.id);

/**
 * The six missions of the Cyber HQ case. The case and the certificate need
 * these; later missions add XP and badges but never reopen a closed case.
 */
export type CaseMissionId = Exclude<MissionId, "permissions" | "wifi">;
export const CASE_MISSION_IDS: readonly CaseMissionId[] = [
  "password",
  "phishing",
  "cipher",
  "footprint",
  "ctf",
  "ethics",
];

// 1 · Passwords --------------------------------------------------------------

export const PASSWORD_TRIES: readonly { value: string; note: Text }[] = [
  {
    value: "parol123",
    note: {
      uz: "Eng ko‘p ishlatiladigan parollardan biri.",
      en: "One of the most common passwords.",
    },
  },
  {
    value: "P@ssw0rd",
    note: {
      uz: "Harflarni belgilarga almashtirish deyarli yordam bermaydi.",
      en: "Swapping letters for symbols barely helps.",
    },
  },
  {
    value: "olma-bulut-ko‘k-tosh",
    note: {
      uz: "Tasodifiy so‘zlar uzun va eslab qolish oson.",
      en: "Random words are long and easy to remember.",
    },
  },
];

// 2 · Phishing ---------------------------------------------------------------

export type PhishingCase = {
  id: string;
  from: string;
  channel: Text;
  body: Text;
  link?: string;
  phishing: boolean;
  clue: Text;
};

export const PHISHING: readonly PhishingCase[] = [
  {
    id: "bank-sms",
    from: "+998 90 *** ** 12",
    channel: { uz: "SMS", en: "SMS" },
    body: {
      uz: "DIQQAT! Bank kartangiz bloklandi. 30 daqiqa ichida tasdiqlang, aks holda pul yo‘qoladi.",
      en: "WARNING! Your bank card is blocked. Confirm within 30 minutes or your money is lost.",
    },
    link: "uz-bank-tasdiq.top/kirish",
    phishing: true,
    clue: {
      uz: "Shoshirish va qo‘rqitish, begona sayt manzili. Bank hech qachon SMS havola orqali parol so‘ramaydi.",
      en: "Rushing and scaring you, plus an unknown website. A bank never asks for your password through an SMS link.",
    },
  },
  {
    id: "teacher-chat",
    from: "Informatika o‘qituvchisi",
    channel: { uz: "Sinf guruhi", en: "Class group" },
    body: {
      uz: "Ertaga 2-darsda kompyuter xonasida uchrashamiz. Noutbuk olib kelish shart emas.",
      en: "Tomorrow, 2nd period, we meet in the computer room. No need to bring a laptop.",
    },
    phishing: false,
    clue: {
      uz: "Tanish odam, tanish guruh, havola ham, parol so‘rovi ham yo‘q.",
      en: "A known person in a known group, with no link and no request for a password.",
    },
  },
  {
    id: "game-prize",
    from: "GIFT-Center",
    channel: { uz: "O‘yin chati", en: "Game chat" },
    body: {
      uz: "Tabriklaymiz! Siz 500 000 so‘m yutdingiz. Olish uchun akkaunt parolingiz va SMS kodni yuboring.",
      en: "Congratulations! You won 500,000 soum. To claim it, send your account password and the SMS code.",
    },
    phishing: true,
    clue: {
      uz: "Tekin sovg‘a va parol so‘rovi: haqiqiy sovrin uchun hech qachon parol kerak bo‘lmaydi. SMS kod esa hech kimga aytilmaydi.",
      en: "A free prize plus a request for your password. A real prize never needs one, and an SMS code is never shared.",
    },
  },
  {
    id: "account-notice",
    from: "no-reply@accounts.google.com",
    channel: { uz: "Elektron pochta", en: "Email" },
    body: {
      uz: "Hisobingizga yangi qurilmadan kirildi. Agar bu siz bo‘lmasangiz, brauzerda accounts.google.com sahifasini o‘zingiz ochib, parolni almashtiring.",
      en: "Your account was signed in to from a new device. If this wasn’t you, open accounts.google.com yourself in the browser and change your password.",
    },
    phishing: false,
    clue: {
      uz: "Xabar sizni havolaga bosishga undamaydi: rasmiy sahifani o‘zingiz ochasiz. Bu to‘g‘ri odat.",
      en: "The message does not push you to click a link: you open the official page yourself. That is the right habit.",
    },
  },
  {
    id: "friend-dm",
    from: "Do‘stingiz (akkaunti buzilgan bo‘lishi mumkin)",
    channel: { uz: "Shaxsiy xabar", en: "Direct message" },
    body: {
      uz: "Salom!! Bu videodagi sen emasmisan?? 😱 Tezroq ko‘r, o‘chirib yuborishadi!",
      en: "Hey!! Isn’t this you in the video?? 😱 Watch quick before they delete it!",
    },
    link: "bit.ly/3xQ-video",
    phishing: true,
    clue: {
      uz: "Kutilmagan havola va qiziqtirish. Buzilgan akkauntlar shunday tarqaladi: avval do‘stingizdan boshqa yo‘l bilan so‘rang.",
      en: "An unexpected link and bait. Hacked accounts spread like this: ask your friend another way first.",
    },
  },
];

export const PHISHING_PASS = 4;

// 3 · Caesar cipher ----------------------------------------------------------

export const CIPHER_SHIFT = 7;
export const CIPHER_PLAIN = "MY SECRET WORD IS FIREWALL";
export const CIPHER_TEXT = caesar(CIPHER_PLAIN, CIPHER_SHIFT);
export const CIPHER_ANSWER = "firewall";

// 4 · Digital footprint ------------------------------------------------------

export type FootprintItem = {
  id: string;
  text: Text;
  risky: boolean;
  why: Text;
};

export const FOOTPRINT_POST: Text = {
  uz: "@aziza_07 · Bugun yangi maktab formamda! 🎒",
  en: "@aziza_07 · Me in my new school uniform today! 🎒",
};

export const FOOTPRINT: readonly FootprintItem[] = [
  {
    id: "badge",
    text: {
      uz: "Rasmda formadagi maktab nishoni va 12-maktab yozuvi ko‘rinadi",
      en: "The photo shows the school badge and “School 12” on the uniform",
    },
    risky: true,
    why: {
      uz: "Begona odam sizni qaysi maktabda o‘qishingizni biladi.",
      en: "A stranger now knows which school you attend.",
    },
  },
  {
    id: "live-location",
    text: {
      uz: "Joylashuv belgisi: “Navoiy ko‘chasi, hozir shu yerda”",
      en: "Location tag: “Navoi Street, right now”",
    },
    risky: true,
    why: {
      uz: "Real vaqtdagi joylashuv sizni kuzatishni osonlashtiradi. Joyni keyinroq yoki umuman qo‘shmang.",
      en: "A live location makes you easy to follow. Share places later, or not at all.",
    },
  },
  {
    id: "birthday",
    text: {
      uz: "Izoh: “14-mart tug‘ilgan kunim, hammaga rahmat!”",
      en: "Caption: “March 14 is my birthday, thanks everyone!”",
    },
    risky: true,
    why: {
      uz: "Tug‘ilgan sana ko‘pincha parol va xavfsizlik savollarida ishlatiladi.",
      en: "A birthday is often used in passwords and security questions.",
    },
  },
  {
    id: "wifi-sticker",
    text: {
      uz: "Orqadagi devorda Wi‑Fi parolli qog‘oz ko‘rinib turibdi",
      en: "A sticky note with the Wi‑Fi password is visible on the wall behind",
    },
    risky: true,
    why: {
      uz: "Rasm fonidagi narsalar ham ma’lumot beradi. Yuborishdan oldin orqa fonni tekshiring.",
      en: "Background objects leak information too. Check behind you before posting.",
    },
  },
  {
    id: "pet",
    text: {
      uz: "Izoh: “Mushugim Barsik ham kutib oldi”",
      en: "Caption: “My cat Barsik welcomed me too”",
    },
    risky: true,
    why: {
      uz: "Uy hayvoni ismi tez-tez xavfsizlik savoli yoki parol bo‘ladi.",
      en: "A pet’s name is a common security question or password.",
    },
  },
  {
    id: "hashtag",
    text: {
      uz: "Teg: #oqish #maktab",
      en: "Hashtag: #school #study",
    },
    risky: false,
    why: {
      uz: "Umumiy mavzu, shaxsiy ma’lumot yo‘q.",
      en: "A general topic with no personal detail.",
    },
  },
  {
    id: "friend-tag",
    text: {
      uz: "Do‘stingiz Aziz belgilangan (u o‘zi ruxsat bergan)",
      en: "Your friend Aziz is tagged (with his permission)",
    },
    risky: false,
    why: {
      uz: "Ruxsati bilan belgilash odatda zararsiz. Ruxsatsiz esa so‘rab oling.",
      en: "Tagging with permission is usually fine. Without it, ask first.",
    },
  },
];

// 5 · First CTF --------------------------------------------------------------

export type Flag = {
  id: string;
  title: Text;
  task: Text;
  hint: Text;
  flag: string;
};

export const CTF_FLAGS: readonly Flag[] = [
  {
    id: "source",
    title: { uz: "Sahifa ichida", en: "Inside the page" },
    task: {
      uz: "Quyidagi sahifaning kodini diqqat bilan o‘qing. Dasturchilar ba’zan qoldirgan izohlarda sir bo‘ladi.",
      en: "Read the page code below carefully. Developers sometimes leave secrets in comments.",
    },
    hint: {
      uz: "<!-- va --> belgilari orasidagi matn brauzerda ko‘rinmaydi.",
      en: "Text between <!-- and --> is invisible in the browser.",
    },
    flag: "CV{birinchi_qadam}",
  },
  {
    id: "base64",
    title: { uz: "G‘alati harflar", en: "Strange letters" },
    task: {
      uz: "Bu matn Base64 usulida yozilgan. Uni pastdagi asbob bilan o‘qib chiqing.",
      en: "This text is written in Base64. Read it with the tool below.",
    },
    hint: {
      uz: "Base64 shifr emas, shunchaki boshqacha yozuv. Kalit kerak emas.",
      en: "Base64 is not encryption, just another way of writing. No key needed.",
    },
    flag: "CV{base64_sir_emas}",
  },
  {
    id: "reverse",
    title: { uz: "Orqaga o‘qi", en: "Read it backwards" },
    task: {
      uz: "Bayroq teskari yozilgan. Uni to‘g‘ri tartibga keltiring.",
      en: "The flag is written backwards. Put it in the right order.",
    },
    hint: {
      uz: "Oxirgi belgidan boshlab o‘qing.",
      en: "Start reading from the last character.",
    },
    flag: "CV{teskari_dunyo}",
  },
];

export const CTF_PAGE_SOURCE = `<html>
  <body>
    <h1>Maktab kutubxonasi</h1>
    <p>Xush kelibsiz!</p>
    <!-- TODO: ${CTF_FLAGS[0].flag} -->
  </body>
</html>`;

export const CTF_BASE64 = base64Encode(CTF_FLAGS[1].flag);
export const CTF_REVERSED = [...CTF_FLAGS[2].flag].reverse().join("");

// 6 · Ethics -----------------------------------------------------------------

export type EthicsCase = {
  id: string;
  situation: Text;
  allowed: boolean;
  why: Text;
};

export const ETHICS: readonly EthicsCase[] = [
  {
    id: "friend-account",
    situation: {
      uz: "Do‘stingiz Instagram parolini taxmin qilib, hazil uchun kirib ko‘rasiz.",
      en: "You guess a friend’s Instagram password and sign in “as a joke”.",
    },
    allowed: false,
    why: {
      uz: "Egasining ruxsatisiz kirish hazil emas, qonunbuzarlik. Hazil bo‘lsa ham.",
      en: "Getting into an account without the owner’s permission is a crime, joke or not.",
    },
  },
  {
    id: "lab",
    situation: {
      uz: "O‘qituvchi ruxsati bilan maxsus o‘quv laboratoriyasida zaiflik izlaysiz.",
      en: "With your teacher’s permission, you look for weaknesses in a training lab built for it.",
    },
    allowed: true,
    why: {
      uz: "Ruxsat bor, muhit mashq uchun yaratilgan. Etik xakerlik aynan shunday boshlanadi.",
      en: "You have permission and the place is made for practice. This is how ethical hacking starts.",
    },
  },
  {
    id: "school-wifi",
    situation: {
      uz: "Maktab Wi‑Fi parolini “faqat sinab ko‘rish uchun” buzishga urinasiz.",
      en: "You try to crack the school Wi‑Fi password “just to see if it works”.",
    },
    allowed: false,
    why: {
      uz: "Boshqaning tarmog‘iga ruxsatsiz urinish mumkin emas. Qiziqsangiz, o‘z uy tarmog‘ingizda ota-ona ruxsati bilan o‘rganing.",
      en: "Attacking a network that isn’t yours is not allowed. If you’re curious, learn on your own home network with a parent’s permission.",
    },
  },
  {
    id: "own-practice",
    situation: {
      uz: "Uyda o‘quv platformasidagi CTF topshiriqlarini yechasiz.",
      en: "At home, you solve CTF challenges on a learning platform.",
    },
    allowed: true,
    why: {
      uz: "Topshiriqlar aynan mashq qilish uchun tayyorlangan va hech kimga zarar yetkazmaydi.",
      en: "The challenges are built for practice and harm nobody.",
    },
  },
  {
    id: "report-bug",
    situation: {
      uz: "Biror saytda boshqa odamning ma’lumoti ko‘rinib qolganini payqadingiz va uni ustozingizga yoki sayt egasiga xabar qilasiz.",
      en: "You notice a site showing another person’s data, and you report it to your teacher or the site owner.",
    },
    allowed: true,
    why: {
      uz: "Topgan narsangizni sinab ko‘rib ketmasdan, mas’uliyat bilan xabar berish: haqiqiy mutaxassis shunday qiladi.",
      en: "Reporting responsibly instead of poking around is exactly what a real professional does.",
    },
  },
];

export const ETHICS_PASS = ETHICS.length;

// 7 · App permissions --------------------------------------------------------

export type PermissionCase = {
  id: string;
  app: Text;
  permission: Text;
  needed: boolean;
  why: Text;
};

export const PERMISSIONS: readonly PermissionCase[] = [
  {
    id: "torch-camera",
    app: { uz: "Fonar Pro", en: "Torch Pro" },
    permission: { uz: "Kamera (chiroq)", en: "Camera (flash)" },
    needed: true,
    why: {
      uz: "Telefon chirog‘i kamera bilan bog‘langan — fonarga shu kerak.",
      en: "The phone’s flash belongs to the camera — a torch needs it.",
    },
  },
  {
    id: "torch-contacts",
    app: { uz: "Fonar Pro", en: "Torch Pro" },
    permission: { uz: "Kontaktlar", en: "Contacts" },
    needed: false,
    why: {
      uz: "Chiroq yoqish uchun do‘stlaringiz ro‘yxati kerak emas. Bunday ilova ma’lumotingizni sotishi mumkin.",
      en: "Switching on a light needs no list of your friends. An app like this may sell your data.",
    },
  },
  {
    id: "torch-location",
    app: { uz: "Fonar Pro", en: "Torch Pro" },
    permission: { uz: "Joylashuv", en: "Location" },
    needed: false,
    why: {
      uz: "Fonar qayerda ekaningizni bilishi shart emas.",
      en: "A torch has no reason to know where you are.",
    },
  },
  {
    id: "torch-sms",
    app: { uz: "Fonar Pro", en: "Torch Pro" },
    permission: { uz: "SMS o‘qish", en: "Read SMS" },
    needed: false,
    why: {
      uz: "Juda xavfli: SMS orqali bank va akkaunt kodlari keladi.",
      en: "Very risky: bank and account codes arrive by SMS.",
    },
  },
  {
    id: "map-location",
    app: { uz: "Yo‘lchi xarita", en: "Wayfinder Maps" },
    permission: { uz: "Joylashuv", en: "Location" },
    needed: true,
    why: {
      uz: "Xarita yo‘lni ko‘rsatish uchun qayerda ekaningizni bilishi kerak. Faqat “ilovadan foydalanayotganda” ruxsatini bering.",
      en: "A map needs your position to show the way. Allow it only “while using the app”.",
    },
  },
  {
    id: "map-contacts",
    app: { uz: "Yo‘lchi xarita", en: "Wayfinder Maps" },
    permission: { uz: "Kontaktlar", en: "Contacts" },
    needed: false,
    why: {
      uz: "Yo‘l topish uchun kontaktlar kerak emas.",
      en: "Finding the way needs no contacts.",
    },
  },
  {
    id: "map-microphone",
    app: { uz: "Yo‘lchi xarita", en: "Wayfinder Maps" },
    permission: { uz: "Mikrofon (doim)", en: "Microphone (always)" },
    needed: false,
    why: {
      uz: "Mikrofonni doim ochiq qoldirishga hech qanday sabab yo‘q.",
      en: "There is no reason to keep the microphone on all the time.",
    },
  },
];

// 8 · Wi-Fi --------------------------------------------------------------------

export type WifiCase = {
  id: string;
  situation: Text;
  safe: boolean;
  why: Text;
};

export const WIFI: readonly WifiCase[] = [
  {
    id: "ask-staff",
    situation: {
      uz: "Kafeda Wi-Fi nomi va parolini xodimdan so‘rab, aynan o‘sha tarmoqqa ulanasiz.",
      en: "In a café you ask the staff for the Wi-Fi name and password and join exactly that network.",
    },
    safe: true,
    why: {
      uz: "To‘g‘ri: tarmoq nomini ishonchli odamdan bilib oldingiz.",
      en: "Right: you learned the network’s name from someone you can trust.",
    },
  },
  {
    id: "twin",
    situation: {
      uz: "Ro‘yxatda ikkita “Kafe_WiFi” bor. Signali kuchlirog‘iga o‘ylamasdan ulanasiz.",
      en: "The list shows two “Cafe_WiFi” networks. You join the stronger one without a second thought.",
    },
    safe: false,
    why: {
      uz: "Hujumchi xuddi shunday nomli “egizak” tarmoq ochishi mumkin. Shubha bo‘lsa — xodimdan so‘rang.",
      en: "An attacker can set up an “evil twin” with the same name. If in doubt, ask the staff.",
    },
  },
  {
    id: "portal",
    situation: {
      uz: "Ochiq Wi-Fi’ga ulangach, sahifa “Internet uchun Google parolingizni kiriting” deydi. Kiritasiz.",
      en: "After joining open Wi-Fi, a page says “Enter your Google password to get online”. You type it.",
    },
    safe: false,
    why: {
      uz: "Wi-Fi uchun hech qachon email yoki ijtimoiy tarmoq parolingiz kerak bo‘lmaydi. Bu fishing.",
      en: "Wi-Fi never needs your email or social media password. This is phishing.",
    },
  },
  {
    id: "router",
    situation: {
      uz: "Uydagi routerning standart parolini (admin/admin) ota-onangiz bilan birga o‘zgartirasiz.",
      en: "With your parents, you change the home router’s default password (admin/admin).",
    },
    safe: true,
    why: {
      uz: "Standart parollar internetda ochiq yozilgan. Uni almashtirish — birinchi himoya.",
      en: "Default passwords are listed openly online. Changing it is the first line of defence.",
    },
  },
  {
    id: "hotspot",
    situation: {
      uz: "Aeroportda internet-do‘kondan xarid qilishingiz kerak. Ochiq Wi-Fi o‘rniga o‘z telefoningiz internetidan foydalanasiz.",
      en: "At the airport you need to buy something online. You use your own phone’s mobile data instead of open Wi-Fi.",
    },
    safe: true,
    why: {
      uz: "O‘z mobil internetingiz begona tarmoqdan xavfsizroq — ayniqsa to‘lov uchun.",
      en: "Your own mobile data is safer than a stranger’s network — especially for payments.",
    },
  },
  {
    id: "warning",
    situation: {
      uz: "Brauzer “Ulanish xavfsiz emas” deb ogohlantiradi, lekin siz “Baribir davom etish”ni bosasiz.",
      en: "The browser warns “Your connection is not private”, but you click “Proceed anyway”.",
    },
    safe: false,
    why: {
      uz: "Bu ogohlantirish kimdir ulanishni o‘rtadan ushlayotganini bildirishi mumkin. To‘xtang.",
      en: "This warning can mean someone is intercepting the connection. Stop.",
    },
  },
];
