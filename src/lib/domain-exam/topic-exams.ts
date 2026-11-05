// Topic exams: a fixed question bank on a set of related topics, taken and
// approved like a domain exam (same attempts table, same teacher page). The
// questions carry their answers, so only server code may import this file.
import type { Text } from "../anim-lab/types";

type Pair = [uz: string, en: string];

export type TopicQuestion = {
  topic: number;
  ask: Text;
  code?: string;
  options: Text[];
  answer: number;
  explain: Text;
};

export type TopicExam = {
  id: string;
  title: Text;
  minutes: number;
  /** The topics, shown as "modules" with a lesson to revisit. */
  modules: { title: Text; href: string }[];
  questions: TopicQuestion[];
};

const tx = ([uz, en]: Pair): Text => ({ uz, en });
const opt = (o: string | Pair): Text =>
  typeof o === "string" ? { uz: o, en: o } : tx(o);

const q = (
  topic: number,
  ask: Pair,
  options: (string | Pair)[],
  answer: number,
  explain: Pair,
  code?: string,
): TopicQuestion => ({
  topic,
  ask: tx(ask),
  ...(code ? { code } : {}),
  options: options.map(opt),
  answer,
  explain: tx(explain),
});

const SSH = 0;
const BASICS = 1;
const SYM = 2;
const TLS = 3;
const HTTP = 4;

export const SSH_CRYPTO_EXAM: TopicExam = {
  id: "ssh-crypto-tls",
  title: {
    uz: "SSH, kriptografiya, HTTPS/TLS va HTTP",
    en: "SSH, cryptography, HTTPS/TLS and HTTP",
  },
  minutes: 45,
  modules: [
    {
      title: { uz: "SSH va uning porti", en: "SSH and its port" },
      href: "/akademiya/ssh",
    },
    {
      title: { uz: "Kriptografiya asoslari", en: "Cryptography basics" },
      href: "/intermediate/classic",
    },
    {
      title: { uz: "Simmetrik shifrlash", en: "Symmetric encryption" },
      href: "/intermediate/symmetric",
    },
    {
      title: { uz: "HTTPS va TLS", en: "HTTPS and TLS" },
      href: "/intermediate/tls",
    },
    {
      title: { uz: "HTTP protokoli", en: "The HTTP protocol" },
      href: "/intermediate/http",
    },
  ],
  questions: [
    // --- SSH ---------------------------------------------------------------
    q(
      SSH,
      [
        "SSH xizmati standart bo‘yicha qaysi portda ishlaydi?",
        "Which port does SSH use by default?",
      ],
      ["21/tcp", "22/tcp", "23/tcp", "443/tcp"],
      1,
      [
        "SSH standart bo‘yicha 22/tcp portini tinglaydi. 21 — FTP, 23 — Telnet, 443 — HTTPS.",
        "SSH listens on 22/tcp by default. 21 is FTP, 23 is Telnet and 443 is HTTPS.",
      ],
    ),
    q(
      SSH,
      [
        "SSH Telnet’dan nimasi bilan farq qiladi?",
        "How does SSH differ from Telnet?",
      ],
      [
        [
          "SSH butun seansni shifrlaydi, Telnet esa hammasini ochiq matnda yuboradi",
          "SSH encrypts the whole session; Telnet sends everything in plain text",
        ],
        [
          "SSH tezroq, lekin shifrlamaydi",
          "SSH is faster but does not encrypt",
        ],
        [
          "Telnet kalit bilan kiradi, SSH faqat parol bilan",
          "Telnet uses keys, SSH only passwords",
        ],
        [
          "Farqi yo‘q, faqat porti boshqa",
          "There is no difference except the port",
        ],
      ],
      0,
      [
        "Telnet parolni ham, buyruqlarni ham ochiq yuboradi — tarmoqni tinglagan odam hammasini ko‘radi. SSH esa ulanishni shifrlaydi va serverni tekshiradi.",
        "Telnet sends passwords and commands in the clear, so anyone sniffing the network sees them. SSH encrypts the connection and verifies the server.",
      ],
    ),
    q(
      SSH,
      [
        "Server SSH’ni 2222 portda ishlatadi. Qaysi buyruq to‘g‘ri ulanadi?",
        "A server runs SSH on port 2222. Which command connects correctly?",
      ],
      [
        "ssh ali@server.uz:2222",
        "ssh -p 2222 ali@server.uz",
        "ssh ali@server.uz --port=22",
        "ssh -P 2222 ali@server.uz",
      ],
      1,
      [
        "`ssh` uchun port `-p` (kichik harf) bilan beriladi. Katta `-P` esa `scp` buyrug‘ida port uchun ishlatiladi.",
        "`ssh` takes the port with a lowercase `-p`. The uppercase `-P` is the port flag of `scp`.",
      ],
    ),
    q(
      SSH,
      [
        "SSH porti qaysi faylda o‘zgartiriladi?",
        "Which file changes the SSH server’s port?",
      ],
      [
        "/etc/ssh/sshd_config",
        "~/.ssh/known_hosts",
        "/etc/hosts",
        "~/.ssh/authorized_keys",
      ],
      0,
      [
        "Server sozlamalari `/etc/ssh/sshd_config` faylida, `Port` qatorida. O‘zgartirgach xizmat qayta ishga tushiriladi va firewall’da yangi port ochiladi.",
        "Server settings live in `/etc/ssh/sshd_config`, on the `Port` line. After the change the service is restarted and the new port is opened in the firewall.",
      ],
    ),
    q(
      SSH,
      [
        "SSH portini 22 dan 2222 ga o‘zgartirish nima beradi?",
        "What does moving SSH from port 22 to 2222 achieve?",
      ],
      [
        [
          "Serverni to‘liq himoyalaydi, boshqa choralar kerak emas",
          "It fully protects the server; nothing else is needed",
        ],
        [
          "Avtomatik skanerlar shovqinini kamaytiradi, lekin haqiqiy himoya emas",
          "It cuts automated scanner noise but is not real protection",
        ],
        [
          "Ulanishni ikki barobar kuchliroq shifrlaydi",
          "It doubles the strength of the encryption",
        ],
        ["Parolsiz kirishni yoqadi", "It enables passwordless login"],
      ],
      1,
      [
        "Port almashtirish faqat loglardagi bot urinishlarini kamaytiradi. Port skaneri yangi portni baribir topadi. Haqiqiy himoya — kalit bilan kirish, parolni o‘chirish, root kirishini taqiqlash.",
        "Changing the port only cuts bot attempts in the logs; a port scan still finds it. Real protection is key login, disabling passwords and denying root login.",
      ],
    ),
    q(
      SSH,
      [
        "`ssh-keygen -t ed25519` nima qiladi?",
        "What does `ssh-keygen -t ed25519` do?",
      ],
      [
        ["Serverga ulanadi", "It connects to a server"],
        [
          "Yopiq va ochiq kalit juftini yaratadi",
          "It creates a private and public key pair",
        ],
        [
          "Serverning parolini o‘zgartiradi",
          "It changes the server’s password",
        ],
        ["Faylni shifrlaydi", "It encrypts a file"],
      ],
      1,
      [
        "`ssh-keygen` kalit jufti yaratadi: `~/.ssh/id_ed25519` (yopiq, hech kimga berilmaydi) va `id_ed25519.pub` (ochiq, serverga qo‘yiladi).",
        "`ssh-keygen` makes a key pair: `~/.ssh/id_ed25519` (private, never shared) and `id_ed25519.pub` (public, put on the server).",
      ],
    ),
    q(
      SSH,
      [
        "Kalit bilan kirish uchun ochiq kalit serverda qaysi faylga yoziladi?",
        "Where on the server does the public key go for key login?",
      ],
      [
        "~/.ssh/known_hosts",
        "~/.ssh/authorized_keys",
        "/etc/passwd",
        "~/.ssh/id_ed25519",
      ],
      1,
      [
        "Server kirishga ruxsat berilgan ochiq kalitlarni `~/.ssh/authorized_keys` faylidan o‘qiydi. `ssh-copy-id` aynan shu faylga yozadi. `known_hosts` esa mijozda, tanish serverlar ro‘yxati.",
        "The server reads allowed public keys from `~/.ssh/authorized_keys`; `ssh-copy-id` writes there. `known_hosts` is on the client and lists servers it has seen.",
      ],
    ),
    q(
      SSH,
      [
        "Doimiy ulanib yurgan serveringizga ulanganda shu ogohlantirish chiqdi. To‘g‘ri harakat qaysi?",
        "Connecting to a server you use every day shows this warning. What is the right move?",
      ],
      [
        ["`yes` deb davom etish", "Type `yes` and carry on"],
        [
          "To‘xtash va administratordan server kaliti o‘zgarganini tekshirish",
          "Stop and check with the admin whether the server key really changed",
        ],
        [
          "known_hosts faylini o‘chirib, qayta ulanish",
          "Delete known_hosts and reconnect",
        ],
        ["Parolni ikki marta kiritish", "Enter the password twice"],
      ],
      1,
      [
        "Server kaliti kutilmaganda o‘zgarsa, kimdir o‘rtada turgan bo‘lishi mumkin (MITM). Avval kalit rostdan almashtirilganini tekshiring; tasdiqlangandan keyingina eski yozuvni `ssh-keygen -R` bilan o‘chiring.",
        "An unexpected host key change can mean someone sits in the middle (MITM). First confirm the key was really replaced; only then remove the old entry with `ssh-keygen -R`.",
      ],
      "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
    ),
    // --- Cryptography basics ----------------------------------------------
    q(
      BASICS,
      [
        "Kriptografiyada “ochiq matn” (plaintext) nima?",
        "In cryptography, what is “plaintext”?",
      ],
      [
        [
          "Shifrlashdan oldingi asl ma’lumot",
          "The original data before encryption",
        ],
        ["Shifrlangan ma’lumot", "The encrypted data"],
        ["Shifrlash kaliti", "The encryption key"],
        ["Xesh qiymati", "A hash value"],
      ],
      0,
      [
        "Ochiq matn — asl, o‘qiladigan ma’lumot. Shifrlangandan keyingisi “shifrmatn” (ciphertext) deyiladi.",
        "Plaintext is the original, readable data. After encryption it is called ciphertext.",
      ],
    ),
    q(
      BASICS,
      [
        "Axborot xavfsizligining CIA uchligi nimalardan iborat?",
        "What does the CIA triad of information security stand for?",
      ],
      [
        [
          "Maxfiylik, yaxlitlik, mavjudlik",
          "Confidentiality, integrity, availability",
        ],
        [
          "Shifrlash, identifikatsiya, avtorizatsiya",
          "Cipher, identification, authorization",
        ],
        ["Nazorat, tekshiruv, audit", "Control, inspection, audit"],
        ["Kalit, xesh, imzo", "Key, hash, signature"],
      ],
      0,
      [
        "C — maxfiylik (begona o‘qiy olmasin), I — yaxlitlik (o‘zgartirilmasin), A — mavjudlik (kerak bo‘lganda ishlasin). Shifrlash asosan maxfiylikni, xesh va imzo yaxlitlikni ta’minlaydi.",
        "C is confidentiality (outsiders can’t read it), I is integrity (it isn’t altered), A is availability (it works when needed). Encryption mainly gives confidentiality; hashes and signatures give integrity.",
      ],
    ),
    q(
      BASICS,
      [
        "Sezar shifrida siljish 3 bo‘lsa, `CAT` nima bo‘ladi?",
        "With a Caesar shift of 3, what does `CAT` become?",
      ],
      ["DBU", "FDW", "ZXQ", "CAT3"],
      1,
      [
        "Har bir harf 3 ta oldinga suriladi: C→F, A→D, T→W. Natija `FDW`. Kalit atigi 25 xil bo‘lgani uchun bunday shifr bir zumda buziladi.",
        "Each letter moves 3 forward: C→F, A→D, T→W, giving `FDW`. With only 25 possible keys the cipher falls instantly.",
      ],
    ),
    q(
      BASICS,
      [
        "Kerkxoffs prinsipi nimani aytadi?",
        "What does Kerckhoffs’s principle say?",
      ],
      [
        ["Algoritm sir bo‘lishi kerak", "The algorithm must be kept secret"],
        [
          "Algoritm hammaga ma’lum bo‘lsa ham, faqat kalit sir saqlansa tizim xavfsiz bo‘lishi kerak",
          "A system should stay secure even if everything but the key is public",
        ],
        [
          "Kalit qancha qisqa bo‘lsa, shuncha yaxshi",
          "The shorter the key, the better",
        ],
        [
          "Har bir xabar uchun yangi algoritm kerak",
          "Each message needs a new algorithm",
        ],
      ],
      1,
      [
        "Xavfsizlik algoritmni yashirishga emas, kalitni sir saqlashga tayanishi kerak. Shuning uchun AES kabi ochiq, ko‘p tekshirilgan algoritmlar ishlatiladi.",
        "Security should rest on keeping the key secret, not the algorithm. That is why open, well-studied algorithms such as AES are used.",
      ],
    ),
    q(
      BASICS,
      [
        "Xesh funksiyaning shifrlashdan asosiy farqi nima?",
        "What is the main difference between a hash and encryption?",
      ],
      [
        [
          "Xesh bir tomonlama: natijadan asl ma’lumotni qaytarib bo‘lmaydi",
          "A hash is one-way: the input can’t be recovered from it",
        ],
        ["Xesh kalit bilan ochiladi", "A hash is reversed with a key"],
        [
          "Xesh natijasi har doim asl matndan uzun",
          "A hash is always longer than the input",
        ],
        ["Xesh faqat rasmlar uchun", "Hashes are only for images"],
      ],
      0,
      [
        "Shifrlangan ma’lumot kalit bilan qaytariladi, xesh esa qaytarilmaydi. Xesh yaxlitlikni tekshirish va parollarni saqlash uchun ishlatiladi.",
        "Encrypted data comes back with the key; a hash does not come back at all. Hashes check integrity and store passwords.",
      ],
    ),
    q(
      BASICS,
      [
        "Quyidagilardan qaysi biri shifrlash EMAS, balki kodlash (encoding)?",
        "Which of these is encoding, NOT encryption?",
      ],
      ["AES", "Base64", "ChaCha20", "RSA"],
      1,
      [
        "Base64 ma’lumotni faqat boshqa ko‘rinishga o‘tkazadi, kalitsiz istalgan odam qaytara oladi. Unda hech qanday maxfiylik yo‘q.",
        "Base64 only changes how the data looks; anyone can reverse it without a key. It gives no secrecy at all.",
      ],
    ),
    q(
      BASICS,
      [
        "Asimmetrik kriptografiyada Ali Vali’ga maxfiy xabarni nima bilan shifrlaydi?",
        "In asymmetric cryptography, what does Ali encrypt a secret message to Vali with?",
      ],
      [
        ["Alining yopiq kaliti", "Ali’s private key"],
        ["Valining ochiq kaliti", "Vali’s public key"],
        ["Valining yopiq kaliti", "Vali’s private key"],
        ["Ikkalasining paroli", "Both their passwords"],
      ],
      1,
      [
        "Xabar qabul qiluvchining ochiq kaliti bilan shifrlanadi va faqat uning yopiq kaliti bilan ochiladi. Yopiq kalit egasidan boshqa hech kimda bo‘lmaydi.",
        "The message is encrypted with the recipient’s public key and only opens with their private key, which nobody else holds.",
      ],
    ),
    q(
      BASICS,
      [
        "Raqamli imzo nimani isbotlaydi?",
        "What does a digital signature prove?",
      ],
      [
        [
          "Xabarni kim yuborganini va u o‘zgartirilmaganini",
          "Who sent the message and that it wasn’t altered",
        ],
        ["Xabar hech kim o‘qimaganini", "That nobody read the message"],
        ["Xabar tez yetib borganini", "That the message arrived quickly"],
        ["Xabar siqilganini", "That the message was compressed"],
      ],
      0,
      [
        "Imzo yuboruvchining yopiq kaliti bilan qo‘yiladi va ochiq kaliti bilan tekshiriladi: muallif va yaxlitlik tasdiqlanadi. Imzo o‘zi xabarni yashirmaydi.",
        "A signature is made with the sender’s private key and checked with their public key, confirming the author and integrity. It does not hide the message.",
      ],
    ),
    // --- Symmetric encryption ----------------------------------------------
    q(
      SYM,
      [
        "Simmetrik shifrlashning asosiy belgisi nima?",
        "What defines symmetric encryption?",
      ],
      [
        [
          "Shifrlash va ochish uchun bitta umumiy kalit ishlatiladi",
          "One shared key encrypts and decrypts",
        ],
        [
          "Ochiq va yopiq kalit jufti ishlatiladi",
          "A public and private key pair is used",
        ],
        ["Kalit umuman kerak emas", "No key is needed at all"],
        ["Faqat xesh ishlatiladi", "Only a hash is used"],
      ],
      0,
      [
        "Simmetrikda ikki tomon bir xil kalitga ega. Bu tez, lekin kalitni xavfsiz yetkazish muammosi bor.",
        "In symmetric encryption both sides hold the same key. It is fast, but the key has to reach the other side safely.",
      ],
    ),
    q(
      SYM,
      [
        "Quyidagilardan qaysi biri simmetrik algoritm?",
        "Which of these is a symmetric algorithm?",
      ],
      ["RSA", "AES", "ECDSA", "Diffie–Hellman"],
      1,
      [
        "AES — simmetrik blokli shifr. RSA va ECDSA asimmetrik, Diffie–Hellman esa kalit kelishish usuli.",
        "AES is a symmetric block cipher. RSA and ECDSA are asymmetric, and Diffie–Hellman is a key agreement method.",
      ],
    ),
    q(
      SYM,
      ["AES blokining hajmi qancha?", "What is AES’s block size?"],
      [
        "64 bit",
        "128 bit",
        "256 bit",
        ["Kalitga qarab o‘zgaradi", "It depends on the key"],
      ],
      1,
      [
        "AES bloki har doim 128 bit. Kalit esa 128, 192 yoki 256 bit bo‘lishi mumkin — AES-256 dagi 256 kalit uzunligini bildiradi.",
        "An AES block is always 128 bits. The key can be 128, 192 or 256 bits; the 256 in AES-256 is the key length.",
      ],
    ),
    q(
      SYM,
      [
        "Nega ECB rejimi xavfli hisoblanadi?",
        "Why is ECB mode considered unsafe?",
      ],
      [
        [
          "Bir xil ochiq bloklar bir xil shifr bloklarga aylanadi va naqsh ko‘rinib qoladi",
          "Identical plaintext blocks give identical ciphertext blocks, so patterns show",
        ],
        ["Juda sekin ishlaydi", "It is very slow"],
        [
          "Kalitni shifrmatnga yozib qo‘yadi",
          "It writes the key into the ciphertext",
        ],
        ["Faqat 8 bitli kalit bilan ishlaydi", "It only works with 8-bit keys"],
      ],
      0,
      [
        "ECB har blokni alohida shifrlaydi, shuning uchun takrorlanadigan qismlar shifrmatnda ham takrorlanadi (mashhur “ECB pingvini”). GCM yoki CBC kabi rejimlar buni yo‘qotadi.",
        "ECB encrypts each block on its own, so repeated parts repeat in the ciphertext too (the famous “ECB penguin”). Modes such as GCM or CBC remove that.",
      ],
    ),
    q(
      SYM,
      [
        "IV (initsializatsiya vektori) nima uchun kerak?",
        "What is an IV (initialization vector) for?",
      ],
      [
        [
          "Bir xil xabar bir kalit bilan har safar boshqacha shifrlanishi uchun",
          "So the same message under the same key encrypts differently each time",
        ],
        ["Kalitni almashtirish uchun", "To replace the key"],
        ["Shifrmatnni qisqartirish uchun", "To shorten the ciphertext"],
        ["Parolni saqlash uchun", "To store the password"],
      ],
      0,
      [
        "IV sir emas, lekin har shifrlashda yangi (GCM’da hech qachon takrorlanmaydigan) bo‘lishi kerak. Aks holda bir xil xabarlar bir xil ko‘rinadi.",
        "An IV is not secret, but it must be fresh for every encryption (never repeated in GCM). Otherwise equal messages look equal.",
      ],
    ),
    q(
      SYM,
      [
        "AES-GCM oddiy shifrlashdan tashqari yana nimani beradi?",
        "What does AES-GCM give beyond encryption?",
      ],
      [
        [
          "Autentifikatsiya: shifrmatn o‘zgartirilsa, ochishda xato chiqadi",
          "Authentication: a tampered ciphertext fails to decrypt",
        ],
        ["Kalitni avtomatik yuborish", "Sending the key automatically"],
        ["Siqish", "Compression"],
        ["Raqamli sertifikat", "A digital certificate"],
      ],
      0,
      [
        "GCM — autentifikatsiyalangan shifrlash (AEAD): u teg qo‘shadi va o‘zgartirilgan ma’lumotni rad etadi. TLS 1.3 faqat shunday rejimlarni ishlatadi.",
        "GCM is authenticated encryption (AEAD): it adds a tag and rejects altered data. TLS 1.3 uses only modes like this.",
      ],
    ),
    q(
      SYM,
      [
        "Simmetrik shifrlashning eng katta muammosi nima?",
        "What is the biggest problem of symmetric encryption?",
      ],
      [
        [
          "Kalitni ikkinchi tomonga xavfsiz yetkazish",
          "Getting the key to the other side safely",
        ],
        ["Juda sekinligi", "It is too slow"],
        ["Katta fayllarni shifrlay olmasligi", "It can’t encrypt large files"],
        ["Faqat matn bilan ishlashi", "It only works on text"],
      ],
      0,
      [
        "Kalitni ochiq kanal orqali yuborsangiz, uni tutib olishadi. Shuning uchun amalda kalit asimmetrik usul (masalan, TLS’dagi ECDHE) bilan kelishiladi, ma’lumot esa tez simmetrik shifr bilan shifrlanadi.",
        "Send the key over an open channel and it gets intercepted. In practice the key is agreed with an asymmetric method (such as ECDHE in TLS) and the data is encrypted with a fast symmetric cipher.",
      ],
    ),
    q(
      SYM,
      [
        "Quyidagilardan qaysi biri eskirgan va endi ishlatilmasligi kerak?",
        "Which of these is obsolete and should no longer be used?",
      ],
      ["AES-256", "ChaCha20", "DES", "AES-128"],
      2,
      [
        "DES’ning kaliti atigi 56 bit — uni bugun bir necha soatda tanlab topish mumkin. AES va ChaCha20 hozirgi tavsiya etilgan shifrlar.",
        "DES has a 56-bit key, which can be brute-forced in hours today. AES and ChaCha20 are the current recommended ciphers.",
      ],
    ),
    // --- HTTPS and TLS -----------------------------------------------------
    q(
      TLS,
      [
        "HTTPS standart bo‘yicha qaysi portda ishlaydi?",
        "Which port does HTTPS use by default?",
      ],
      ["80", "443", "8080", "22"],
      1,
      [
        "HTTPS — 443/tcp, oddiy HTTP — 80/tcp. 8080 ko‘pincha sinov serverlari uchun ishlatiladi.",
        "HTTPS uses 443/tcp and plain HTTP uses 80/tcp. 8080 is often used for test servers.",
      ],
    ),
    q(
      TLS,
      ["HTTPS’dagi “S” nimani anglatadi?", "What does the “S” in HTTPS mean?"],
      [
        [
          "HTTP TLS ichida ishlaydi: shifrlangan va server tekshirilgan",
          "HTTP runs inside TLS: encrypted, with the server verified",
        ],
        ["Sayt tezroq ishlaydi", "The site is faster"],
        [
          "Sayt xavfsiz va unda firibgarlik yo‘q",
          "The site is safe and has no scams",
        ],
        ["Server Linux’da ishlaydi", "The server runs Linux"],
      ],
      0,
      [
        "HTTPS faqat ulanishni himoyalaydi: yo‘lda hech kim o‘qiy yoki o‘zgartira olmaydi. Fishing sayt ham HTTPS’li bo‘lishi mumkin — qulf belgisi sayt halol ekanini bildirmaydi.",
        "HTTPS only protects the connection: nobody on the way can read or change it. A phishing site can have HTTPS too; the padlock doesn’t mean the site is honest.",
      ],
    ),
    q(
      TLS,
      [
        "TLS sertifikati nimani tasdiqlaydi?",
        "What does a TLS certificate confirm?",
      ],
      [
        [
          "Ochiq kalit shu domenga tegishli ekanini, ishonchli CA imzosi bilan",
          "That the public key belongs to this domain, signed by a trusted CA",
        ],
        ["Sayt egasining parolini", "The site owner’s password"],
        ["Sayt viruslardan tozaligini", "That the site is free of viruses"],
        [
          "Saytning IP manzili o‘zgarmasligini",
          "That the site’s IP never changes",
        ],
      ],
      0,
      [
        "Sertifikat domen nomi va ochiq kalitni bog‘laydi, sertifikat markazi (CA) esa buni imzolaydi. Brauzer imzo zanjirini o‘zi ishonadigan ildiz CA’gacha tekshiradi.",
        "A certificate binds a domain name to a public key, and a certificate authority (CA) signs it. The browser checks the chain up to a root CA it trusts.",
      ],
    ),
    q(
      TLS,
      [
        "TLS handshake’ning asosiy vazifasi nima?",
        "What is the main job of the TLS handshake?",
      ],
      [
        [
          "Serverni tekshirish va seans uchun umumiy simmetrik kalitni kelishish",
          "Verify the server and agree on a shared symmetric session key",
        ],
        ["Sahifani yuklab olish", "Download the page"],
        ["Foydalanuvchi parolini tekshirish", "Check the user’s password"],
        ["IP manzil berish", "Hand out an IP address"],
      ],
      0,
      [
        "Handshake’da mijoz sertifikatni tekshiradi va ikki tomon (ECDHE orqali) seans kalitini kelishadi. Keyin barcha ma’lumot shu kalit bilan simmetrik shifrlanadi.",
        "In the handshake the client checks the certificate and both sides agree on a session key (via ECDHE). All data is then encrypted symmetrically with that key.",
      ],
    ),
    q(
      TLS,
      [
        "Hozir qaysi TLS versiyalari xavfsiz hisoblanadi?",
        "Which TLS versions count as secure today?",
      ],
      [
        "SSL 3.0 va TLS 1.0",
        "TLS 1.0 va TLS 1.1",
        ["TLS 1.2 va TLS 1.3", "TLS 1.2 and TLS 1.3"],
        ["Faqat SSL 2.0", "Only SSL 2.0"],
      ],
      2,
      [
        "SSL 2.0/3.0, TLS 1.0 va 1.1 eskirgan va o‘chirilishi kerak. TLS 1.2 (to‘g‘ri sozlansa) va TLS 1.3 hozirgi standart.",
        "SSL 2.0/3.0, TLS 1.0 and 1.1 are obsolete and should be switched off. TLS 1.2 (when configured well) and TLS 1.3 are today’s standard.",
      ],
    ),
    q(
      TLS,
      [
        "Brauzer saytda sertifikat xatosini ko‘rsatdi. To‘g‘ri harakat qaysi?",
        "The browser shows this certificate error on a site. What is the right move?",
      ],
      [
        ["“Baribir davom etish” tugmasini bosish", "Click “Proceed anyway”"],
        [
          "Davom etmaslik: kimdir ulanishni tutib olgan yoki sertifikat noto‘g‘ri bo‘lishi mumkin",
          "Don’t proceed: the connection may be intercepted or the certificate wrong",
        ],
        [
          "Brauzer keshini tozalab, parolni kiritish",
          "Clear the cache and enter the password",
        ],
        ["HTTP orqali ochish", "Open it over HTTP"],
      ],
      1,
      [
        "Bu xato sertifikat domenga mos emas, muddati o‘tgan yoki ishonchsiz ekanini bildiradi — bu MITM hujumi belgisi ham bo‘lishi mumkin. Bunday sahifaga parol kiritilmaydi.",
        "The error means the certificate doesn’t match the domain, has expired or isn’t trusted, which can also be a sign of a MITM attack. Never enter a password on such a page.",
      ],
      "NET::ERR_CERT_COMMON_NAME_INVALID\nThis server could not prove that it is bank.uz",
    ),
    q(
      TLS,
      ["HSTS sarlavhasi nima qiladi?", "What does the HSTS header do?"],
      [
        [
          "Brauzerga saytni faqat HTTPS orqali ochishni buyuradi",
          "Tells the browser to open the site over HTTPS only",
        ],
        ["Sahifani keshlashni o‘chiradi", "Turns off page caching"],
        ["Cookie’larni o‘chiradi", "Deletes cookies"],
        ["Saytni tezlashtiradi", "Speeds up the site"],
      ],
      0,
      [
        "`Strict-Transport-Security` sarlavhasini ko‘rgan brauzer keyingi safar `http://` havolani ham avtomatik `https://` ga o‘tkazadi va sertifikat xatosida davom etishga yo‘l qo‘ymaydi.",
        "After seeing `Strict-Transport-Security`, the browser turns even `http://` links into `https://` and won’t let the user click through certificate errors.",
      ],
    ),
    q(
      TLS,
      [
        "TLS 1.3’da “forward secrecy” nimani anglatadi?",
        "What does forward secrecy mean in TLS 1.3?",
      ],
      [
        [
          "Serverning yopiq kaliti keyin o‘g‘irlansa ham, eski yozib olingan seanslar ochilmaydi",
          "Even if the server’s private key is stolen later, old recorded sessions stay unreadable",
        ],
        [
          "Seans kaliti hech qachon o‘zgarmaydi",
          "The session key never changes",
        ],
        ["Sertifikat muddati cheksiz", "The certificate never expires"],
        ["Ma’lumot oldinroq yuboriladi", "Data is sent earlier"],
      ],
      0,
      [
        "Har seans uchun vaqtinchalik (ephemeral) ECDHE kaliti yaratiladi va keyin o‘chiriladi. Shuning uchun keyinroq o‘g‘irlangan server kaliti eski trafikni ochmaydi.",
        "Each session uses a temporary (ephemeral) ECDHE key that is then thrown away, so a server key stolen later can’t unlock old traffic.",
      ],
    ),
    // --- HTTP --------------------------------------------------------------
    q(
      HTTP,
      [
        "Oddiy (shifrlanmagan) HTTP standart bo‘yicha qaysi portda ishlaydi?",
        "Which port does plain (unencrypted) HTTP use by default?",
      ],
      ["80", "443", "21", "25"],
      0,
      [
        "HTTP — 80/tcp. Undagi hamma narsa (parollar, cookie’lar) ochiq matnda boradi, shuning uchun saytlar 80-portdan 443 (HTTPS) ga yo‘naltiradi.",
        "HTTP uses 80/tcp. Everything on it (passwords, cookies) travels in the clear, which is why sites redirect from 80 to 443 (HTTPS).",
      ],
    ),
    q(
      HTTP,
      [
        "Ma’lumotni faqat o‘qish (olish) uchun ishlatiladigan HTTP metodi qaysi?",
        "Which HTTP method is meant only for reading (fetching) data?",
      ],
      ["GET", "POST", "DELETE", "PUT"],
      0,
      [
        "GET ma’lumotni oladi va serverda hech narsani o‘zgartirmasligi kerak. POST yangi ma’lumot yuboradi, PUT almashtiradi, DELETE o‘chiradi.",
        "GET fetches data and should change nothing on the server. POST sends new data, PUT replaces it, DELETE removes it.",
      ],
    ),
    q(
      HTTP,
      [
        "Server `404` qaytardi. Bu nimani anglatadi?",
        "The server returned `404`. What does it mean?",
      ],
      [
        ["So‘ralgan sahifa topilmadi", "The requested page was not found"],
        ["Server ichida xato yuz berdi", "An error happened inside the server"],
        ["Hammasi muvaffaqiyatli", "Everything succeeded"],
        ["Kirish taqiqlangan", "Access is forbidden"],
      ],
      0,
      [
        "404 — topilmadi. 200 — muvaffaqiyat, 403 — taqiqlangan, 500 — server ichki xatosi.",
        "404 is Not Found. 200 is success, 403 is Forbidden and 500 is an internal server error.",
      ],
    ),
    q(
      HTTP,
      [
        "`3xx` holat kodlari nimani bildiradi?",
        "What do `3xx` status codes mean?",
      ],
      [
        ["Yo‘naltirish (redirect)", "A redirect"],
        ["Mijoz xatosi", "A client error"],
        ["Server xatosi", "A server error"],
        ["Muvaffaqiyat", "Success"],
      ],
      0,
      [
        "1xx — ma’lumot, 2xx — muvaffaqiyat, 3xx — yo‘naltirish (masalan, 301 HTTP’dan HTTPS’ga), 4xx — mijoz xatosi, 5xx — server xatosi.",
        "1xx is informational, 2xx success, 3xx redirect (such as 301 from HTTP to HTTPS), 4xx a client error and 5xx a server error.",
      ],
    ),
    q(
      HTTP,
      [
        "So‘rovdagi `Host` sarlavhasi nima uchun kerak?",
        "What is the `Host` header in a request for?",
      ],
      [
        [
          "Bitta IP’dagi server qaysi saytni so‘rayotganingizni bilishi uchun",
          "So a server on one IP knows which site you want",
        ],
        [
          "Foydalanuvchi parolini yuborish uchun",
          "To send the user’s password",
        ],
        ["Sahifa tilini tanlash uchun", "To pick the page language"],
        ["Faylni siqish uchun", "To compress the file"],
      ],
      0,
      [
        "Bitta serverda o‘nlab sayt bo‘lishi mumkin. `Host: cybervalue.uz` server qaysi sayt sahifasini qaytarishini aniqlaydi.",
        "One server can host dozens of sites. `Host: cybervalue.uz` tells it which site’s page to return.",
      ],
      "GET /about HTTP/1.1\nHost: cybervalue.uz\nUser-Agent: Mozilla/5.0",
    ),
    q(
      HTTP,
      [
        "HTTP “holatsiz” (stateless) degani nima?",
        "What does it mean that HTTP is stateless?",
      ],
      [
        [
          "Har so‘rov alohida; server oldingi so‘rovlarni o‘zi eslab qolmaydi",
          "Each request stands alone; the server doesn’t remember earlier ones by itself",
        ],
        ["HTTP hech qachon xato qaytarmaydi", "HTTP never returns errors"],
        ["HTTP faqat bir marta ishlaydi", "HTTP works only once"],
        ["HTTP shifrlangan", "HTTP is encrypted"],
      ],
      0,
      [
        "Server sizni so‘rovlar orasida tanishi uchun cookie (masalan, seans identifikatori) ishlatiladi. Shuning uchun seans cookie’sini o‘g‘irlash hisobni o‘g‘irlash bilan barobar.",
        "To recognise you between requests, servers use cookies such as a session ID. That is why stealing a session cookie is as good as stealing the account.",
      ],
    ),
    q(
      HTTP,
      [
        "Seans cookie’sidagi `HttpOnly` belgisi nima qiladi?",
        "What does the `HttpOnly` flag on a session cookie do?",
      ],
      [
        [
          "Sahifadagi JavaScript cookie’ni o‘qiy olmaydi",
          "Page JavaScript can’t read the cookie",
        ],
        [
          "Cookie faqat HTTP orqali yuboriladi, HTTPS orqali emas",
          "The cookie is sent over HTTP only, not HTTPS",
        ],
        ["Cookie hech qachon o‘chmaydi", "The cookie never expires"],
        ["Cookie shifrlanadi", "The cookie is encrypted"],
      ],
      0,
      [
        "`HttpOnly` XSS orqali `document.cookie` bilan seansni o‘g‘irlashni qiyinlashtiradi. Cookie faqat HTTPS orqali yurishi uchun esa `Secure` belgisi kerak.",
        "`HttpOnly` stops XSS from stealing the session through `document.cookie`. Keeping the cookie on HTTPS only is the job of the `Secure` flag.",
      ],
    ),
    q(
      HTTP,
      [
        "Kafedagi ochiq Wi-Fi’da kimdir trafikni tinglayapti. Siz `http://` saytga login va parol kiritdingiz. Nima bo‘ladi?",
        "Someone is sniffing the open café Wi-Fi. You log in to an `http://` site. What happens?",
      ],
      [
        [
          "Login va parol ochiq matnda ko‘rinadi",
          "The username and password are visible in plain text",
        ],
        [
          "Parol avtomatik shifrlanadi",
          "The password is encrypted automatically",
        ],
        [
          "Hech narsa ko‘rinmaydi, chunki Wi-Fi bor",
          "Nothing is visible because it’s Wi-Fi",
        ],
        ["Faqat sayt nomi ko‘rinadi", "Only the site name is visible"],
      ],
      0,
      [
        "HTTP’da POST so‘rovining tanasi ochiq boradi, tinglovchi uni to‘liq o‘qiydi. Login sahifalari faqat HTTPS orqali bo‘lishi kerak.",
        "Over HTTP the POST body travels in the clear and a listener reads it whole. Login pages must be served over HTTPS only.",
      ],
      "POST /login HTTP/1.1\nHost: shop.example\nContent-Type: application/x-www-form-urlencoded\n\nuser=ali&password=Qwerty2026",
    ),
  ],
};

export const TOPIC_EXAMS: TopicExam[] = [SSH_CRYPTO_EXAM];

export const topicExam = (id: string) =>
  TOPIC_EXAMS.find((e) => e.id === id) ?? null;
