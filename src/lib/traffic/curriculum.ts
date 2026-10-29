// Academy Intermediate · Network security, module 2: Traffic analysis. The
// lessons use ./tools.ts: a recorded capture with a Wireshark-style display
// filter, a plain-HTTP login stream, and hosts whose check-ins may be a
// beacon.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "filter" } | { type: "stream" } | { type: "beacon" };

export const PROGRESS_KEY = "cybervalue:traffic:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });
const code = (s: string) => t(s, s);

const CAPTURE = t("Yozib olish va filtrlash", "Capturing and filtering");
const READING = t("Trafikni o‘qish", "Reading the traffic");
const HUNTING = t("G‘ayrioddiylarni topish", "Spotting the unusual");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: CAPTURE,
    title: t("Bitta paket qatori", "One line of a capture"),
    minutes: 6,
    intro: t(
      "tcpdump yoki Wireshark tarmoqdan o‘tgan har bir paketni yozib oladi (pcap fayl). Har bir qator — bitta paket: qachon, kimdan, kimga, qaysi port, qaysi bayroqlar va qancha ma’lumot.",
      "tcpdump or Wireshark records every packet that crosses the network (a pcap file). Each line is one packet: when, from whom, to whom, which port, which flags and how much data.",
    ),
    analogy: t(
      "Pochta bo‘limining jurnali: har bir posilka uchun vaqt, jo‘natuvchi, qabul qiluvchi va og‘irlik yoziladi — ichidagi narsani ochmasdan ham ko‘p narsa bilinadi.",
      "A post office log: for every parcel the time, sender, recipient and weight — you learn a lot without opening anything.",
    ),
    theory: [
      t(
        "IP manzildan keyingi nuqta va raqam — port: 10.0.0.5.50122 — 10.0.0.5 manzilining 50122-porti.",
        "The number after the last dot of an address is the port: 10.0.0.5.50122 is port 50122 on 10.0.0.5.",
      ),
      t(
        "Bayroqlar: S — SYN, . — ACK, R — RST, P — PUSH (ma’lumot), F — FIN (yopish).",
        "Flags: S is SYN, . is ACK, R is RST, P is PUSH (data), F is FIN (close).",
      ),
    ],
    task: t(
      "Qatorning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the line and read what it is.",
    ),
    hint: t("Hammasi bo‘lib oltita qism.", "Six parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "10:02:11.204", id: "time" },
          { text: " IP " },
          { text: "10.0.0.5.50122", id: "src" },
          { text: " > " },
          { text: "185.8.1.10.443", id: "dst" },
          { text: ": " },
        ],
        [
          { text: "Flags [S]", id: "flags" },
          { text: ", " },
          { text: "seq 1000", id: "seq" },
          { text: ", win 64240, " },
          { text: "length 0", id: "length" },
        ],
      ],
      parts: [
        {
          id: "time",
          title: t("Vaqt", "Time"),
          body: t(
            "Paket qachon ushlangani. Vaqtlar orasidagi farq ko‘p narsani aytadi: juda tez ketma-ket SYN’lar — skaner belgisi.",
            "When the packet was captured. The gaps between times say a lot: SYNs in very quick succession point to a scanner.",
          ),
        },
        {
          id: "src",
          title: t("Manba manzil va port", "Source address and port"),
          body: t(
            "Mijoz 10.0.0.5, port 50122. Mijoz porti odatda tasodifiy va katta raqam.",
            "The client 10.0.0.5, port 50122. A client’s port is usually a random high number.",
          ),
        },
        {
          id: "dst",
          title: t(
            "Qabul qiluvchi manzil va port",
            "Destination address and port",
          ),
          body: t(
            "Server 185.8.1.10, port 443 — HTTPS. Port xizmatni aytadi.",
            "The server 185.8.1.10, port 443 — HTTPS. The port tells you the service.",
          ),
        },
        {
          id: "flags",
          title: t("TCP bayroqlari", "TCP flags"),
          body: t(
            "[S] — SYN: yangi ulanish boshlanmoqda. [S.] — SYN-ACK, [R] — RST.",
            "[S] is SYN: a new connection is starting. [S.] is SYN-ACK, [R] is RST.",
          ),
        },
        {
          id: "seq",
          title: t("Ketma-ketlik raqami", "Sequence number"),
          body: t(
            "Mijozning boshlang‘ich raqami (ISN). Oldingi modulda uni hisoblagansiz.",
            "The client’s initial sequence number. You worked these out in the previous module.",
          ),
        },
        {
          id: "length",
          title: t("Ma’lumot uzunligi", "Data length"),
          body: t(
            "SYN’da ma’lumot yo‘q — 0 bayt. Kichik so‘rov, katta javob — yuklab olish; aksincha — yuklash (balki ma’lumot o‘g‘irlash).",
            "A SYN carries no data — 0 bytes. A small request and big reply is a download; the other way round an upload (perhaps data theft).",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: CAPTURE,
    title: t("Ko‘rsatish filtrlari", "Display filters"),
    minutes: 12,
    intro: t(
      "Haqiqiy yozuvda millionlab paket bo‘ladi. Wireshark’ning ko‘rsatish filtri faqat keraklilarini qoldiradi: ip.src == 10.0.0.66, tcp.port == 443, dns, tcp.flags.syn == 1 — va ularni && (va), || (yoki), ! (emas) bilan birlashtirish mumkin.",
      "A real capture holds millions of packets. A Wireshark display filter keeps only the ones you need: ip.src == 10.0.0.66, tcp.port == 443, dns, tcp.flags.syn == 1 — combined with && (and), || (or) and ! (not).",
    ),
    analogy: t(
      "Elektron jadvaldagi filtr: barcha qatorlar joyida, lekin ko‘zingiz oldida faqat kerakli qatorlar.",
      "A spreadsheet filter: every row is still there, but you see only the ones you asked for.",
    ),
    theory: [
      t(
        "Skaner har bir portga ACK’siz SYN yuboradi — bu oddiy ulanishning birinchi paketiga o‘xshaydi, shuning uchun manzil bo‘yicha ham ajratish kerak.",
        "A scanner sends a bare SYN (no ACK) to each port — just like the first packet of a normal connection, so you must narrow by address too.",
      ),
      t(
        "Ko‘rsatish filtri (display filter) yozib olish filtridan (capture filter, BPF: “host 10.0.0.66 and tcp”) farq qiladi: u faqat ko‘rinishni o‘zgartiradi, hech narsa o‘chirilmaydi.",
        "A display filter differs from a capture filter (BPF: “host 10.0.0.66 and tcp”): it changes only the view, nothing is thrown away.",
      ),
    ],
    task: t(
      "Filtr yozing: faqat 10.0.0.66 skaneri yuborgan ACK’siz SYN paketlari qolsin.",
      "Write a filter that shows only the bare SYNs (no ACK) sent by the scanner 10.0.0.66.",
    ),
    hint: t(
      "ip.src == 10.0.0.66 && tcp.flags.syn == 1 && tcp.flags.ack == 0",
      "ip.src == 10.0.0.66 && tcp.flags.syn == 1 && tcp.flags.ack == 0",
    ),
    widget: { type: "filter" },
  },
  {
    id: 3,
    group: READING,
    title: t("TLS nimani yashiradi", "What TLS hides"),
    minutes: 6,
    intro: t(
      "HTTPS mazmunni shifrlaydi, lekin tarmoqdagi kuzatuvchi baribir ko‘p narsani ko‘radi: kim kim bilan gaplashyapti, qachon, qancha hajmda, odatda saytning nomi (SNI va DNS so‘rovi orqali) ham.",
      "HTTPS encrypts the content, but someone watching the network still sees a lot: who talks to whom, when, how much, and usually the site’s name too (from the SNI and the DNS query).",
    ),
    analogy: t(
      "Yopiq konvert: xat o‘qilmaydi, lekin manzil, jo‘natuvchi, og‘irlik va qachon yuborilgani ko‘rinib turadi.",
      "A sealed envelope: the letter can’t be read, but the address, sender, weight and date are on show.",
    ),
    theory: [
      t(
        "Encrypted Client Hello (ECH) va DNS-over-HTTPS bu sizishni kamaytiradi, lekin IP manzil va vaqt baribir ko‘rinadi.",
        "Encrypted Client Hello (ECH) and DNS over HTTPS reduce the leak, but the IP addresses and timing still show.",
      ),
    ],
    task: t(
      "HTTPS bo‘lsa ham, tarmoqdagi kuzatuvchi nimani ko‘radi va nimani ko‘rmaydi?",
      "With HTTPS, what can someone on the network still see, and what not?",
    ),
    hint: t(
      "Sarlavhalar va metama’lumot ko‘rinadi; so‘rovning ichidagi hamma narsa — yo‘q.",
      "Headers and metadata show; everything inside the request does not.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "seen", label: t("Ko‘rinadi", "Visible") },
        { id: "hidden", label: t("Yashirin", "Hidden") },
      ],
      items: [
        {
          label: t(
            "Mijoz va serverning IP manzillari",
            "The client’s and server’s IP addresses",
          ),
          bucket: "seen",
        },
        {
          label: t(
            "Client Hello’dagi SNI: bank.uz",
            "The SNI in the Client Hello: bank.uz",
          ),
          bucket: "seen",
        },
        {
          label: t("Paketlar hajmi va vaqti", "Packet sizes and timing"),
          bucket: "seen",
        },
        { label: code("/transfer?to=…&sum=…"), code: true, bucket: "hidden" },
        {
          label: t("Sessiya cookie’si", "The session cookie"),
          bucket: "hidden",
        },
        {
          label: t("Kiritilgan parol", "The password typed in"),
          bucket: "hidden",
        },
      ],
    },
  },
  {
    id: 4,
    group: READING,
    title: t("Shifrlanmagan login", "A login in the clear"),
    minutes: 10,
    intro: t(
      "Ofisdagi router admin paneli oddiy HTTP’da ishlaydi va Basic autentifikatsiyadan foydalanadi. Wireshark’da “Follow TCP stream” suhbatni yaxlit matn sifatida ko‘rsatadi. Authorization sarlavhasidagi qator — shifr emas, faqat Base64.",
      "The office router’s admin panel runs over plain HTTP with Basic authentication. In Wireshark, “Follow TCP stream” shows the whole conversation as text. The line in the Authorization header is not encryption, only Base64.",
    ),
    analogy: t(
      "Parolni ochiq xatga yozib, ustidan boshqa alifboda qayta yozish: harflar boshqacha, lekin kalitni hamma biladi.",
      "Writing a password on a postcard in another alphabet: the letters look different, but everyone knows how to read it.",
    ),
    theory: [
      t(
        "Base64 — kodlash, shifrlash emas: kalit yo‘q, har kim ortga qaytara oladi.",
        "Base64 is an encoding, not encryption: there is no key, anyone can reverse it.",
      ),
      t(
        "FTP, Telnet, POP3 va oddiy HTTP parolni ochiq yuboradi. Ularning o‘rniga SFTP, SSH va HTTPS ishlating.",
        "FTP, Telnet, POP3 and plain HTTP send passwords in the clear. Use SFTP, SSH and HTTPS instead.",
      ),
    ],
    task: t(
      "Oqimni oching, Base64’ni yeching va parolni yozing.",
      "Follow the stream, decode the Base64 and type the password.",
    ),
    hint: t(
      "Basic’dan keyingi qatorni dekoderga qo‘ying: “foydalanuvchi:parol” chiqadi.",
      "Put the text after Basic in the decoder: you get “user:password”.",
    ),
    widget: { type: "stream" },
  },
  {
    id: 5,
    group: HUNTING,
    title: t("Oddiy yoki shubhali", "Normal or suspicious"),
    minutes: 8,
    intro: t(
      "Tahlilchining asosiy savoli: “bu odatdagidek-mi?”. Ish vaqtidagi brauzer trafigi — odatiy. Bir xostdan yuzlab portga SYN, uzun tasodifiy subdomenli DNS so‘rovlari yoki tunda noma’lum manzilga gigabaytlar — tekshirish kerak.",
      "An analyst’s main question is “is this normal?”. Browser traffic during work hours is normal. SYNs to hundreds of ports from one host, DNS queries with long random subdomains, or gigabytes to an unknown address at night need a closer look.",
    ),
    analogy: t(
      "Qorovul har kuni bir xil odamlarni ko‘radi; tunda orqa eshikdan qutilar olib chiqayotgan notanish odam darhol ko‘zga tashlanadi.",
      "A guard sees the same people every day; a stranger carrying boxes out the back door at night stands out at once.",
    ),
    theory: [
      t(
        "DNS tunnel: ma’lumot subdomen nomiga kodlanadi (aGVsbG8.x7f3.evil.uz) — DNS deyarli hamma joyda ruxsat etilgani uchun.",
        "A DNS tunnel encodes data in the subdomain (aGVsbG8.x7f3.evil.uz) — because DNS is allowed nearly everywhere.",
      ),
      t(
        "ARP spoofing: bitta IP (masalan, shlyuz) uchun ikki xil MAC javob beradi — kimdir trafikni o‘zi orqali o‘tkazmoqchi.",
        "ARP spoofing: two different MACs answer for one IP (the gateway, say) — someone wants the traffic to pass through them.",
      ),
    ],
    task: t("Har bir kuzatuvni ajrating.", "Sort each observation."),
    hint: t(
      "Hajm, vaqt, takrorlanish va “bitta manba — ko‘p maqsad” belgilariga qarang.",
      "Look at volume, time of day, repetition and “one source, many targets”.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "normal", label: t("Odatiy", "Normal") },
        { id: "suspicious", label: t("Shubhali", "Suspicious") },
      ],
      items: [
        {
          label: t(
            "Bitta xost 10 soniyada 1000 ta portga SYN yubordi",
            "One host sent SYNs to 1000 ports in 10 seconds",
          ),
          bucket: "suspicious",
        },
        {
          label: t(
            "Soatiga minglab aGVsbG8.x7f3.evil.uz kabi DNS so‘rovlari",
            "Thousands of DNS queries an hour like aGVsbG8.x7f3.evil.uz",
          ),
          bucket: "suspicious",
        },
        {
          label: t(
            "Shlyuz 10.0.0.1 uchun ARP’ga ikki xil MAC javob beradi",
            "Two different MACs answer ARP for the gateway 10.0.0.1",
          ),
          bucket: "suspicious",
        },
        {
          label: t(
            "Server soat 03:00 da noma’lum IP’ga 4 GB yukladi",
            "A server uploaded 4 GB to an unknown IP at 03:00",
          ),
          bucket: "suspicious",
        },
        {
          label: t(
            "Telefon Wi-Fi’ga ulanganda DHCP so‘rovi",
            "A DHCP request when a phone joins the Wi-Fi",
          ),
          bucket: "normal",
        },
        {
          label: t(
            "Ish kunida brauzer ko‘p saytlarga TLS ulanishlar ochadi",
            "A browser opens TLS connections to many sites on a workday",
          ),
          bucket: "normal",
        },
      ],
    },
  },
  {
    id: 6,
    group: HUNTING,
    title: t("Beacon: zararli dastur qo‘ng‘irog‘i", "Beaconing malware"),
    minutes: 10,
    intro: t(
      "Zararlangan kompyuter boshqaruv serveriga (C2) muntazam “men shu yerdaman, buyruq bormi?” deb murojaat qiladi. Odam brauzerda tartibsiz bosadi; zararli dastur esa metronom kabi — har 60 soniyada, deyarli bir xil oraliqda.",
      "An infected computer checks in with its command-and-control (C2) server regularly: “I’m here, any orders?”. A person in a browser clicks at random; malware ticks like a metronome — every 60 seconds, at nearly the same interval.",
    ),
    analogy: t(
      "Har kuni aynan 20:00 da bir xil raqamga 10 soniyalik qo‘ng‘iroq — mazmunini bilmasangiz ham, odatdan tashqari.",
      "A ten-second call to the same number at exactly 8 pm every day — odd even if you never hear what is said.",
    ),
    theory: [
      t(
        "Oraliqlarning tarqoqligi (jitter) kichik bo‘lsa — avtomat. Ayyor zararli dasturlar tasodifiy kechikish qo‘shadi, shuning uchun uzoq vaqt kuzatiladi.",
        "Small spread in the gaps (jitter) means a machine. Cleverer malware adds random delay, so analysts watch over longer periods.",
      ),
      t(
        "Yangilanish xizmatlari ham muntazam bo‘lishi mumkin — manzilni tekshiring: ma’lum vendor-mi yoki hech kim tanimaydigan IP-mi?",
        "Update services can be regular too — check the destination: a known vendor, or an IP nobody recognises?",
      ),
    ],
    task: t(
      "O‘n daqiqalik yozuvdan qaysi xost beacon yuborayotganini toping va uni izolyatsiya qiling.",
      "Find the host that is beaconing in this ten-minute capture and isolate it.",
    ),
    hint: t(
      "Nuqtalari teng oraliqda joylashgan qatorni qidiring.",
      "Look for the row whose dots are evenly spaced.",
    ),
    widget: { type: "beacon" },
  },
  {
    id: 7,
    group: HUNTING,
    title: t("Qayerda va qanday yozish", "Where and how to capture"),
    minutes: 6,
    intro: t(
      "Kommutator har bir portga faqat o‘sha portning trafigini yuboradi. Butun segmentni ko‘rish uchun SPAN (port mirroring) yoki alohida qurilma — TAP kerak. To‘liq pcap juda ko‘p joy egallaydi, shuning uchun ko‘pincha faqat NetFlow (kim, kimga, qancha) yoziladi.",
      "A switch sends each port only that port’s traffic. To see a whole segment you need SPAN (port mirroring) or a separate device, a TAP. Full pcap takes a lot of space, so often only NetFlow (who, to whom, how much) is kept.",
    ),
    analogy: t(
      "To‘liq pcap — suhbatning audio yozuvi; NetFlow — faqat qo‘ng‘iroqlar ro‘yxati.",
      "Full pcap is a recording of the conversation; NetFlow is just the call log.",
    ),
    theory: [
      t(
        "Boshqalarning trafigini faqat ruxsat bilan yozing: unda parollar va shaxsiy ma’lumotlar bo‘ladi. pcap fayllarni maxfiy hujjat kabi saqlang.",
        "Capture other people’s traffic only with permission: it holds passwords and personal data. Keep pcap files like confidential documents.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "SPAN — kommutator sozlamasi; TAP — kabelga qo‘yiladigan qurilma.",
      "SPAN is a switch setting; a TAP is a device on the cable.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Kommutatorga ulangan noutbukda Wireshark faqat o‘z trafigini ko‘rsatyapti. Nega?",
            "Wireshark on a laptop plugged into a switch shows only its own traffic. Why?",
          ),
          options: [
            t(
              "Kommutator har bir portga faqat unga tegishli trafikni yuboradi",
              "The switch sends each port only the traffic meant for it",
            ),
            t("Wireshark buzilgan", "Wireshark is broken"),
            t("Boshqa kompyuterlar o‘chiq", "The other computers are off"),
          ],
          answer: 0,
          explain: t(
            "Butun segment uchun SPAN yoki TAP kerak.",
            "For the whole segment you need SPAN or a TAP.",
          ),
        },
        {
          ask: t(
            "Oyiga terabaytlab trafikli tarmoqda nimani uzoq muddat saqlash maqsadga muvofiq?",
            "On a network moving terabytes a month, what is sensible to keep for a long time?",
          ),
          options: [
            t(
              "NetFlow yozuvlari (kim, kimga, qancha), to‘liq pcap esa qisqa muddat",
              "NetFlow records (who, to whom, how much), with full pcap for a short time",
            ),
            t("Hamma narsani abadiy pcap’da", "Everything in pcap forever"),
            t("Hech narsani", "Nothing"),
          ],
          answer: 0,
          explain: t(
            "Oqim yozuvlari kichik va beacon yoki eksfiltratsiyani topishga yetarli.",
            "Flow records are small and enough to spot beacons or exfiltration.",
          ),
        },
        {
          ask: t(
            "Kafedagi Wi-Fi’da boshqalarning trafigini yozish mumkinmi?",
            "May you capture other people’s traffic on a café Wi-Fi?",
          ),
          options: [
            t(
              "Yo‘q — faqat o‘z tarmog‘ingizda yoki yozma ruxsat bilan",
              "No — only on your own network or with written permission",
            ),
            t("Ha, ochiq tarmoq bo‘lsa", "Yes, if the network is open"),
            t("Ha, faqat kechasi", "Yes, but only at night"),
          ],
          answer: 0,
          explain: t(
            "Ruxsatsiz tinglash — qonunbuzarlik, hatto tarmoq ochiq bo‘lsa ham.",
            "Listening in without permission is illegal, even on an open network.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: HUNTING,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: paket qatori, filtrlar, TLS sizdiradigan metama’lumot, ochiq parollar, shubhali belgilar va beacon.",
      "A review of the module: a capture line, filters, the metadata TLS leaks, passwords in the clear, warning signs and beacons.",
    ),
    analogy: t(
      "Trafik tahlili — izquvarlik: har bir paket — iz, birgalikda esa voqeani aytib beradi.",
      "Traffic analysis is detective work: each packet is a clue, and together they tell the story.",
    ),
    theory: [
      t(
        "Keyingi modul — firewall va segmentlash: topilgan narsani to‘xtatishni o‘rganamiz.",
        "The next module is firewalls and segmentation: how to stop what you find.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Filtrlarda && — va, || — yoki.",
      "In filters, && means and, || means or.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Qaysi filtr faqat DNS’ni yoki 443-portdagi TCP’ni ko‘rsatadi?",
            "Which filter shows only DNS or TCP on port 443?",
          ),
          options: [
            code("dns || tcp.port == 443"),
            code("dns && tcp.port == 443"),
            code("!dns"),
          ],
          answer: 0,
          explain: t(
            "|| — yoki: ikkalasidan biri bo‘lsa yetarli. && — ikkalasi bir vaqtda.",
            "|| is or: either one is enough. && needs both at once.",
          ),
        },
        {
          ask: t(
            "Authorization: Basic YWxpOjEyMzQ= — bu nima?",
            "Authorization: Basic YWxpOjEyMzQ= — what is it?",
          ),
          options: [
            t(
              "Base64’dagi “ali:1234” — har kim o‘qiy oladi",
              "“ali:1234” in Base64 — anyone can read it",
            ),
            t("AES bilan shifrlangan parol", "A password encrypted with AES"),
            t("Parolning xeshi", "A hash of the password"),
          ],
          answer: 0,
          explain: t(
            "Base64 kalitsiz ortga qaytariladi; Basic’ni faqat HTTPS ichida ishlating.",
            "Base64 reverses without a key; use Basic only inside HTTPS.",
          ),
        },
        {
          ask: t(
            "HTTPS ishlatilganda tarmoqdagi kuzatuvchi nimani ko‘ra oladi?",
            "With HTTPS, what can someone on the network see?",
          ),
          options: [
            t(
              "Qaysi serverga, qachon va qancha hajmda ulanilgani",
              "Which server you reached, when and how much was sent",
            ),
            t("Sahifaning matnini", "The page’s text"),
            t("Cookie’larni", "The cookies"),
          ],
          answer: 0,
          explain: t(
            "Metama’lumot ochiq; mazmun shifrlangan.",
            "Metadata is open; content is encrypted.",
          ),
        },
        {
          ask: t(
            "Xost har 60 soniyada (±1 s) bir xil noma’lum IP’ga ulanadi. Bu nimaga o‘xshaydi?",
            "A host connects to the same unknown IP every 60 seconds (±1 s). What does it look like?",
          ),
          options: [
            t(
              "Zararli dasturning C2 serveriga beacon’i",
              "Malware beaconing to its C2 server",
            ),
            t("Odam veb-sayt ko‘ryapti", "A person browsing the web"),
            t("Tarmoq kabeli uzilgan", "A broken network cable"),
          ],
          answer: 0,
          explain: t(
            "Odam tartibsiz; metronomdek muntazamlik — avtomat belgisi.",
            "People are irregular; metronome regularity points to a program.",
          ),
        },
      ],
    },
  },
];
