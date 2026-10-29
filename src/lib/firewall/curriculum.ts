// Academy Intermediate · Network security, module 3: Firewalls and
// segmentation. The lessons use ./tools.ts: a first-match rule list with a
// default policy, stateless and stateful filtering, and how narrow a rule
// for one flow should be.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "order" } | { type: "stateful" } | { type: "narrow" };

export const PROGRESS_KEY = "cybervalue:firewall:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const RULES = t("Qoidalar", "Rules");
const STATE = t("Holat va aniqlik", "State and precision");
const ZONES = t("Zonalar", "Zones");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: RULES,
    title: t("Bitta qoida qanday o‘qiladi", "How one rule reads"),
    minutes: 6,
    intro: t(
      "Firewall har bir paketga qoidalar ro‘yxati bo‘yicha qaror qiladi: protokol, manba, qabul qiluvchi, port va ulanish holati mos kelsa — qoidadagi amal (ACCEPT yoki DROP) bajariladi. Linux’da bu iptables yoki nftables, bulutda — security group.",
      "A firewall decides about each packet by its rule list: if the protocol, source, destination, port and connection state match, the rule’s action (ACCEPT or DROP) applies. On Linux that is iptables or nftables; in the cloud, a security group.",
    ),
    analogy: t(
      "Bino qorovuli ro‘yxati: “ofis xodimlari, 9:00–18:00, faqat 3-qavatga — kiritilsin”.",
      "A building guard’s list: “office staff, 9 to 6, third floor only — let in”.",
    ),
    theory: [
      t(
        "INPUT — serverning o‘ziga kelayotgan, OUTPUT — undan chiqayotgan, FORWARD — u orqali boshqa tarmoqqa o‘tayotgan paketlar.",
        "INPUT is traffic to the machine itself, OUTPUT traffic leaving it, FORWARD traffic passing through it to another network.",
      ),
      t(
        "DROP javob bermaydi (skaner “filtered” ko‘radi); REJECT esa rad javobini yuboradi.",
        "DROP sends nothing back (a scanner sees “filtered”); REJECT sends a refusal.",
      ),
    ],
    task: t(
      "Qoidaning har bir qismini bosib, nima ekanini o‘qing.",
      "Click each part of the rule and read what it is.",
    ),
    hint: t("Hammasi bo‘lib oltita qism.", "Six parts in all."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "iptables " },
          { text: "-A INPUT", id: "chain" },
          { text: " " },
          { text: "-p tcp", id: "proto" },
          { text: " " },
          { text: "-s 10.0.0.50", id: "src" },
        ],
        [
          { text: "  " },
          { text: "--dport 22", id: "port" },
          { text: " " },
          { text: "-m conntrack --ctstate NEW", id: "state" },
          { text: " " },
          { text: "-j ACCEPT", id: "action" },
        ],
      ],
      parts: [
        {
          id: "chain",
          title: t("Zanjir: INPUT", "Chain: INPUT"),
          body: t(
            "Qoida serverning o‘ziga kelayotgan paketlarga tegishli. -A — ro‘yxat oxiriga qo‘shish.",
            "The rule is about packets coming to this machine. -A appends it to the end of the list.",
          ),
        },
        {
          id: "proto",
          title: t("Protokol", "Protocol"),
          body: t(
            "Faqat TCP. UDP yoki ICMP bu qoidaga mos kelmaydi.",
            "TCP only. UDP or ICMP don’t match this rule.",
          ),
        },
        {
          id: "src",
          title: t("Manba manzil", "Source address"),
          body: t(
            "Faqat admin kompyuteri. -s yozilmasa — istalgan manzil, bu SSH uchun xavfli.",
            "The admin’s computer only. Without -s it means any address, which is dangerous for SSH.",
          ),
        },
        {
          id: "port",
          title: t("Qabul qiluvchi port", "Destination port"),
          body: t(
            "22 — SSH. Har bir ochiq port — hujum uchun eshik, shuning uchun faqat keraklilari.",
            "22 is SSH. Every open port is a door for attackers, so only the ones needed.",
          ),
        },
        {
          id: "state",
          title: t("Ulanish holati", "Connection state"),
          body: t(
            "NEW — yangi ulanish. Javoblar odatda yuqoridagi ESTABLISHED,RELATED qoidasi bilan o‘tadi.",
            "NEW means a new connection. Replies usually pass by an ESTABLISHED,RELATED rule higher up.",
          ),
        },
        {
          id: "action",
          title: t("Amal", "Action"),
          body: t(
            "ACCEPT — o‘tkazish. Boshqa variantlar: DROP (jim tashlash), REJECT (rad etish), LOG (yozib qo‘yish).",
            "ACCEPT lets it through. Others: DROP (discard silently), REJECT (refuse), LOG (write it down).",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: RULES,
    title: t("Tartib va standart siyosat", "Order and the default policy"),
    minutes: 12,
    intro: t(
      "Qoidalar yuqoridan pastga tekshiriladi va birinchi mos kelgani qaror qiladi. Keng qoida tepada tursa, pastdagi aniq qoidalar hech qachon ishlamaydi. Hech biri mos kelmasa — standart siyosat: xavfsizi “deny” (ruxsat etilmagan hamma narsa taqiqlangan).",
      "Rules are checked from the top and the first match decides. A broad rule at the top means the specific ones below it never fire. When nothing matches, the default policy applies: the safe one is “deny” (whatever is not allowed is forbidden).",
    ),
    analogy: t(
      "Qorovul ro‘yxatni boshidan o‘qiydi: birinchi qatorda “barcha xodimlar kirsin” desa, keyingi “3-qavatga faqat adminlar” qatoriga hech qachon yetib bormaydi.",
      "The guard reads the list from the top: if the first line says “all staff may enter”, he never reaches “third floor: admins only”.",
    ),
    theory: [
      t(
        "Qoida: aniqroq qoidalar — tepada, kengroqlari — pastda, oxirida esa “deny all”.",
        "The rule of thumb: specific rules on top, broad ones below, and “deny all” at the end.",
      ),
      t(
        "Standart “allow” — ro‘yxatda unutilgan har bir xizmat ochiq qoladi degani.",
        "A default of “allow” means every service someone forgot to list stays open.",
      ),
    ],
    task: t(
      "Qoidalarni tartiblang va standart siyosatni tanlang: barcha sakkiz holat kutilgandek bo‘lsin.",
      "Reorder the rules and pick the default policy so that all eight cases come out as expected.",
    ),
    hint: t(
      "D (admin SSH) → E (boshqalarga SSH taqiq) → F (LAN’dan DMZ’ga), oxirida — deny.",
      "D (admin SSH) → E (no SSH for others) → F (LAN to DMZ), and deny at the end.",
    ),
    widget: { type: "order" },
  },
  {
    id: 3,
    group: STATE,
    title: t("Holatli filtrlash", "Stateful filtering"),
    minutes: 10,
    intro: t(
      "Ofis kompyuteri bank.uz ga ulanadi — javob tashqaridan ichkariga keladi. Holatsiz (stateless) firewall har bir paketni alohida ko‘radi, shuning uchun javobni o‘tkazish uchun “443-portdan kelgan hamma narsani kirit” degan qoida kerak bo‘ladi. Hujumchi manba portini 443 qilib qo‘ysa, u ham o‘tadi. Holatli (stateful) firewall ulanishlarni eslab qoladi va faqat haqiqiy javoblarni kiritadi.",
      "An office PC connects to bank.uz — the reply comes from outside in. A stateless firewall looks at each packet alone, so letting replies in takes a rule like “allow anything from source port 443”. An attacker who sets their source port to 443 gets in too. A stateful firewall remembers connections and lets in only real replies.",
    ),
    analogy: t(
      "Qorovul: “ichkaridan kimdir chaqirgan kuryerni kiritaman” — u buyurtmalar daftarini yuritadi. Daftarsiz u “qo‘lida posilka bor hammani kiritaman” deyishga majbur.",
      "A guard who lets in “the courier someone inside ordered” keeps a book of orders. Without the book he has to let in “anyone carrying a parcel”.",
    ),
    theory: [
      t(
        "Conntrack har bir ulanish uchun manzil, port va holatni (NEW, ESTABLISHED, RELATED) saqlaydi.",
        "Conntrack keeps the addresses, ports and state (NEW, ESTABLISHED, RELATED) of each connection.",
      ),
    ],
    task: t(
      "Firewall’ni shunday sozlangki, javob o‘tsin, so‘ralmagan ikki paket esa to‘xtasin.",
      "Set the firewall so the reply gets in and both unasked-for packets are stopped.",
    ),
    hint: t(
      "Holatni kuzatishni yoqing va 443-port “aylanma yo‘li”ni o‘chiring.",
      "Turn on connection tracking and turn off the source-port-443 workaround.",
    ),
    widget: { type: "stateful" },
  },
  {
    id: 4,
    group: STATE,
    title: t("Eng kam imtiyoz", "Least privilege"),
    minutes: 10,
    intro: t(
      "Veb-server bazaga 5432-port orqali ulanishi kerak. “any → any” qoidasi ham bu ishni bajaradi — lekin u boshqa yuzlab ulanishlarni ham ochadi. Har bir qoida aynan kerakli manba, qabul qiluvchi va portni ko‘rsatishi kerak.",
      "The web server needs to reach the database on port 5432. An “any → any” rule does the job too — but it opens hundreds of other paths as well. Each rule should name exactly the source, destination and port it is for.",
    ),
    analogy: t(
      "Kuryerga butun binoning kalitini emas, faqat pochta qutisining kalitini berasiz.",
      "You give the courier the key to the mailbox, not the master key to the building.",
    ),
    theory: [
      t(
        "Keng qoida buzilgan serverdan hujumchi uchun yo‘l: veb-server egallansa, u faqat bazaning 5432-portiga yeta olishi kerak.",
        "A broad rule is a road for the attacker from a hacked server: if the web server falls, it should reach only the database on 5432.",
      ),
    ],
    task: t(
      "Qoidani shunday toraytiringki, kerakli ulanish o‘tsin, ortiqchasi esa bo‘lmasin.",
      "Narrow the rule until the needed flow passes and nothing else does.",
    ),
    hint: t(
      "Manba — faqat veb-server, qabul qiluvchi — faqat baza, port — 5432.",
      "Source: the web server only; destination: the database only; port 5432.",
    ),
    widget: { type: "narrow" },
  },
  {
    id: 5,
    group: ZONES,
    title: t("Tarmoqni zonalarga bo‘lish", "Splitting the network into zones"),
    minutes: 8,
    intro: t(
      "Segmentlash — tarmoqni zonalarga bo‘lish va ular orasidagi trafikni firewall orqali o‘tkazish. Internetga ochiq xizmatlar DMZ’da, muhim ma’lumotlar ichki server zonasida, xodimlar kompyuterlari ofis LAN’ida, mehmonlar esa alohida Wi-Fi’da turadi.",
      "Segmentation splits a network into zones and passes traffic between them through a firewall. Services open to the internet live in the DMZ, important data in an internal server zone, staff computers in the office LAN, and guests on a Wi-Fi of their own.",
    ),
    analogy: t(
      "Kemadagi suv o‘tkazmaydigan bo‘limlar: bittasi teshilsa, butun kema cho‘kmaydi.",
      "A ship’s watertight compartments: one is holed, the ship stays afloat.",
    ),
    theory: [
      t(
        "VLAN bitta kommutatorda bir nechta mantiqiy tarmoq yaratadi; ular orasidagi trafik router yoki firewall orqali o‘tishi kerak.",
        "VLANs make several logical networks on one switch; traffic between them has to go through a router or firewall.",
      ),
      t(
        "Tekis (flat) tarmoqda bitta zararlangan noutbuk hamma narsaga yeta oladi — ransomware aynan shunday tarqaladi.",
        "On a flat network one infected laptop reaches everything — that is how ransomware spreads.",
      ),
    ],
    task: t(
      "Har bir qurilma qaysi zonaga tegishli?",
      "Which zone does each device belong in?",
    ),
    hint: t(
      "Internetdan ko‘rinadigani — DMZ; ma’lumot saqlaydigani — ichki serverlar.",
      "Whatever the internet must reach goes in the DMZ; whatever holds data goes with the internal servers.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "dmz", label: t("DMZ", "DMZ") },
        { id: "servers", label: t("Ichki serverlar", "Internal servers") },
        { id: "lan", label: t("Ofis LAN", "Office LAN") },
        { id: "guest", label: t("Mehmon Wi-Fi", "Guest Wi-Fi") },
      ],
      items: [
        {
          label: t(
            "Kompaniyaning ochiq veb-sayti",
            "The company’s public website",
          ),
          bucket: "dmz",
        },
        {
          label: t("Kiruvchi pochta serveri", "The inbound mail server"),
          bucket: "dmz",
        },
        {
          label: t(
            "Mijozlar bazasi (PostgreSQL)",
            "The customer database (PostgreSQL)",
          ),
          bucket: "servers",
        },
        {
          label: t("Buxgalteriya fayl serveri", "The accounting file server"),
          bucket: "servers",
        },
        {
          label: t("Xodimlarning noutbuklari", "Staff laptops"),
          bucket: "lan",
        },
        {
          label: t(
            "Mijozlarning qabulxonadagi telefonlari",
            "Visitors’ phones in the lobby",
          ),
          bucket: "guest",
        },
      ],
    },
  },
  {
    id: 6,
    group: ZONES,
    title: t("Chiquvchi trafik va VLAN", "Outbound traffic and VLANs"),
    minutes: 6,
    intro: t(
      "Ko‘pchilik faqat kiruvchi trafikni filtrlaydi. Lekin chiquvchi (egress) filtrlash ham muhim: serverning internetga chiqishi kerak emas bo‘lsa, buzilganda ham u C2 serverga ulana olmaydi va ma’lumotni olib chiqa olmaydi.",
      "Most people filter only inbound traffic. Outbound (egress) filtering matters too: a server that has no need to reach the internet can’t call a C2 server or carry data out even once it is hacked.",
    ),
    analogy: t(
      "Omborning chiqish eshigida ham qorovul: kirish nazorat qilinadi, lekin qutilar ham tekshiriladi.",
      "A guard at the warehouse’s exit too: not just who comes in, but which boxes go out.",
    ),
    theory: [
      t(
        "Serverlarga faqat kerakli manzillar: yangilanish omborlari, ichki DNS. Qolgani — deny va log.",
        "Servers get only the destinations they need: update mirrors, internal DNS. Everything else: deny and log.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Egress — chiqish; VLAN — mantiqiy bo‘lim, firewall emas.",
      "Egress means outbound; a VLAN is a logical partition, not a firewall.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Veb-server buzildi va zararli dastur C2 serverga ulanmoqchi. Nima to‘xtatadi?",
            "The web server was hacked and its malware tries to reach a C2 server. What stops it?",
          ),
          options: [
            t(
              "Serverdan internetga chiquvchi trafikni taqiqlovchi egress qoidasi",
              "An egress rule that blocks the server’s outbound traffic to the internet",
            ),
            t("Kuchli admin paroli", "A strong admin password"),
            t("443-portni ochiq qoldirish", "Leaving port 443 open"),
          ],
          answer: 0,
          explain: t(
            "Egress filtrlash buzilishning oqibatini cheklaydi.",
            "Egress filtering limits what a break-in can do.",
          ),
        },
        {
          ask: t(
            "Ofis va mehmon Wi-Fi turli VLAN’larda. Ular orasidagi trafikni nima nazorat qilishi kerak?",
            "The office and guest Wi-Fi are on different VLANs. What should control traffic between them?",
          ),
          options: [
            t(
              "Firewall yoki router ACL — va standart bo‘yicha deny",
              "A firewall or router ACL — denying by default",
            ),
            t(
              "Hech narsa, VLAN’ning o‘zi yetarli",
              "Nothing, the VLAN alone is enough",
            ),
            t("Wi-Fi paroli", "The Wi-Fi password"),
          ],
          answer: 0,
          explain: t(
            "VLAN ajratadi, lekin ular orasidagi marshrutlash qoidalar bilan cheklanishi kerak.",
            "VLANs separate, but routing between them has to be limited by rules.",
          ),
        },
        {
          ask: t(
            "Nega taqiqlangan ulanishlarni log qilish foydali?",
            "Why is it useful to log denied connections?",
          ),
          options: [
            t(
              "Skanerlash va buzilgan xostlarning urinishlari ko‘rinadi",
              "Scans and the attempts of hacked hosts become visible",
            ),
            t("Tarmoq tezlashadi", "The network gets faster"),
            t("Firewall qoidalari o‘zi yoziladi", "The rules write themselves"),
          ],
          answer: 0,
          explain: t(
            "Deny loglari IDS uchun ham manba bo‘ladi (5-modul).",
            "Deny logs are also a source for intrusion detection (module 5).",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: ZONES,
    title: t("Yaxshi amaliyot va xatolar", "Good practice and mistakes"),
    minutes: 6,
    intro: t(
      "Firewall qoidalari vaqt o‘tishi bilan ko‘payadi: “vaqtincha” ochilgan portlar yillab ochiq qoladi. Muntazam ko‘rib chiqish, har bir qoidaga izoh va egasi, o‘zgarishlarni kuzatish — bularsiz eng yaxshi firewall ham teshik bo‘ladi.",
      "Firewall rules pile up over time: ports opened “temporarily” stay open for years. Regular reviews, a comment and an owner on every rule, and tracked changes — without them even the best firewall springs leaks.",
    ),
    analogy: t(
      "Eski kalitlar to‘plami: kim qaysi eshikni ochishini hech kim eslamaydi.",
      "An old bunch of keys: nobody remembers which door each one opens.",
    ),
    theory: [
      t(
        "Boshqaruv portlari (SSH 22, RDP 3389, ma’lumotlar bazasi portlari) internetga ochilmaydi — VPN yoki bastion host orqali.",
        "Management ports (SSH 22, RDP 3389, database ports) are never open to the internet — use a VPN or a bastion host.",
      ),
    ],
    task: t(
      "Har birini ajrating: yaxshi amaliyot yoki xato?",
      "Sort each one: good practice or a mistake?",
    ),
    hint: t(
      "“any” va “vaqtincha” so‘zlari — ogohlantirish belgisi.",
      "The words “any” and “temporary” are warning signs.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "good", label: t("Yaxshi amaliyot", "Good practice") },
        { id: "bad", label: t("Xato", "Mistake") },
      ],
      items: [
        {
          label: t(
            "Oxirgi qoida: deny all, log bilan",
            "The last rule: deny all, with logging",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Har bir qoidada izoh va mas’ul shaxs",
            "A comment and an owner on every rule",
          ),
          bucket: "good",
        },
        {
          label: t(
            "Har chorakda keraksiz qoidalarni olib tashlash",
            "Removing unused rules every quarter",
          ),
          bucket: "good",
        },
        {
          label: t(
            "RDP 3389 internetga “vaqtincha” ochilgan",
            "RDP 3389 opened to the internet “temporarily”",
          ),
          bucket: "bad",
        },
        {
          label: t(
            "Muammo bo‘lsa, “allow any any” qo‘shib qo‘yish",
            "Adding “allow any any” when something breaks",
          ),
          bucket: "bad",
        },
        {
          label: t(
            "Barcha serverlar va noutbuklar bitta tekis tarmoqda",
            "Every server and laptop on one flat network",
          ),
          bucket: "bad",
        },
      ],
    },
  },
  {
    id: 8,
    group: ZONES,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: qoida tuzilishi, birinchi moslik va standart siyosat, holatli filtrlash, eng kam imtiyoz, zonalar va egress.",
      "A review of the module: rule anatomy, first match and the default policy, stateful filtering, least privilege, zones and egress.",
    ),
    analogy: t(
      "Yaxshi firewall — yaxshi qorovul: aniq ro‘yxat, daftar va har bir eshikda o‘z kaliti.",
      "A good firewall is a good guard: a precise list, a log book, and the right key for each door.",
    ),
    theory: [
      t(
        "Keyingi modul — xavfsiz ulanishlar: VPN, SSH va Wi-Fi xavfsizligi.",
        "The next module is secure connections: VPNs, SSH and Wi-Fi security.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Birinchi mos kelgan qoida qaror qiladi.",
      "The first matching rule decides.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "1: ALLOW lan → any any; 2: DENY lan → db tcp/5432. Ofis PC bazaga ulanadimi?",
            "1: ALLOW lan → any any; 2: DENY lan → db tcp/5432. Does an office PC reach the database?",
          ),
          options: [
            t("Ha — 1-qoida birinchi mos keladi", "Yes — rule 1 matches first"),
            t("Yo‘q — 2-qoida aniqroq", "No — rule 2 is more specific"),
            t("Faqat kechasi", "Only at night"),
          ],
          answer: 0,
          explain: t(
            "Aniqlik emas, tartib qaror qiladi: DENY’ni tepaga ko‘tarish kerak.",
            "Order decides, not precision: the DENY has to move up.",
          ),
        },
        {
          ask: t(
            "Qaysi standart siyosat xavfsizroq?",
            "Which default policy is safer?",
          ),
          options: [
            t(
              "Deny — ruxsat etilmagan hamma narsa taqiqlangan",
              "Deny — whatever is not allowed is forbidden",
            ),
            t(
              "Allow — taqiqlanmagan hamma narsa ruxsat",
              "Allow — whatever is not forbidden is allowed",
            ),
            t("Farqi yo‘q", "No difference"),
          ],
          answer: 0,
          explain: t(
            "Unutilgan xizmat yopiq qoladi.",
            "A forgotten service stays closed.",
          ),
        },
        {
          ask: t(
            "Holatli firewall’ning holatsizdan afzalligi?",
            "What does a stateful firewall do better than a stateless one?",
          ),
          options: [
            t(
              "Faqat ichkaridan ochilgan ulanishlarga javoblarni kiritadi",
              "It lets in only replies to connections opened from inside",
            ),
            t("Paketlarni shifrlaydi", "It encrypts packets"),
            t("Portlarni yashiradi", "It hides the ports"),
          ],
          answer: 0,
          explain: t(
            "Manba portini soxtalashtirish unga yordam bermaydi.",
            "A faked source port doesn’t fool it.",
          ),
        },
        {
          ask: t(
            "Ochiq veb-saytni qayerga qo‘yish to‘g‘ri?",
            "Where does a public website belong?",
          ),
          options: [
            t(
              "DMZ’ga, bazaga faqat bitta port orqali",
              "In the DMZ, reaching the database on one port only",
            ),
            t("Ofis LAN’iga", "In the office LAN"),
            t(
              "Baza bilan bitta serverga, internetga ochiq",
              "On the database server, open to the internet",
            ),
          ],
          answer: 0,
          explain: t(
            "Sayt buzilsa ham, hujumchi faqat DMZ’da qoladi.",
            "If the site falls, the attacker is still stuck in the DMZ.",
          ),
        },
      ],
    },
  },
];
