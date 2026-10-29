// Academy Intermediate · Network security, module 1: TCP/IP in depth. The
// lessons use ./tools.ts: the numbers of a TCP handshake, the replies a port
// scan reads, and the odds of poisoning a DNS cache.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget = CommonWidget | { type: "handshake" } | { type: "dns" };

export const PROGRESS_KEY = "cybervalue:tcpip:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string) => t(s, s);

const LAYERS = t("Qatlamlar va sarlavhalar", "Layers and headers");
const TCP = t("TCP ichida", "Inside TCP");
const NAMES = t("ICMP va DNS", "ICMP and DNS");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: LAYERS,
    title: t("Har bir sarlavha nimani olib yuradi", "What each header carries"),
    minutes: 6,
    intro: t(
      "Tarmoqdagi har bir paket qatlamma-qatlam o‘ralgan: Ethernet ramkasi ichida IP paketi, uning ichida TCP yoki UDP segmenti, uning ichida esa ilova ma’lumoti (masalan, HTTP). Har bir qatlam o‘z sarlavhasiga o‘z ma’lumotini yozadi.",
      "Every packet on a network is wrapped in layers: an Ethernet frame holds an IP packet, which holds a TCP or UDP segment, which holds the application’s data (HTTP, say). Each layer writes its own facts into its own header.",
    ),
    analogy: t(
      "Konvert ichidagi konvert: tashqisida shahar manzili (IP), ichkisida xona raqami (port), eng ichida — xatning o‘zi.",
      "An envelope inside an envelope: the outer one has the street address (IP), the inner one the room number (port), and inside that the letter itself.",
    ),
    theory: [
      t(
        "MAC manzil — faqat bitta tarmoq segmenti ichida; IP — butun yo‘l bo‘yi; port — kompyuter ichidagi qaysi dastur.",
        "A MAC address matters only on one network segment; an IP address along the whole route; a port says which program on the computer.",
      ),
      t(
        "Xavfsizlik vositalari (firewall, IDS) aynan shu sarlavhalarni o‘qib qaror qiladi.",
        "Security tools (firewalls, IDS) decide by reading exactly these headers.",
      ),
    ],
    task: t(
      "Har bir ma’lumot qaysi sarlavhada yoziladi?",
      "Which header carries each piece of information?",
    ),
    hint: t(
      "Port va seq raqami — TCP; manzil va TTL — IP; MAC — Ethernet.",
      "Ports and sequence numbers are TCP; addresses and TTL are IP; MAC is Ethernet.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "eth", label: code("Ethernet") },
        { id: "ip", label: code("IP") },
        { id: "tcp", label: code("TCP") },
      ],
      items: [
        {
          label: t(
            "Tarmoq kartasining MAC manzili",
            "The network card’s MAC address",
          ),
          bucket: "eth",
        },
        {
          label: t(
            "Qabul qiluvchining IP manzili",
            "The destination IP address",
          ),
          bucket: "ip",
        },
        { label: code("TTL"), code: true, bucket: "ip" },
        {
          label: t("Qabul qiluvchi port (443)", "The destination port (443)"),
          bucket: "tcp",
        },
        {
          label: t("Ketma-ketlik raqami (seq)", "The sequence number (seq)"),
          bucket: "tcp",
        },
        {
          label: t("SYN va ACK bayroqlari", "The SYN and ACK flags"),
          bucket: "tcp",
        },
      ],
    },
  },
  {
    id: 2,
    group: TCP,
    title: t("Uch qadamli salomlashish", "The three-way handshake"),
    minutes: 10,
    intro: t(
      "TCP ulanishi uch xabar bilan boshlanadi: SYN, SYN-ACK, ACK. Har bir tomon tasodifiy boshlang‘ich raqam (ISN) tanlaydi. ACK raqami “men shu raqamgacha hammasini oldim, keyingisini kutyapman” degani. SYN o‘zi bitta raqam egallaydi, ma’lumot esa uzunligicha.",
      "A TCP connection starts with three messages: SYN, SYN-ACK, ACK. Each side picks a random initial sequence number (ISN). An ACK number means “I have everything up to here, I expect this one next”. A SYN takes up one number; data takes up its length.",
    ),
    analogy: t(
      "Telefonda: “Eshityapsizmi?” — “Ha, eshityapman, siz-chi?” — “Ha”. Shundan keyin suhbat boshlanadi.",
      "On the phone: “Can you hear me?” — “Yes, can you hear me?” — “Yes.” Then the conversation starts.",
    ),
    theory: [
      t(
        "ISN tasodifiy bo‘lishi xavfsizlik uchun muhim: taxmin qilinadigan raqamlar soxta paketlarni ulanishga “tiqib qo‘yish”ga imkon beradi.",
        "A random ISN matters for security: guessable numbers let an attacker inject forged packets into a connection.",
      ),
      t(
        "Yopiq portga SYN kelsa, server RST bilan javob beradi; firewall esa ko‘pincha umuman javob bermaydi.",
        "A SYN to a closed port gets a RST back; a firewall often sends no reply at all.",
      ),
    ],
    task: t(
      "Bo‘sh joylarga to‘g‘ri seq va ack raqamlarini yozing.",
      "Fill in the right seq and ack numbers.",
    ),
    hint: t(
      "ack = qarshi tomonning seq + 1 (SYN uchun) yoki + baytlar soni (ma’lumot uchun).",
      "ack = the other side’s seq + 1 (for a SYN) or + the number of bytes (for data).",
    ),
    widget: { type: "handshake" },
  },
  {
    id: 3,
    group: TCP,
    title: t("TCP yoki UDP", "TCP or UDP"),
    minutes: 6,
    intro: t(
      "TCP ishonchli: yo‘qolgan paket qayta yuboriladi, tartib saqlanadi. UDP oddiy va tez: kafolat yo‘q, lekin kechikish kam. Shuning uchun har bir xizmat o‘ziga moslarini tanlaydi.",
      "TCP is reliable: lost packets are sent again and order is kept. UDP is plain and fast: no guarantees, but little delay. So each service picks what suits it.",
    ),
    analogy: t(
      "TCP — buyurtma xat, yetib borganini tasdiqlaydi. UDP — ochiq xat, tez, lekin yo‘qolsa hech kim bilmaydi.",
      "TCP is registered mail that confirms delivery. UDP is a postcard: fast, but if it is lost nobody knows.",
    ),
    theory: [
      t(
        "UDP manzilini soxtalashtirish oson (salomlashish yo‘q) — shuning uchun DNS va NTP kabi UDP xizmatlari amplification DDoS’da ishlatiladi.",
        "UDP addresses are easy to fake (there is no handshake) — which is why UDP services such as DNS and NTP are used in amplification DDoS.",
      ),
    ],
    task: t(
      "Har bir xizmat odatda qaysi protokoldan foydalanadi?",
      "Which protocol does each service usually use?",
    ),
    hint: t(
      "Ozgina kechikish muhim bo‘lsa — UDP; har bir bayt muhim bo‘lsa — TCP.",
      "When low delay matters, UDP; when every byte matters, TCP.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "tcp", label: code("TCP") },
        { id: "udp", label: code("UDP") },
      ],
      items: [
        {
          label: t(
            "Veb-sahifa (HTTP/1.1, HTTP/2)",
            "A web page (HTTP/1.1, HTTP/2)",
          ),
          bucket: "tcp",
        },
        { label: t("SSH ulanishi", "An SSH session"), bucket: "tcp" },
        {
          label: t("Oddiy DNS so‘rovi", "An ordinary DNS query"),
          bucket: "udp",
        },
        { label: t("Video qo‘ng‘iroq", "A video call"), bucket: "udp" },
        { label: t("WireGuard VPN", "WireGuard VPN"), bucket: "udp" },
        {
          label: t("Pochta yuborish (SMTP)", "Sending mail (SMTP)"),
          bucket: "tcp",
        },
      ],
    },
  },
  {
    id: 4,
    group: TCP,
    title: t("Port skanerini o‘qish", "Reading a port scan"),
    minutes: 8,
    intro: t(
      "nmap kabi skaner har bir portga SYN yuboradi va javobga qarab xulosa qiladi: SYN-ACK — port ochiq, RST — yopiq, javob yo‘q yoki ICMP “unreachable” — filtrlangan (firewall to‘sgan). Himoyachi ham o‘z serverini shunday tekshiradi.",
      "A scanner such as nmap sends a SYN to each port and reads the reply: SYN-ACK means open, RST means closed, no reply or an ICMP “unreachable” means filtered (a firewall dropped it). Defenders check their own servers the same way.",
    ),
    analogy: t(
      "Mehmonxona eshiklarini taqillatish: kimdir ochsa — xonada odam bor; “bu yerda hech kim yo‘q” desa — yopiq; umuman javob bo‘lmasa — qorovul yo‘lakka kiritmagan.",
      "Knocking on hotel doors: someone opens — the room is in use; “nobody here” — closed; no answer at all — a guard kept you out of the corridor.",
    ),
    theory: [
      t(
        "Faqat ruxsat etiladigan begona so‘rovlardan himoya qiling: o‘z serveringizni yoki yozma ruxsat olgan tarmoqni skanerlang.",
        "Scan only what you may: your own servers or networks you have written permission for.",
      ),
      t(
        "Ochiq port — keraksiz xizmat bo‘lishi mumkin. Har bir ochiq port uchun “bu nima uchun kerak?” deb so‘rang.",
        "An open port may be a service nobody needs. For each open port ask: why is this here?",
      ),
    ],
    task: t(
      "Har bir javobga ko‘ra port holatini aniqlang.",
      "Work out each port’s state from its reply.",
    ),
    hint: t(
      "SYN-ACK — ochiq, RST — yopiq, sukut — filtrlangan.",
      "SYN-ACK open, RST closed, silence filtered.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "open", label: t("Ochiq", "Open") },
        { id: "closed", label: t("Yopiq", "Closed") },
        { id: "filtered", label: t("Filtrlangan", "Filtered") },
      ],
      items: [
        { label: t("22/tcp → SYN-ACK", "22/tcp → SYN-ACK"), bucket: "open" },
        { label: t("23/tcp → RST", "23/tcp → RST"), bucket: "closed" },
        {
          label: t("3389/tcp → javob yo‘q", "3389/tcp → no reply"),
          bucket: "filtered",
        },
        { label: t("443/tcp → SYN-ACK", "443/tcp → SYN-ACK"), bucket: "open" },
        {
          label: t(
            "445/tcp → ICMP port unreachable",
            "445/tcp → ICMP port unreachable",
          ),
          bucket: "filtered",
        },
        { label: t("8080/tcp → RST", "8080/tcp → RST"), bucket: "closed" },
      ],
    },
  },
  {
    id: 5,
    group: NAMES,
    title: t("ICMP: ping va traceroute", "ICMP: ping and traceroute"),
    minutes: 6,
    intro: t(
      "ICMP — tarmoqning xizmat xabarlari. ping “echo request” yuboradi va “echo reply” kutadi. traceroute esa TTL ni 1, 2, 3… qilib yuboradi: har bir router TTL tugaganda “time exceeded” javobini qaytaradi va shu tariqa yo‘lni ko‘rsatadi.",
      "ICMP carries the network’s service messages. ping sends an “echo request” and waits for an “echo reply”. traceroute sends packets with TTL 1, 2, 3…: each router answers “time exceeded” when the TTL runs out, which shows the route.",
    ),
    analogy: t(
      "Har bir bekatda “men shu yerdaman” deb xabar beradigan yo‘lovchi.",
      "A traveller who calls from every stop to say “I’m here now”.",
    ),
    theory: [
      t(
        "ICMP’ni butunlay o‘chirish xato: “fragmentation needed” xabarlarisiz katta paketlar yo‘qoladi (PMTU). Faqat kerakli turlarini qoldiring.",
        "Blocking all ICMP is a mistake: without “fragmentation needed” messages large packets vanish (PMTU). Keep the types you need.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("TTL — paketning “umri”.", "TTL is a packet’s “lifetime”."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "traceroute yo‘ldagi routerlarni qanday biladi?",
            "How does traceroute learn the routers on the way?",
          ),
          options: [
            t(
              "TTL ni oshirib boradi; har bir router “time exceeded” qaytaradi",
              "It raises the TTL; each router returns “time exceeded”",
            ),
            t(
              "Routerlardan parol so‘raydi",
              "It asks the routers for a password",
            ),
            t("DNS’dan ro‘yxatni oladi", "It fetches a list from DNS"),
          ],
          answer: 0,
          explain: t(
            "TTL har routerda 1 ga kamayadi va 0 da paket tashlanadi.",
            "The TTL drops by one at each router and the packet is dropped at 0.",
          ),
        },
        {
          ask: t(
            "Nega barcha ICMP’ni bloklash yomon fikr?",
            "Why is blocking all ICMP a bad idea?",
          ),
          options: [
            t(
              "Path MTU aniqlash buziladi, katta paketlar yo‘qoladi",
              "Path MTU discovery breaks and large packets vanish",
            ),
            t("Internet tezlashadi", "The internet gets faster"),
            t("Parollar ochiq qoladi", "Passwords become visible"),
          ],
          answer: 0,
          explain: t(
            "Kerakli turlarni (masalan, fragmentation needed) ruxsat eting.",
            "Allow the types you need, such as fragmentation needed.",
          ),
        },
      ],
    },
  },
  {
    id: 6,
    group: NAMES,
    title: t("DNS keshini zaharlash", "Poisoning a DNS cache"),
    minutes: 10,
    intro: t(
      "Rezolver bank.uz manzilini so‘raydi va javob kutadi. Hujumchi haqiqiy javobdan oldin soxta javoblarni yuboradi. Rezolver javobni faqat 16 bitli tranzaksiya ID’si bo‘yicha tekshirsa, hujumchi uni taxmin qilib, soxta manzilni keshga yozdiradi — barcha foydalanuvchilar soxta saytga boradi.",
      "A resolver asks for bank.uz and waits for the answer. The attacker sends forged answers before the real one. If the resolver checks only the 16-bit transaction ID, the attacker guesses it and gets a fake address cached — everyone using that resolver goes to the fake site.",
    ),
    analogy: t(
      "Ma’lumotnomaga qo‘ng‘iroq qilib, bankning raqamini so‘raysiz; kimdir xodimdan oldin javob berib, o‘z raqamini aytadi — ma’lumotnoma uni yozib qo‘yadi.",
      "You ring directory enquiries for the bank’s number; someone answers before the operator and gives their own number — and the directory writes it down.",
    ),
    theory: [
      t(
        "2008-yilda Kaminsky hujumi buni amalda ko‘rsatdi. Himoya: har bir so‘rovni tasodifiy manba portdan yuborish — taxmin qilish maydoni ~65 536 dan ~1,8 milliardga oshadi.",
        "In 2008 the Kaminsky attack showed this in practice. The fix: send each query from a random source port — the space to guess grows from about 65 536 to about 1.8 billion.",
      ),
      t(
        "DNSSEC javoblarni imzolaydi: soxta javobning imzosi yo‘q, shuning uchun rezolver uni rad etadi.",
        "DNSSEC signs answers: a forged answer has no valid signature, so the resolver refuses it.",
      ),
    ],
    task: t(
      "Rezolverni shunday sozlangki, eng kuchli hujumchida ham muvaffaqiyat ehtimoli mingdan birdan kam bo‘lsin.",
      "Set up the resolver so even the strongest attacker here has less than a one-in-a-thousand chance.",
    ),
    hint: t(
      "Tasodifiy manba port yoki DNSSEC.",
      "A random source port, or DNSSEC.",
    ),
    widget: { type: "dns" },
  },
  {
    id: 7,
    group: NAMES,
    title: t("SYN toshqini", "The SYN flood"),
    minutes: 6,
    intro: t(
      "Server har bir SYN uchun yarim ochiq ulanishni eslab qoladi va ACK kutadi. Hujumchi soxta manzillardan millionlab SYN yuborsa, navbat to‘lib qoladi va haqiqiy foydalanuvchilar ulana olmaydi.",
      "A server remembers a half-open connection for every SYN and waits for the ACK. An attacker sending millions of SYNs from fake addresses fills the queue, and real users cannot connect.",
    ),
    analogy: t(
      "Restoranga yuzlab soxta stol buyurtmasi: stollar band, lekin hech kim kelmaydi.",
      "Hundreds of fake table bookings at a restaurant: the tables are held, but nobody comes.",
    ),
    theory: [
      t(
        "SYN cookies: server hech narsani eslab qolmaydi — holatni SYN-ACK’ning seq raqamiga kodlaydi va faqat to‘g‘ri ACK kelganda ulanishni yaratadi.",
        "SYN cookies: the server remembers nothing — it encodes the state in the SYN-ACK’s sequence number and only builds the connection when a valid ACK arrives.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t("SYN cookies — xotirani tejaydi.", "SYN cookies save memory."),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "SYN toshqini nimani to‘ldiradi?",
            "What does a SYN flood fill up?",
          ),
          options: [
            t(
              "Yarim ochiq ulanishlar navbatini",
              "The queue of half-open connections",
            ),
            t("Serverning diskini", "The server’s disk"),
            t("Foydalanuvchi parolini", "The user’s password"),
          ],
          answer: 0,
          explain: t(
            "Har bir SYN uchun server joy ajratadi va ACK kutadi.",
            "For each SYN the server keeps a slot and waits for the ACK.",
          ),
        },
        {
          ask: t(
            "SYN cookies qanday himoya qiladi?",
            "How do SYN cookies protect?",
          ),
          options: [
            t(
              "Holatni seq raqamiga yozadi, xotira ajratmaydi",
              "They put the state in the sequence number and keep no memory",
            ),
            t("Barcha SYN’larni bloklaydi", "They block every SYN"),
            t("Parol so‘raydi", "They ask for a password"),
          ],
          answer: 0,
          explain: t(
            "Soxta manzil hech qachon ACK yubormaydi, shuning uchun hech narsa sarflanmaydi.",
            "A fake address never sends the ACK, so nothing is spent on it.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: NAMES,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: sarlavhalar, salomlashish, TCP va UDP, port holatlari, ICMP, DNS zaharlash va SYN toshqini.",
      "A review of the module: headers, the handshake, TCP and UDP, port states, ICMP, DNS poisoning and SYN floods.",
    ),
    analogy: t(
      "Tarmoqni tushunish — xaritani o‘qishni bilish: hujum ham, himoya ham shu xaritada chiziladi.",
      "Understanding the network is knowing how to read the map: attacks and defences are both drawn on it.",
    ),
    theory: [
      t(
        "Keyingi modullar — trafik tahlili, firewall, xavfsiz ulanishlar va hujumni aniqlash — shu asosga quriladi.",
        "The next modules — traffic analysis, firewalls, secure connections and intrusion detection — build on this.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Har bir hujum qaysi qatlamda ishlashini eslang.",
      "Remember which layer each attack works at.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Mijoz SYN’ni seq=500 bilan yubordi. Server SYN-ACK’da qanday ack yozadi?",
            "The client sends a SYN with seq=500. Which ack does the server’s SYN-ACK carry?",
          ),
          options: [code("501"), code("500"), code("1")],
          answer: 0,
          explain: t(
            "SYN bitta raqam egallaydi: keyingi kutilgani 501.",
            "A SYN takes one number: the next one expected is 501.",
          ),
        },
        {
          ask: t(
            "Skaner SYN yubordi va javob olmadi. Port holati?",
            "A scanner sent a SYN and got no reply. The port’s state?",
          ),
          options: [
            t("Filtrlangan", "Filtered"),
            t("Ochiq", "Open"),
            t("Yopiq", "Closed"),
          ],
          answer: 0,
          explain: t(
            "Yopiq port RST qaytaradi; sukut — firewall belgisi.",
            "A closed port sends a RST; silence points to a firewall.",
          ),
        },
        {
          ask: t(
            "DNS kesh zaharlashdan qaysi biri himoya qiladi?",
            "What protects against DNS cache poisoning?",
          ),
          options: [
            t(
              "DNSSEC yoki tasodifiy manba port",
              "DNSSEC or a random source port",
            ),
            t("Uzunroq domen nomi", "A longer domain name"),
            t("TTL ni 0 qilish", "Setting the TTL to 0"),
          ],
          answer: 0,
          explain: t(
            "Port taxminni qiyinlashtiradi, DNSSEC esa soxta javobni rad etadi.",
            "The port makes guessing harder; DNSSEC refuses the forged answer outright.",
          ),
        },
        {
          ask: t(
            "Nega DNS amplification hujumlarda ishlatiladi?",
            "Why is DNS used in amplification attacks?",
          ),
          options: [
            t(
              "UDP manzilini soxtalashtirish oson va javob so‘rovdan katta",
              "UDP sources are easy to fake and the answer is bigger than the question",
            ),
            t("DNS faqat TCP ishlatadi", "DNS uses TCP only"),
            t("DNS shifrlangan", "DNS is encrypted"),
          ],
          answer: 0,
          explain: t(
            "Kichik so‘rov katta javobni qurbonning manziliga yo‘naltiradi.",
            "A small query sends a large answer to the victim’s address.",
          ),
        },
      ],
    },
  },
];
