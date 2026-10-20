// Academy · HTTPS and TLS: why the web encrypts, how a TLS connection is
// set up and how a browser decides to trust a certificate. Animated lessons
// on the shared widgets (../anim-lab/types) plus three of the lab's own: an
// eavesdropper on café Wi-Fi, a toy cipher and a certificate chain.
import {
  restoreLessons,
  type CommonWidget,
  type Lesson,
  type Text,
} from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "wifi" } | { type: "cipher" } | { type: "chain" };

const t = (uz: string, en: string): Text => ({ uz, en });

const WHY = t("Nega shifrlash kerak", "Why encrypt");
const TLS = t("TLS qanday ishlaydi", "How TLS works");
const CERTS = t("Sertifikatlar va ishonch", "Certificates and trust");

const CLIENT = {
  id: "client",
  label: t("Brauzer", "Browser"),
  icon: "laptop",
} as const;
const SERVER = {
  id: "server",
  label: t("bank.uz", "bank.uz"),
  icon: "server",
} as const;
const SPY = {
  id: "spy",
  label: t("Josus", "Eavesdropper"),
  icon: "user",
} as const;

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: WHY,
    title: t("Kafedagi Wi-Fi", "Café Wi-Fi"),
    minutes: 6,
    intro: t(
      "Oddiy HTTPda so‘rov va javob ochiq matn bo‘lib ketadi. Yo‘lda turgan har kim — Wi-Fi egasi, provayder yoki tarmoqdagi josus — ularni o‘qiy oladi.",
      "With plain HTTP, requests and responses travel as open text. Anyone on the way — the Wi-Fi owner, the provider or a snoop on the network — can read them.",
    ),
    analogy: t(
      "HTTP — ochiq otkritka: pochtachi ham, qo‘shni ham o‘qiydi. HTTPS — muhrlangan konvert: yo‘lda ochib bo‘lmaydi.",
      "HTTP is a postcard: the postman and the neighbour can read it. HTTPS is a sealed envelope: it cannot be opened on the way.",
    ),
    theory: [
      t(
        "HTTPS = HTTP + TLS. So‘rovlar o‘sha HTTP, faqat ular TLS deb ataladigan shifrlangan “tunnel” ichida yuboriladi.",
        "HTTPS = HTTP + TLS. The requests are the same HTTP, sent inside an encrypted “tunnel” called TLS.",
      ),
      t(
        "TLS uchta narsani beradi: maxfiylik (o‘qib bo‘lmaydi), butunlik (yo‘lda o‘zgartirib bo‘lmaydi) va haqiqiylik (siz haqiqatan bank.uz bilan gaplashyapsiz).",
        "TLS gives three things: confidentiality (cannot be read), integrity (cannot be changed on the way) and authenticity (you really are talking to bank.uz).",
      ),
    ],
    task: t(
      "Parolni avval HTTP, keyin HTTPS orqali yuboring va josus nimani ko‘rishini solishtiring.",
      "Send the password first over HTTP, then over HTTPS, and compare what the eavesdropper sees.",
    ),
    hint: t(
      "Kalitni “HTTPS” holatiga o‘tkazib, yana bir marta yuboring.",
      "Switch to HTTPS and send once more.",
    ),
    widget: { type: "wifi" },
  },
  {
    id: 2,
    group: WHY,
    title: t("Shifrlash g‘oyasi", "The idea of encryption"),
    minutes: 7,
    intro: t(
      "Shifrlash — matnni kalit yordamida tushunarsiz ko‘rinishga keltirish. To‘g‘ri kalitga ega odam uni qaytadan ocha oladi.",
      "Encryption turns text into gibberish with a key. Whoever has the right key can turn it back.",
    ),
    analogy: t(
      "Qulf va kalitga o‘xshaydi: bir xil kalit bilan qulflaysiz va ochasiz. Kalitsiz quti — shunchaki temir.",
      "Like a lock and key: the same key locks and unlocks. Without it the box is just metal.",
    ),
    theory: [
      t(
        "Simmetrik shifrlashda bitta kalit ham shifrlaydi, ham ochadi. Bu yerdagi o‘yinchoq shifr har bir harfni alifboda N qadam suradi.",
        "Symmetric encryption uses one key to lock and unlock. The toy cipher here moves every letter N places along the alphabet.",
      ),
      t(
        "Bu shifrda atigi 25 ta kalit bor — hammasini sinab chiqish bir daqiqa. Haqiqiy TLS AES kabi shifrlardan foydalanadi: kalitlar soni 2^128 dan ko‘p, ularni sinab chiqishga koinot yoshi ham yetmaydi.",
        "This cipher has only 25 keys — trying them all takes a minute. Real TLS uses ciphers like AES with over 2^128 keys; trying them all would outlast the universe.",
      ),
    ],
    task: t(
      "Ushlab olingan xabarni ochadigan kalitni toping.",
      "Find the key that opens the intercepted message.",
    ),
    hint: t(
      "Slayderni suring va pastdagi matn o‘qiladigan bo‘lguncha kuzating. Kalit 10 dan kichik.",
      "Move the slider and watch until the text below makes sense. The key is under 10.",
    ),
    widget: { type: "cipher" },
  },
  {
    id: 3,
    group: TLS,
    title: t("Kalitni qanday kelishish kerak?", "How do you agree on a key?"),
    minutes: 6,
    intro: t(
      "Muammo: brauzer va server avval hech qachon uchrashmagan. Umumiy kalitni ochiq tarmoq orqali qanday kelishadi, josus eshitib turgan bo‘lsa?",
      "The problem: the browser and the server have never met. How do they agree on a shared key over an open network while an eavesdropper listens?",
    ),
    analogy: t(
      "Server hammaga ochiq qulf tarqatadi, kaliti esa faqat o‘zida. Siz sirni qutiga solib, shu qulf bilan yopasiz — endi uni faqat server ocha oladi.",
      "The server hands out open padlocks to everyone but keeps the only key. You put a secret in a box and snap the padlock shut — now only the server can open it.",
    ),
    theory: [
      t(
        "Bu — ochiq kalitli (asimmetrik) kriptografiya. Ochiq kalit — qulf, uni hamma ko‘rishi mumkin. Yopiq kalit — kalit, u serverdan hech qachon chiqmaydi.",
        "This is public-key (asymmetric) cryptography. The public key is the padlock; anyone may see it. The private key is the key; it never leaves the server.",
      ),
      t(
        "Bugungi TLS bunga o‘xshash, lekin aqlliroq usul (Diffie–Hellman) bilan ikki tomonga umumiy sessiya kalitini hosil qiladi. Josus barcha xabarlarni ko‘rsa ham, shu kalitni hisoblay olmaydi.",
        "Modern TLS uses a similar but cleverer method (Diffie–Hellman) to give both sides a shared session key. Even seeing every message, the eavesdropper cannot work that key out.",
      ),
    ],
    task: t(
      "Animatsiyani oxirigacha kuzating: josus nimani ko‘radi va nimani ko‘ra olmaydi?",
      "Watch the animation to the end: what does the eavesdropper see, and what not?",
    ),
    hint: t("“Ijro”ni bosing.", "Press Play."),
    widget: {
      type: "sequence",
      actors: [CLIENT, SPY, SERVER],
      steps: [
        {
          from: "server",
          to: "client",
          label: "public key",
          detail: t(
            "Server ochiq qulfini yuboradi. Josus ham uni ko‘radi — bu xavfsiz, qulf hech narsani ochmaydi.",
            "The server sends its open padlock. The eavesdropper sees it too — that is fine, a padlock opens nothing.",
          ),
        },
        {
          from: "client",
          to: "server",
          label: "secret",
          tone: "locked",
          detail: t(
            "Brauzer tasodifiy sirni server qulfi bilan yopib yuboradi. Josus faqat yopiq qutini ko‘radi.",
            "The browser locks a random secret with the server’s padlock. The eavesdropper only sees a locked box.",
          ),
        },
        {
          from: "server",
          to: "server",
          label: "private key",
          detail: t(
            "Server o‘zining yopiq kaliti bilan qutini ochadi. Endi ikkalasida bir xil sir bor.",
            "The server opens the box with its private key. Now both share the same secret.",
          ),
        },
        {
          from: "client",
          to: "server",
          label: "GET /account",
          tone: "locked",
          detail: t(
            "Bundan buyon barcha HTTP xabarlar shu umumiy kalit bilan shifrlanadi.",
            "From now on every HTTP message is encrypted with that shared key.",
          ),
        },
        {
          from: "server",
          to: "client",
          label: "200 OK",
          tone: "locked",
          detail: t(
            "Javob ham shifrlangan. Josus faqat qancha ma’lumot ketganini va qachonligini biladi.",
            "The answer is encrypted too. The eavesdropper only learns how much data moved and when.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: TLS,
    title: t("TLS qo‘l siqishuvi", "The TLS handshake"),
    minutes: 7,
    intro: t(
      "HTTPS saytga ulanganda, birinchi HTTP so‘rovidan oldin brauzer va server qisqa “salomlashuv” — TLS handshake — o‘tkazadi.",
      "When you connect to an HTTPS site, the browser and server run a short greeting — the TLS handshake — before the first HTTP request.",
    ),
    analogy: t(
      "Ikki josus uchrashuvdan oldin parol so‘zlarini almashadi, hujjatlarini ko‘rsatadi va maxfiy til kelishadi.",
      "Two agents meeting for the first time swap passwords, show their papers and agree on a secret language.",
    ),
    theory: [
      t(
        "ClientHello: brauzer qaysi TLS versiyalari va shifrlarni bilishini aytadi. ServerHello: server ulardan birini tanlaydi.",
        "ClientHello: the browser lists the TLS versions and ciphers it knows. ServerHello: the server picks one.",
      ),
      t(
        "Certificate: server o‘zining sertifikatini yuboradi — “men haqiqatan bank.uz man” degan hujjat. Brauzer uni tekshiradi.",
        "Certificate: the server sends its certificate — a document saying “I really am bank.uz”. The browser checks it.",
      ),
      t(
        "Kalit almashuvi va Finished: ikkala tomon umumiy kalitni hosil qiladi va bir-biriga shifrlangan “tayyor” xabarini yuboradi. TLS 1.3 da bularning hammasi bitta borib-kelishda bo‘ladi.",
        "Key exchange and Finished: both sides derive the shared key and send each other an encrypted “ready”. In TLS 1.3 all this takes one round trip.",
      ),
    ],
    task: t(
      "Qo‘l siqishuvni qadamma-qadam kuzating.",
      "Follow the handshake step by step.",
    ),
    hint: t(
      "“Keyingi qadam” bilan har bir xabarni alohida o‘qing.",
      "Use Next step to read every message on its own.",
    ),
    widget: {
      type: "sequence",
      actors: [CLIENT, SERVER],
      steps: [
        {
          from: "client",
          to: "server",
          label: "ClientHello",
          detail: t(
            "“Salom! Men TLS 1.3 va AES, ChaCha20 shifrlarini bilaman.” Bu yerda brauzerning kalit ulushi ham bor.",
            "“Hi! I speak TLS 1.3 and the AES and ChaCha20 ciphers.” It carries the browser’s key share too.",
          ),
        },
        {
          from: "server",
          to: "client",
          label: "ServerHello",
          detail: t(
            "“TLS 1.3 va AES-GCM bo‘lsin.” Server ham kalit ulushini yuboradi — endi ikkalasi umumiy kalitni hisoblay oladi.",
            "“TLS 1.3 with AES-GCM, then.” The server sends its key share — now both can compute the shared key.",
          ),
        },
        {
          from: "server",
          to: "client",
          label: "Certificate",
          tone: "locked",
          detail: t(
            "Server sertifikatini yuboradi. Brauzer: domen mosmi, muddati o‘tmaganmi, ishonchli markaz imzolaganmi — tekshiradi.",
            "The server sends its certificate. The browser checks: does the domain match, is it in date, did a trusted authority sign it?",
          ),
        },
        {
          from: "server",
          to: "client",
          label: "Finished",
          tone: "locked",
          detail: t(
            "Server: “men tayyorman” — allaqachon yangi kalit bilan shifrlangan.",
            "The server: “I’m ready” — already encrypted with the new key.",
          ),
        },
        {
          from: "client",
          to: "server",
          label: "Finished",
          tone: "locked",
          detail: t(
            "Brauzer ham tayyor. Manzil satrida qulf belgisi paydo bo‘ladi.",
            "The browser is ready too. The padlock appears in the address bar.",
          ),
        },
        {
          from: "client",
          to: "server",
          label: "GET /",
          tone: "locked",
          detail: t(
            "Endi oddiy HTTP so‘rovi — lekin shifrlangan tunnel ichida.",
            "Now an ordinary HTTP request — inside the encrypted tunnel.",
          ),
        },
        {
          from: "server",
          to: "client",
          label: "200 OK",
          tone: "locked",
          detail: t("Sahifa xavfsiz yetib keldi.", "The page arrives safely."),
        },
      ],
    },
  },
  {
    id: 5,
    group: TLS,
    title: t("HTTPS nimani yashiradi?", "What does HTTPS hide?"),
    minutes: 6,
    intro: t(
      "HTTPS ko‘p narsani yashiradi, lekin hammasini emas. Tarmoq egasi qaysi saytga ulanganingizni hali ham ko‘rishi mumkin.",
      "HTTPS hides a lot, but not everything. The network owner can still see which site you connect to.",
    ),
    analogy: t(
      "Muhrlangan konvertdagi xat: ichini o‘qib bo‘lmaydi, lekin ustidagi manzil, konvert qalinligi va jo‘natilgan vaqt ko‘rinib turadi.",
      "A letter in a sealed envelope: the inside is private, but the address on the front, the thickness and the time it was sent are visible.",
    ),
    theory: [
      t(
        "Yashirin: sahifa yo‘li (/account/cards), sarlavhalar, cookie, parol, forma ma’lumotlari, sahifa mazmuni.",
        "Hidden: the page path (/account/cards), headers, cookies, passwords, form data and page content.",
      ),
      t(
        "Ko‘rinadi: server IP manzili, domen nomi (DNS so‘rovi va TLS dagi SNI orqali), qancha ma’lumot ketgani va qachon.",
        "Visible: the server’s IP address, the domain name (via the DNS lookup and TLS SNI), how much data moved and when.",
      ),
    ],
    task: t(
      "Har bir ma’lumotni joylang: Wi-Fi egasi uni ko‘radimi yoki HTTPS yashiradimi?",
      "Place each item: does the Wi-Fi owner see it, or does HTTPS hide it?",
    ),
    hint: t(
      "Konvert ustidagi narsalar — ko‘rinadi, ichidagilar — yashirin.",
      "Things on the envelope are visible; things inside are hidden.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "seen", label: t("Ko‘rinadi", "Visible") },
        { id: "hidden", label: t("HTTPS yashiradi", "Hidden by HTTPS") },
      ],
      items: [
        {
          label: t("Saytning domeni: bank.uz", "The site’s domain: bank.uz"),
          bucket: "seen",
        },
        {
          label: t("Kiritilgan parol", "The password you type"),
          bucket: "hidden",
        },
        {
          label: t(
            "Sahifa yo‘li: /account/cards",
            "The page path: /account/cards",
          ),
          bucket: "hidden",
        },
        {
          label: t("Server IP manzili", "The server’s IP address"),
          bucket: "seen",
        },
        {
          label: t("Sessiya cookie si", "The session cookie"),
          bucket: "hidden",
        },
        { label: t("Ulanish vaqti", "When you connected"), bucket: "seen" },
        {
          label: t("Yuborilgan xabar matni", "The text of a message you sent"),
          bucket: "hidden",
        },
        {
          label: t(
            "Taxminan qancha ma’lumot ketgani",
            "Roughly how much data moved",
          ),
          bucket: "seen",
        },
      ],
    },
  },
  {
    id: 6,
    group: CERTS,
    title: t("Sertifikat ichida nima bor", "Inside a certificate"),
    minutes: 7,
    intro: t(
      "Sertifikat — saytning raqamli pasporti. Unda sayt kimligi, ochiq kaliti va uni tasdiqlagan markazning imzosi bor.",
      "A certificate is a site’s digital passport. It holds who the site is, its public key and the signature of the authority that vouched for it.",
    ),
    analogy: t(
      "Pasportga o‘xshaydi: ism, amal qilish muddati, kim bergani va qalbakilashtirib bo‘lmaydigan muhr.",
      "Like a passport: a name, valid dates, who issued it and a seal that cannot be forged.",
    ),
    theory: [
      t(
        "Sertifikatni brauzerda ko‘rish mumkin: manzil satridagi qulfni bosing → “Ulanish xavfsiz” → “Sertifikat”.",
        "You can view one in your browser: click the padlock in the address bar → “Connection is secure” → “Certificate”.",
      ),
      t(
        "Sertifikat ochiq hujjat — unda sir yo‘q. Sir — serverdagi yopiq kalit; sertifikat faqat unga mos ochiq kalitni ko‘rsatadi.",
        "A certificate is public — it holds no secret. The secret is the server’s private key; the certificate only shows the matching public key.",
      ),
    ],
    task: t(
      "Sertifikatning har bir maydonini bosib o‘rganing.",
      "Click and explore every field of the certificate.",
    ),
    hint: t("Hammasi bo‘lib oltita maydon.", "Six fields in all."),
    widget: {
      type: "anatomy",
      lines: [
        [{ text: "Subject: CN=bank.uz", id: "subject" }],
        [{ text: "SAN: bank.uz, www.bank.uz", id: "san" }],
        [{ text: "Issuer: R3 Intermediate CA", id: "issuer" }],
        [{ text: "Valid: 2026-09-01 → 2026-11-30", id: "dates" }],
        [{ text: "Public key: EC P-256 04:8f:3a:…", id: "key" }],
        [{ text: "Signature: sha256-ECDSA 30:45:02:…", id: "signature" }],
      ],
      parts: [
        {
          id: "subject",
          title: t("Subject — kim uchun", "Subject — who it is for"),
          body: t(
            "Sertifikat qaysi saytga berilgan. CN — Common Name.",
            "Which site the certificate was issued to. CN is the Common Name.",
          ),
        },
        {
          id: "san",
          title: t("SAN — qo‘shimcha nomlar", "SAN — extra names"),
          body: t(
            "Sertifikat amal qiladigan barcha domenlar. Brauzer manzil satridagi domen shu ro‘yxatda borligini tekshiradi.",
            "Every domain the certificate covers. The browser checks that the domain in the address bar is on this list.",
          ),
        },
        {
          id: "issuer",
          title: t("Issuer — kim bergan", "Issuer — who issued it"),
          body: t(
            "Sertifikatni tasdiqlagan markaz (CA). Brauzer unga ishonish-ishonmasligini zanjir bo‘ylab tekshiradi.",
            "The authority (CA) that vouched for it. The browser checks whether to trust it along the chain.",
          ),
        },
        {
          id: "dates",
          title: t("Amal qilish muddati", "Validity period"),
          body: t(
            "Bugungi sana shu oraliqda bo‘lishi kerak. Muddati o‘tgan sertifikat — ogohlantirish sababi.",
            "Today must fall inside this range. An expired certificate triggers a warning.",
          ),
        },
        {
          id: "key",
          title: t("Ochiq kalit", "Public key"),
          body: t(
            "Serverning “qulfi”. Mos yopiq kalit faqat serverda — shuning uchun boshqa birov o‘zini bank.uz deb ko‘rsata olmaydi.",
            "The server’s “padlock”. The matching private key is only on the server — so nobody else can pose as bank.uz.",
          ),
        },
        {
          id: "signature",
          title: t("Imzo", "Signature"),
          body: t(
            "Issuer o‘z yopiq kaliti bilan qo‘ygan muhr. Bir harf o‘zgarsa ham imzo buziladi.",
            "The seal the issuer made with its private key. Change one letter and the signature breaks.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: CERTS,
    title: t("Ishonch zanjiri", "The chain of trust"),
    minutes: 7,
    intro: t(
      "Brauzer bank.uz ni tanimaydi. U faqat oz sonli ildiz markazlarga (Root CA) ishonadi va zanjir bo‘ylab ularga yetib borishga harakat qiladi.",
      "Your browser does not know bank.uz. It trusts only a small set of root authorities (Root CAs) and walks a chain up to one of them.",
    ),
    analogy: t(
      "Notarius tasdiqlagan hujjat: siz notariusni bilmaysiz, lekin uning litsenziyasini davlat bergan, davlatga esa ishonasiz.",
      "A notarised document: you do not know the notary, but the state licensed them, and you trust the state.",
    ),
    theory: [
      t(
        "Sayt sertifikatini oraliq markaz (Intermediate CA) imzolagan, uni esa ildiz markaz imzolagan.",
        "The site certificate was signed by an intermediate CA, and that one by a root CA.",
      ),
      t(
        "Ildiz sertifikatlar operatsion tizim va brauzerga oldindan o‘rnatilgan — bu “ishonch ombori”. Zanjirning biror halqasi buzilsa, brauzer ogohlantiradi.",
        "Root certificates come pre-installed in the operating system and browser — the “trust store”. If any link breaks, the browser warns you.",
      ),
    ],
    task: t(
      "Zanjirni pastdan yuqoriga tekshiring: har bir halqani bosing.",
      "Check the chain from the bottom up: press each link.",
    ),
    hint: t(
      "Avval bank.uz, keyin oraliq markaz, oxirida ildiz.",
      "First bank.uz, then the intermediate, finally the root.",
    ),
    widget: { type: "chain" },
  },
  {
    id: 8,
    group: CERTS,
    title: t("Ogohlantirishlarni o‘qish", "Reading the warnings"),
    minutes: 6,
    intro: t(
      "Brauzer sertifikatda muammo topsa, katta qizil sahifa ko‘rsatadi. Uni bilib-bilmay “baribir davom etish” — xavfli odat.",
      "When the browser finds a certificate problem it shows a big red page. Clicking “continue anyway” out of habit is dangerous.",
    ),
    analogy: t(
      "Bank xodimi pasportingiz muddati o‘tgan yoki boshqa odamniki ekanini ko‘rsa, pul bermaydi. Brauzer ham shunday.",
      "A bank clerk will not pay out if your passport has expired or belongs to someone else. The browser is the same.",
    ),
    theory: [
      t(
        "Asosiy sabablar: muddati o‘tgan, boshqa domen uchun berilgan, o‘zi imzolagan (self-signed) yoki noma’lum markaz bergan sertifikat.",
        "The main causes: expired, issued for another domain, self-signed or from an unknown authority.",
      ),
      t(
        "Bank, pochta yoki tizimga kirish sahifasida ogohlantirish chiqsa — to‘xtang. Bu kimdir tarmoqda o‘zini sayt qilib ko‘rsatayotganini anglatishi mumkin.",
        "If a warning appears on a bank, mail or sign-in page — stop. It may mean someone on the network is posing as the site.",
      ),
    ],
    task: t(
      "Har bir holatni joylang: qulf joyida, yoki to‘xtash kerak?",
      "Sort each case: padlock fine, or stop?",
    ),
    hint: t(
      "Domen mosligi, muddat va kim imzolaganiga qarang.",
      "Check the domain match, the dates and who signed it.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "ok", label: t("Qulf joyida", "Padlock fine") },
        { id: "stop", label: t("To‘xtang!", "Stop!") },
      ],
      items: [
        {
          label: t(
            "bank.uz uchun, R3 imzolagan, muddati amalda",
            "For bank.uz, signed by R3, in date",
          ),
          bucket: "ok",
        },
        {
          label: t(
            "bank.uz uchun, lekin kecha muddati tugagan",
            "For bank.uz, but expired yesterday",
          ),
          bucket: "stop",
        },
        {
          label: t(
            "bank.uz sahifasida evil.com uchun sertifikat",
            "A certificate for evil.com on the bank.uz page",
          ),
          bucket: "stop",
        },
        {
          label: t(
            "O‘zi imzolagan (self-signed) sertifikat",
            "A self-signed certificate",
          ),
          bucket: "stop",
        },
        {
          label: t(
            "www.bank.uz — SAN ro‘yxatida bor",
            "www.bank.uz — listed in the SAN",
          ),
          bucket: "ok",
        },
        {
          label: t(
            "Noma’lum “Super Trust CA” bergan",
            "Issued by an unknown “Super Trust CA”",
          ),
          bucket: "stop",
        },
      ],
    },
  },
  {
    id: 9,
    group: CERTS,
    title: t("Yakuniy takrorlash", "Final review"),
    minutes: 6,
    intro: t(
      "HTTPS bo‘yicha bilimlaringizni tekshiring.",
      "Check what you know about HTTPS.",
    ),
    analogy: t(
      "Qulf belgisi — kafolat emas, balki “ulanish shifrlangan va sertifikat tekshirildi” degani.",
      "The padlock is not a guarantee; it means “the connection is encrypted and the certificate checked out”.",
    ),
    theory: [
      t(
        "Esda tuting: HTTPS yo‘ldagi ma’lumotni himoya qiladi. Saytning o‘zi firibgar bo‘lsa, qulf baribir chiqishi mumkin.",
        "Remember: HTTPS protects data on the way. If the site itself is a scam, it can still show a padlock.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Oldingi darslar saqlanib qoladi — ularga qaytishingiz mumkin.",
      "Earlier lessons stay saved — you can go back to them.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t("HTTPS nima?", "What is HTTPS?"),
          options: [
            t("Yangi protokol, HTTP o‘rniga", "A new protocol replacing HTTP"),
            t("TLS tunneli ichidagi HTTP", "HTTP inside a TLS tunnel"),
            t("Tezroq HTTP", "Faster HTTP"),
          ],
          answer: 1,
          explain: t("HTTPS = HTTP + TLS.", "HTTPS = HTTP + TLS."),
        },
        {
          ask: t(
            "Serverning yopiq kaliti qayerda saqlanadi?",
            "Where does the server’s private key live?",
          ),
          options: [
            t("Sertifikat ichida", "Inside the certificate"),
            t("Faqat serverda", "Only on the server"),
            t("Har bir brauzerda", "In every browser"),
          ],
          answer: 1,
          explain: t(
            "Sertifikatda faqat ochiq kalit bor; yopiq kalit serverdan chiqmaydi.",
            "The certificate holds only the public key; the private key never leaves the server.",
          ),
        },
        {
          ask: t(
            "HTTPS ishlatilganda kafedagi Wi-Fi egasi nimani ko‘ra oladi?",
            "With HTTPS, what can the café Wi-Fi owner still see?",
          ),
          options: [
            t("Parolingizni", "Your password"),
            t("Qaysi domenga ulanganingizni", "Which domain you connect to"),
            t("Sahifa mazmunini", "The page content"),
          ],
          answer: 1,
          explain: t(
            "Domen DNS va SNI orqali ko‘rinadi.",
            "The domain shows through DNS and SNI.",
          ),
        },
        {
          ask: t(
            "Brauzer ildiz sertifikatlarga nega ishonadi?",
            "Why does the browser trust root certificates?",
          ),
          options: [
            t(
              "Ular tizimga oldindan o‘rnatilgan",
              "They come pre-installed in the system",
            ),
            t("Sayt ularni yuboradi", "The site sends them"),
            t("Ular eng uzun", "They are the longest"),
          ],
          answer: 0,
          explain: t("Bu ishonch ombori.", "That is the trust store."),
        },
        {
          ask: t(
            "Bank saytida “sertifikat muddati o‘tgan” ogohlantirishi chiqdi. Nima qilasiz?",
            "A bank site shows “certificate expired”. What do you do?",
          ),
          options: [
            t("“Baribir davom etish”ni bosaman", "Click “continue anyway”"),
            t(
              "To‘xtayman va boshqa tarmoqdan tekshiraman",
              "Stop and check from another network",
            ),
            t("Parolni tezroq kiritaman", "Type the password quickly"),
          ],
          answer: 1,
          explain: t(
            "Ogohlantirish — kimdir o‘zini bank qilib ko‘rsatayotgan bo‘lishi mumkinligi belgisi.",
            "The warning may mean someone is posing as the bank.",
          ),
        },
        {
          ask: t(
            "TLS qaysi uch narsani beradi?",
            "Which three things does TLS give?",
          ),
          options: [
            t("Tezlik, reklama, kesh", "Speed, ads and caching"),
            t(
              "Maxfiylik, butunlik, haqiqiylik",
              "Confidentiality, integrity, authenticity",
            ),
            t("Parol, login, cookie", "Password, login and cookie"),
          ],
          answer: 1,
          explain: t(
            "O‘qib bo‘lmaydi, o‘zgartirib bo‘lmaydi va sayt haqiqiy.",
            "Cannot be read, cannot be changed, and the site is genuine.",
          ),
        },
      ],
    },
  },
];

export const PROGRESS_KEY = "cybervalue:https:progress:v1";

export const restoreProgress = (raw: unknown) => restoreLessons(raw, LESSONS);
