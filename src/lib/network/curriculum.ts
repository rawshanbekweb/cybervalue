// Lessons of the IP addressing lab. Each lesson pairs a short explanation with
// one interactive widget; the widget decides when its task is solved.
import type { Text } from "./ip";
import type { PcConfig } from "./sim";
import type { DhcpConfig } from "./dhcp";

export type Widget =
  | { type: "bits"; target: string }
  | { type: "mask"; ip: string; hosts: number }
  | {
      type: "range";
      cidr: string;
      // Expected answers, checked as typed addresses and a number.
      network: string;
      broadcast: string;
      hosts: number;
    }
  | { type: "compare"; pc: string; prefix: number; devices: string[] }
  | { type: "network"; start: PcConfig }
  | { type: "classify"; addresses: string[] }
  | {
      type: "ipconfig";
      output: string;
      options: Text[];
      answer: number;
    }
  | { type: "dhcp"; start: DhcpConfig }
  // Names whose addresses the student must look up and type.
  | { type: "dns"; ask: string[] }
  | { type: "nat"; options: Text[]; answer: number }
  | {
      type: "subnetting";
      base: string;
      departments: number;
      hosts: number;
      // Which department's network address the student must give.
      ask: number;
    }
  | { type: "traceroute" }
  | { type: "ports" }
  | { type: "ipv6"; address: string }
  | {
      type: "pageload";
      questions: { ask: Text; options: Text[]; answer: number }[];
    }
  | { type: "http" };

export type Lesson = {
  id: number;
  group: Text;
  title: Text;
  minutes: number;
  intro: Text;
  // Everyday picture that the rest of the lesson builds on.
  analogy: Text;
  theory: Text[];
  task: Text;
  hint: Text;
  widget: Widget;
};

const BASICS = { uz: "Manzil va mask", en: "Address and mask" };
const NETWORKS = { uz: "Tarmoq ichida", en: "Inside a network" };
const PRACTICE = { uz: "Amaliyot", en: "In practice" };
const ORIGINS = { uz: "IP qayerdan keladi", en: "Where addresses come from" };
const DEEPER = { uz: "Chuqurroq", en: "Going deeper" };
const WEB = { uz: "Veb qanday ishlaydi", en: "How the web works" };

export const LESSONS: Lesson[] = [
  {
    id: 1,
    group: BASICS,
    title: {
      uz: "IP manzil — qurilmaning manzili",
      en: "An IP address is a device’s address",
    },
    minutes: 6,
    intro: {
      uz: "Tarmoqdagi har bir qurilma — kompyuter, telefon, printer — o‘z IP manziliga ega. Paketlar shu manzil bo‘yicha yetkaziladi.",
      en: "Every device on a network — a computer, a phone, a printer — has its own IP address. Packets are delivered by that address.",
    },
    analogy: {
      uz: "IP manzil — xatdagi manzil kabi: pochtachi xatni ism bo‘yicha emas, manzil bo‘yicha olib boradi.",
      en: "An IP address works like the address on a letter: the postman delivers by address, not by name.",
    },
    theory: [
      {
        uz: "IPv4 manzil 4 ta sondan iborat: 192.168.1.10. Har bir son — oktet — 0 dan 255 gacha bo‘ladi.",
        en: "An IPv4 address is four numbers: 192.168.1.10. Each number, an octet, ranges from 0 to 255.",
      },
      {
        uz: "Nega 255? Kompyuter har bir oktetni 8 ta bit (0 yoki 1) bilan yozadi. Bitlarning “og‘irligi” 128, 64, 32, 16, 8, 4, 2, 1. Hammasi yoqilsa 255 chiqadi.",
        en: "Why 255? The computer stores each octet as 8 bits (0 or 1) weighted 128, 64, 32, 16, 8, 4, 2, 1. With all of them on you get 255.",
      },
      {
        uz: "Demak butun manzil 32 bit. Masalan 192 = 128 + 64 → 11000000.",
        en: "So a whole address is 32 bits. For example 192 = 128 + 64 → 11000000.",
      },
    ],
    task: {
      uz: "Bitlarni bosib maqsad manzilni yig‘ing. Keyin “Yangi misol” bilan yana mashq qiling.",
      en: "Click the bits to build the target address. Then practise more with “New example”.",
    },
    hint: {
      uz: "Har oktetni eng katta og‘irlikdan boshlab yig‘ing: 168 dan 128 ni oling (40 qoldi), 32 ni (8 qoldi), 8 ni — 168 = 128 + 32 + 8.",
      en: "Build each octet from the biggest weight down: take 128 from 168 (40 left), then 32 (8 left), then 8: 168 = 128 + 32 + 8.",
    },
    widget: { type: "bits", target: "192.168.1.10" },
  },
  {
    id: 2,
    group: BASICS,
    title: {
      uz: "Subnet mask: ko‘cha va uy raqami",
      en: "Subnet mask: street and house number",
    },
    minutes: 8,
    intro: {
      uz: "IP manzilning bir qismi tarmoqni (ko‘chani), qolgani shu tarmoqdagi qurilmani (uyni) bildiradi. Chegarani subnet mask belgilaydi.",
      en: "Part of an IP address names the network (the street) and the rest names the device on it (the house). The subnet mask draws the line.",
    },
    analogy: {
      uz: "“Navoiy ko‘chasi, 10-uy”: ko‘cha hamma qo‘shnilarda bir xil, uy raqami har birida boshqa. Mask qaysi qism ko‘cha ekanini aytadi.",
      en: "“10 Navoi Street”: the street is the same for all neighbours, the house number differs. The mask says which part is the street.",
    },
    theory: [
      {
        uz: "Mask ham 32 bit: chapda birlar (tarmoq qismi), o‘ngda nollar (host qismi). 255.255.255.0 = 24 ta bir, shuning uchun qisqacha /24 deb yoziladi (CIDR).",
        en: "A mask is 32 bits too: ones on the left (network part), zeros on the right (host part). 255.255.255.0 is 24 ones, written /24 for short (CIDR).",
      },
      {
        uz: "Host bitlari qancha ko‘p bo‘lsa, tarmoqqa shuncha ko‘p qurilma sig‘adi: 2^(host bitlari) − 2. Ikkitasi band: birinchisi tarmoq manzili, oxirgisi broadcast.",
        en: "The more host bits, the more devices fit: 2^(host bits) − 2. Two are reserved: the first is the network address, the last the broadcast.",
      },
      {
        uz: "/24 → 254 host, /25 → 126, /26 → 62, /27 → 30, /28 → 14. Har bir qo‘shimcha bit tarmoqni ikki baravar kichraytiradi.",
        en: "/24 → 254 hosts, /25 → 126, /26 → 62, /27 → 30, /28 → 14. Each extra bit halves the network.",
      },
    ],
    task: {
      uz: "Xonadagi qurilmalarning hammasi sig‘adigan eng kichik tarmoqni tanlang (qurilmalar soni yuqorida).",
      en: "Pick the smallest network that fits every device in the room (the count is shown above).",
    },
    hint: {
      uz: "Sig‘magan joydan boshlab bittadan chapga suring: har qadam joyni ikki baravar oshiradi. Birinchi yetarli bo‘lgani — javob.",
      en: "Start where it does not fit and move left one bit at a time; each step doubles the room. The first one that fits is the answer.",
    },
    widget: { type: "mask", ip: "192.168.1.10", hosts: 40 },
  },
  {
    id: 3,
    group: BASICS,
    title: {
      uz: "Tarmoq manzili, broadcast va hostlar",
      en: "Network address, broadcast and hosts",
    },
    minutes: 8,
    intro: {
      uz: "Har bir tarmoq — manzillarning bir bloki. Blokning boshi va oxiri maxsus, o‘rtadagilar qurilmalarga beriladi.",
      en: "Each network is a block of addresses. The first and last are special; the ones between go to devices.",
    },
    analogy: {
      uz: "Ko‘p qavatli uy: birinchi raqam — uyning o‘zi (tarmoq manzili), oxirgisi — umumiy e’lonlar taxtasi (broadcast), qolganlari — xonadonlar.",
      en: "An apartment block: the first number is the building itself (network address), the last is the shared notice board (broadcast), the rest are flats.",
    },
    theory: [
      {
        uz: "Tarmoq manzili: host bitlari hammasi 0. Broadcast: host bitlari hammasi 1 — unga yuborilgan paketni tarmoqdagi hamma oladi.",
        en: "Network address: all host bits 0. Broadcast: all host bits 1; a packet sent there reaches everyone on the network.",
      },
      {
        uz: "Tez hisoblash: blok hajmi = 256 − maskning oxirgi “to‘liq bo‘lmagan” okteti. /25 da 256 − 128 = 128, ya’ni bloklar 0, 128 dan boshlanadi.",
        en: "Quick method: block size = 256 − the mask’s last partial octet. For /25 that is 256 − 128 = 128, so blocks start at 0 and 128.",
      },
      {
        uz: "Masalan 192.168.1.77/26: blok 64 talik, 77 esa 64–127 blokida. Tarmoq .64, broadcast .127, hostlar .65 dan .126 gacha.",
        en: "For example 192.168.1.77/26: blocks of 64, and 77 lies in 64–127. Network .64, broadcast .127, hosts .65 to .126.",
      },
    ],
    task: {
      uz: "Ko‘rsatilgan manzil uchun tarmoq manzilini, broadcast manzilini va hostlar sonini toping.",
      en: "For the address shown, find the network address, the broadcast address and the number of hosts.",
    },
    hint: {
      uz: "Blok hajmi = 2^(32 − prefiks). Manzilni shu hajmga bo‘lib, butun qismini hajmga ko‘paytiring — bu tarmoq manzili. Broadcast = tarmoq + hajm − 1.",
      en: "Block size = 2^(32 − prefix). Divide the address by it, keep the whole part and multiply back: that is the network. Broadcast = network + size − 1.",
    },
    widget: {
      type: "range",
      cidr: "172.16.5.130/25",
      network: "172.16.5.128",
      broadcast: "172.16.5.255",
      hosts: 126,
    },
  },
  {
    id: 4,
    group: NETWORKS,
    title: {
      uz: "Bir tarmoqdami? AND amali",
      en: "Same network? The AND operation",
    },
    minutes: 8,
    intro: {
      uz: "Kompyuter paket yuborishdan oldin bitta savol beradi: “Qabul qiluvchi mening tarmog‘imdami?” Javob — AND amalida.",
      en: "Before sending, a computer asks one question: “Is the receiver on my network?” The answer comes from AND.",
    },
    analogy: {
      uz: "Mask — trafaret: uni manzil ustiga qo‘ysangiz, faqat ko‘cha nomi ko‘rinadi. Ikki manzilda ko‘cha bir xil chiqsa — qo‘shnilar.",
      en: "The mask is a stencil: lay it over an address and only the street shows. If two addresses show the same street, they are neighbours.",
    },
    theory: [
      {
        uz: "AND: ikkala bit ham 1 bo‘lsa natija 1, aks holda 0. IP AND mask = tarmoq manzili.",
        en: "AND: the result bit is 1 only when both bits are 1. IP AND mask = network address.",
      },
      {
        uz: "Ikkala manzil uchun ham AND hisoblanadi. Natijalar teng bo‘lsa, ular bir tarmoqda — paket to‘g‘ridan-to‘g‘ri yuboriladi. Teng bo‘lmasa — gateway orqali.",
        en: "Compute AND for both addresses. Equal results mean the same network and direct delivery; different results mean the gateway.",
      },
    ],
    task: {
      uz: "Ro‘yxatdan kompyuter bilan bir tarmoqdagi qurilmalarni belgilang.",
      en: "Tick the devices on the same network as the PC.",
    },
    hint: {
      uz: "Kompyuter blokini toping: /28 da blok 16 talik (0–15, 16–31, …). Shu blokdagi manzillargina qo‘shni.",
      en: "Find the PC’s block: with /28 blocks are 16 wide (0–15, 16–31, …). Only addresses in that block are neighbours.",
    },
    widget: {
      type: "compare",
      pc: "10.0.0.25",
      prefix: 28,
      devices: [
        "10.0.0.17",
        "10.0.0.33",
        "10.0.0.30",
        "10.0.0.14",
        "10.0.1.25",
      ],
    },
  },
  {
    id: 5,
    group: NETWORKS,
    title: {
      uz: "Gateway: tarmoqdan chiqish eshigi",
      en: "Gateway: the door out of the network",
    },
    minutes: 10,
    intro: {
      uz: "Boshqa tarmoqqa — masalan internetga — paketni kompyuter o‘zi yetkaza olmaydi. U paketni default gateway’ga, ya’ni routerga beradi.",
      en: "A computer cannot deliver a packet to another network, such as the internet, by itself. It hands it to the default gateway: the router.",
    },
    analogy: {
      uz: "Gateway — mahalla darvozasi. Qo‘shningizga to‘g‘ridan-to‘g‘ri borasiz, boshqa shaharga esa faqat darvozadan chiqib.",
      en: "The gateway is the gate of your neighbourhood. You walk straight to a neighbour, but to another city you must go out through the gate.",
    },
    theory: [
      {
        uz: "Default gateway — routerning sizning tarmog‘ingizdagi manzili, ko‘pincha .1 (192.168.1.1). U doim kompyuter bilan bir tarmoqda bo‘ladi.",
        en: "The default gateway is the router’s address on your network, often .1 (192.168.1.1). It is always on the same network as the computer.",
      },
      {
        uz: "Gateway bo‘lmasa ham bir tarmoqdagi printer ishlayveradi, lekin internet ishlamaydi. Bu nosozlikni tanishning eng oson belgisi.",
        en: "Without a gateway a printer on the same network still works, but the internet does not. That is the easiest sign of this fault.",
      },
    ],
    task: {
      uz: "Kompyuter sozlamalarini to‘g‘rilang: printer ham, internet (8.8.8.8) ham javob bersin.",
      en: "Fix the PC’s settings so that both the printer and the internet (8.8.8.8) answer.",
    },
    hint: {
      uz: "Ikkala tugmani bosing va jurnalni o‘qing. Router 192.168.1.1 da turibdi.",
      en: "Press both buttons and read the log. The router sits at 192.168.1.1.",
    },
    widget: {
      type: "network",
      start: { ip: "192.168.1.10", mask: "255.255.255.0", gateway: "" },
    },
  },
  {
    id: 6,
    group: NETWORKS,
    title: {
      uz: "Nosozlikni toping: “Internet yo‘q”",
      en: "Find the fault: “No internet”",
    },
    minutes: 10,
    intro: {
      uz: "Hamkasbingiz qo‘lda sozlamalarni yozgan va endi hech narsa ishlamayapti. Tarmoq muhandisi kabi, qadam-baqadam tekshiring.",
      en: "A colleague typed the settings by hand and now nothing works. Check them step by step, like a network engineer.",
    },
    analogy: {
      uz: "Shifokor kabi ishlang: avval alomatni yozing (nima ishlaydi, nima ishlamaydi), keyin sababni qidiring.",
      en: "Work like a doctor: first write down the symptoms (what works, what does not), then look for the cause.",
    },
    theory: [
      {
        uz: "Tekshirish tartibi: 1) IP manzil to‘g‘rimi va band emasmi? 2) Mask tarmoqqa mosmi? 3) Gateway shu tarmoqdami va u yerda router bormi?",
        en: "Order of checks: 1) Is the IP valid and not taken? 2) Does the mask match the network? 3) Is the gateway on this network, with a router there?",
      },
      {
        uz: "IP to‘qnashuvi — ikki qurilmada bir xil manzil — ikkalasini ham ishdan chiqaradi. Windows buni “IP address conflict” deb ogohlantiradi.",
        en: "An IP conflict, two devices with the same address, breaks both. Windows warns about it as an “IP address conflict”.",
      },
    ],
    task: {
      uz: "Ikki xatoni toping va tuzating: printer ham, internet ham javob bersin.",
      en: "Find and fix both errors so that the printer and the internet answer.",
    },
    hint: {
      uz: "Printerning manzili 192.168.1.50. Routerniki — 192.168.1.1.",
      en: "The printer is at 192.168.1.50. The router is at 192.168.1.1.",
    },
    widget: {
      type: "network",
      start: {
        ip: "192.168.1.50",
        mask: "255.255.255.0",
        gateway: "192.168.1.254",
      },
    },
  },
  {
    id: 7,
    group: PRACTICE,
    title: {
      uz: "Private, public va maxsus manzillar",
      en: "Private, public and special addresses",
    },
    minutes: 7,
    intro: {
      uz: "Hamma manzil ham internetda ishlamaydi. Ba’zilari faqat uy yoki ofis ichida, ba’zilari esa butunlay maxsus vazifada.",
      en: "Not every address works on the internet. Some live only inside a home or office, and some have special jobs.",
    },
    analogy: {
      uz: "Private manzil — mehmonxonadagi xona raqami: ichkarida tushunarli, tashqarida esa ma’nosiz. Tashqariga mehmonxonaning umumiy manzili (public IP) ko‘rinadi.",
      en: "A private address is a hotel room number: clear inside, meaningless outside. Outsiders see the hotel’s street address, the public IP.",
    },
    theory: [
      {
        uz: "Private diapazonlar: 10.0.0.0/8, 172.16.0.0/12 (172.16–172.31), 192.168.0.0/16. Router ularni NAT bilan bitta public manzilga almashtiradi.",
        en: "Private ranges: 10.0.0.0/8, 172.16.0.0/12 (172.16–172.31) and 192.168.0.0/16. The router swaps them for one public address with NAT.",
      },
      {
        uz: "127.0.0.1 — loopback, ya’ni kompyuterning o‘zi. 169.254.x.x — APIPA: kompyuter DHCP serverdan manzil ololmaganda o‘ziga beradi.",
        en: "127.0.0.1 is loopback: the computer itself. 169.254.x.x is APIPA: what a computer gives itself when it gets no address from DHCP.",
      },
    ],
    task: {
      uz: "Har bir manzil turini tanlang.",
      en: "Choose the kind of each address.",
    },
    hint: {
      uz: "Chegaralarga e’tibor bering: 172.16–172.31 private, 172.32 esa yo‘q; 169.254 — APIPA, 127 — loopback.",
      en: "Watch the edges: 172.16–172.31 is private but 172.32 is not; 169.254 is APIPA and 127 is loopback.",
    },
    widget: {
      type: "classify",
      addresses: [
        "10.20.30.40",
        "172.20.1.5",
        "172.32.0.1",
        "192.168.100.1",
        "8.8.8.8",
        "127.0.0.1",
        "169.254.12.7",
        "11.0.0.1",
      ],
    },
  },
  {
    id: 8,
    group: PRACTICE,
    title: {
      uz: "ipconfig natijasini o‘qish",
      en: "Reading ipconfig output",
    },
    minutes: 6,
    intro: {
      uz: "Haqiqiy kompyuterda sozlamalarni Windows’da ipconfig, Linux’da ip a va ip route buyruqlari ko‘rsatadi.",
      en: "On a real computer, ipconfig on Windows and ip a with ip route on Linux show these settings.",
    },
    analogy: {
      uz: "ipconfig — kompyuterning “pasporti”: unda manzili, maski va qaysi darvozadan chiqishi yozilgan.",
      en: "ipconfig is the computer’s passport: it lists its address, its mask and which gate it leaves by.",
    },
    theory: [
      {
        uz: "ipconfig’da uchta qatorni qidiring: IPv4 Address, Subnet Mask, Default Gateway. Linux’da: ip a (manzil/prefix) va ip route (default via …).",
        en: "In ipconfig look for three lines: IPv4 Address, Subnet Mask, Default Gateway. On Linux: ip a (address/prefix) and ip route (default via …).",
      },
      {
        uz: "Manzil 169.254 bilan boshlansa va gateway bo‘sh bo‘lsa, muammo kabel yoki Wi-Fi’da yoki DHCP serverda: kompyuter manzil ololmagan.",
        en: "An address starting 169.254 with an empty gateway points at the cable, the Wi-Fi or the DHCP server: the computer got no address.",
      },
    ],
    task: {
      uz: "Bu kompyuterda internet yo‘q. ipconfig natijasiga qarab sababni tanlang.",
      en: "This computer has no internet. Choose the cause from its ipconfig output.",
    },
    hint: {
      uz: "Manzil qaysi raqamlar bilan boshlanyapti?",
      en: "What numbers does the address start with?",
    },
    widget: {
      type: "ipconfig",
      output: `Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::3c1a:9b2f:7d41:a0c2%12
   Autoconfiguration IPv4 Address. . : 169.254.83.17
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :`,
      options: [
        {
          uz: "Gateway manzili noto‘g‘ri yozilgan",
          en: "The gateway address was typed wrongly",
        },
        {
          uz: "Kompyuter DHCP serverdan manzil ololmadi va o‘ziga APIPA manzil berdi",
          en: "The computer got no address from DHCP and gave itself an APIPA address",
        },
        {
          uz: "Subnet mask juda kichik",
          en: "The subnet mask is too small",
        },
        {
          uz: "Kompyuterda IP to‘qnashuvi bor",
          en: "The computer has an IP conflict",
        },
      ],
      answer: 1,
    },
  },
  {
    id: 9,
    group: ORIGINS,
    title: {
      uz: "DHCP: kompyuter IP’ni qanday oladi",
      en: "DHCP: how a computer gets its IP",
    },
    minutes: 10,
    intro: {
      uz: "Uyda yoki maktabda hech kim telefoningizga IP’ni qo‘lda yozmaydi. Wi-Fi’ga ulanishingiz bilan router uni o‘zi beradi — buni DHCP qiladi.",
      en: "At home or at school nobody types an IP into your phone. The moment you join the Wi-Fi the router hands one out: that is DHCP.",
    },
    analogy: {
      uz: "DHCP — mehmonxona qabulxonasi: kelgan mehmonga bo‘sh xona kalitini beradi va kim qaysi xonada ekanini daftarga yozib qo‘yadi. Mehmon ketsa, xona boshqasiga beriladi.",
      en: "DHCP is a hotel front desk: each guest gets the key to a free room and the desk notes who is where. When a guest leaves, the room goes to someone else.",
    },
    theory: [
      {
        uz: "To‘rt xabar: DISCOVER (qurilma: “server bormi?”), OFFER (router: “mana senga manzil”), REQUEST (qurilma: “olaman”), ACK (router: “tasdiqlandi”). Qisqasi — DORA.",
        en: "Four messages: DISCOVER (device: “any server here?”), OFFER (router: “here is an address”), REQUEST (device: “I’ll take it”), ACK (router: “confirmed”). DORA for short.",
      },
      {
        uz: "Router manzillarni hovuzdan (pool) beradi, masalan 192.168.1.100–192.168.1.199. IP bilan birga mask, gateway va DNS server ham beriladi. Manzil vaqtincha — ijara (lease) muddatiga.",
        en: "The router hands out addresses from a pool, such as 192.168.1.100–192.168.1.199, together with the mask, gateway and DNS server. The address is rented for a lease time.",
      },
      {
        uz: "Printer va serverlarga esa statik (doimiy) manzil beriladi — ular hovuzdan tashqarida bo‘lishi kerak, aks holda to‘qnashuv bo‘ladi.",
        en: "Printers and servers get static addresses, which must stay outside the pool or they will clash.",
      },
    ],
    task: {
      uz: "Hovuzda atigi 4 ta manzil bor, qurilmalar esa 6 ta. Hovuzni sozlang va hamma qurilmani tarmoqqa ulang.",
      en: "The pool has only 4 addresses for 6 devices. Adjust the pool and connect every device.",
    },
    hint: {
      uz: "Hovuz oxirini 105 qiling. 50 ni hovuzga kiritmang — u printerniki.",
      en: "Set the pool end to 105. Keep 50 out of the pool: it belongs to the printer.",
    },
    widget: {
      type: "dhcp",
      start: { enabled: true, start: 100, end: 103 },
    },
  },
  {
    id: 10,
    group: ORIGINS,
    title: {
      uz: "DNS: sayt nomidan IP manzilga",
      en: "DNS: from a site name to an IP",
    },
    minutes: 10,
    intro: {
      uz: "Brauzerga kutubxona.example deb yozasiz, lekin kompyuterlar nomlar bilan emas, IP manzillar bilan gaplashadi. Nomni IP’ga DNS aylantiradi.",
      en: "You type kutubxona.example, but computers talk in IP addresses, not names. DNS turns the name into an IP.",
    },
    analogy: {
      uz: "DNS — telefon kitobchasi: “Kutubxona” ismini qidirasiz, raqamini topasiz. Raqamni yodlash shart emas.",
      en: "DNS is a phone book: you look up “Library” and find the number. Nobody has to memorise numbers.",
    },
    theory: [
      {
        uz: "Avval kompyuter o‘z keshiga qaraydi. Topilmasa, DNS resolver’ga so‘raydi. Resolver root → .example (TLD) → domen egasining avtoritativ serveri zanjiri bo‘ylab javobni topadi.",
        en: "The computer checks its cache first. If the name is missing, it asks a DNS resolver, which walks the chain root → .example (TLD) → the domain’s authoritative server.",
      },
      {
        uz: "Javob TTL bilan keladi — qancha vaqt eslab qolish mumkinligi. Keyingi so‘rov keshdan, bir zumda javob oladi. Windows’da keshni ipconfig /flushdns tozalaydi.",
        en: "Answers carry a TTL: how long they may be remembered. The next lookup comes straight from the cache. On Windows, ipconfig /flushdns clears it.",
      },
      {
        uz: "Xavfsizlik: domen o‘ngdan chapga o‘qiladi. bank.example.hisob-tekshiruv.example egasi — hisob-tekshiruv.example, bank emas. Uning IP’si ham boshqa — bu fishingning asosiy hiylasi.",
        en: "Security: a name is read right to left. bank.example.hisob-tekshiruv.example belongs to hisob-tekshiruv.example, not the bank, and points to a different IP. That is the core phishing trick.",
      },
    ],
    task: {
      uz: "Ikkala saytni oching va IP manzillarini yozing: haqiqiy bank va soxta “bank”.",
      en: "Open both sites and write down their IPs: the real bank and the fake “bank”.",
    },
    hint: {
      uz: "Takliflardagi bank.example va bank.example.hisob-tekshiruv.example tugmalarini bosing.",
      en: "Press the suggested bank.example and bank.example.hisob-tekshiruv.example buttons.",
    },
    widget: {
      type: "dns",
      ask: ["bank.example", "bank.example.hisob-tekshiruv.example"],
    },
  },
  {
    id: 11,
    group: ORIGINS,
    title: {
      uz: "NAT: sayt sizni qaysi IP bilan ko‘radi",
      en: "NAT: which IP a site sees",
    },
    minutes: 8,
    intro: {
      uz: "Uydagi noutbuk, telefon va televizorning private manzillari internetda ishlamaydi. Ular saytga routerning bitta public IP’si orqali chiqadi.",
      en: "The private addresses of the laptop, phone and TV at home do not work on the internet. They reach sites through the router’s one public IP.",
    },
    analogy: {
      uz: "NAT — ofis kotibasi: hamma xatlar ofisning umumiy manzilidan ketadi, kotiba esa javob kelganda qaysi xodimga berishni daftaridan topadi.",
      en: "NAT is an office receptionist: all letters leave from the office address, and when a reply arrives the receptionist checks a notebook for who it belongs to.",
    },
    theory: [
      {
        uz: "Router chiqayotgan paketda “kimdan” manzilini o‘zining public IP’siga almashtiradi va har bir ulanishga alohida port beradi: 192.168.1.100:51514 → 203.0.113.7:40001.",
        en: "The router rewrites the sender of each outgoing packet to its public IP and gives every connection its own port: 192.168.1.100:51514 → 203.0.113.7:40001.",
      },
      {
        uz: "Javob kelganda router jadvaldan portni topib, paketni to‘g‘ri qurilmaga uzatadi. Shuning uchun ikki qurilma bir xil ichki portni ishlatsa ham adashmaydi.",
        en: "When the reply arrives, the router looks the port up and forwards the packet to the right device, so two devices may even use the same inner port.",
      },
      {
        uz: "Sayt jurnalida faqat public IP ko‘rinadi. “Mening IP’im qanday?” saytlari ko‘rsatadigan manzil ham — routerning public IP’si.",
        en: "A site’s log shows only the public IP. The address “what is my IP” sites show you is the router’s public IP too.",
      },
    ],
    task: {
      uz: "Kamida ikkita qurilmadan saytni oching va sayt jurnaliga qarang. Sayt ularni qanday IP bilan ko‘radi?",
      en: "Open the site from at least two devices and look at the site’s log. Which IP does the site see?",
    },
    hint: {
      uz: "Sayt jurnalidagi “kimdan” ustuniga qarang.",
      en: "Look at the “from” column of the site log.",
    },
    widget: {
      type: "nat",
      options: [
        {
          uz: "Har bir qurilmaning o‘z private IP’si (192.168.1.100, .101, .102)",
          en: "Each device’s own private IP (192.168.1.100, .101, .102)",
        },
        {
          uz: "Hammasi routerning bitta public IP’si — 203.0.113.7, faqat portlari har xil",
          en: "All as the router’s single public IP, 203.0.113.7, with different ports",
        },
        {
          uz: "Routerning ichki manzili 192.168.1.1",
          en: "The router’s inside address 192.168.1.1",
        },
        {
          uz: "Sayt IP manzilni umuman ko‘rmaydi",
          en: "The site sees no IP address at all",
        },
      ],
      answer: 1,
    },
  },
  {
    id: 12,
    group: DEEPER,
    title: {
      uz: "Subnetting: tarmoqni bo‘laklarga bo‘lish",
      en: "Subnetting: splitting a network",
    },
    minutes: 12,
    intro: {
      uz: "Bitta katta tarmoq o‘rniga har bir bo‘limga alohida kichik tarmoq beriladi: buxgalteriya kompyuterlari o‘quvchilarnikini ko‘rmaydi va tartib saqlanadi.",
      en: "Instead of one big network, each department gets its own small one: the accounting computers stay apart from the students’ and things stay tidy.",
    },
    analogy: {
      uz: "Katta yerni teng uchastkalarga bo‘lish kabi: uchastkalar qancha ko‘p bo‘lsa, har biri shuncha kichik bo‘ladi.",
      en: "Like dividing a field into equal plots: the more plots, the smaller each one.",
    },
    theory: [
      {
        uz: "Maskka har bir qo‘shimcha bit tarmoqni ikkiga bo‘ladi: /24 → 2 ta /25 → 4 ta /26 → 8 ta /27. Bo‘laklar soni = 2^(qo‘shilgan bitlar).",
        en: "Each extra mask bit halves the network: /24 → two /25 → four /26 → eight /27. Subnets = 2^(borrowed bits).",
      },
      {
        uz: "Ikki shart bir vaqtda bajarilishi kerak: bo‘laklar hamma bo‘limga yetsin va har bir bo‘lakka bo‘limdagi kompyuterlar sig‘sin.",
        en: "Two conditions must hold together: there are enough subnets for every department, and each subnet fits a department’s computers.",
      },
      {
        uz: "N-bo‘lakning tarmoq manzili = asosiy manzil + (N − 1) × blok hajmi. /26 da blok 64: 0, 64, 128, 192.",
        en: "Subnet N starts at base + (N − 1) × block size. With /26 the block is 64: 0, 64, 128, 192.",
      },
    ],
    task: {
      uz: "Bo‘limlar uchun to‘g‘ri maskni tanlang va so‘ralgan bo‘limning tarmoq manzilini yozing.",
      en: "Choose the right mask for the departments and write the network address of the department asked for.",
    },
    hint: {
      uz: "Ikkala belgi ham yashil bo‘ladigan maskni toping, so‘ng bloklar chizig‘ida kerakli bo‘limning boshlanishini o‘qing.",
      en: "Find the mask where both marks turn green, then read where the department’s block starts on the bar.",
    },
    widget: {
      type: "subnetting",
      base: "192.168.10.0",
      departments: 4,
      hosts: 50,
      ask: 3,
    },
  },
  {
    id: 13,
    group: DEEPER,
    title: {
      uz: "Traceroute: paket qaysi yo‘ldan boradi",
      en: "Traceroute: the path a packet takes",
    },
    minutes: 10,
    intro: {
      uz: "Saytgacha paket bir nechta routerdan o‘tadi. tracert (Windows) yoki traceroute (Linux) shu yo‘lni va har bir qadamdagi kechikishni ko‘rsatadi.",
      en: "On its way to a site a packet crosses several routers. tracert (Windows) or traceroute (Linux) shows that path and the delay at each step.",
    },
    analogy: {
      uz: "TTL — paketning “yoqilg‘isi”: har bir router bir litr oladi. Yoqilg‘i tugagan joyda paket to‘xtaydi va o‘sha router “men shu yerdaman” deb xabar beradi.",
      en: "TTL is the packet’s fuel: every router takes one litre. Where the fuel runs out the packet stops, and that router reports “I am here”.",
    },
    theory: [
      {
        uz: "Har bir IP paketda TTL (Time To Live) bor. Router uni 1 ga kamaytiradi; 0 bo‘lsa, paketni tashlaydi va “ICMP time exceeded” qaytaradi. Bu paketlarning abadiy aylanib yurishiga yo‘l qo‘ymaydi.",
        en: "Every IP packet carries a TTL (Time To Live). Each router lowers it by 1; at 0 it drops the packet and returns “ICMP time exceeded”. That stops packets from looping forever.",
      },
      {
        uz: "Traceroute ataylab TTL=1, 2, 3, … bilan paket yuboradi: birinchisi 1-routerda, ikkinchisi 2-routerda to‘xtaydi. Javoblardan yo‘l xaritasi yig‘iladi.",
        en: "Traceroute sends packets with TTL 1, 2, 3, … on purpose: the first dies at router 1, the second at router 2. The replies draw the map.",
      },
      {
        uz: "Kechikish (ms) qaysi qadamda keskin oshsa, muammo yoki uzoq masofa o‘sha yerda — masalan, xalqaro kanal.",
        en: "Where the delay (ms) jumps sharply is where the trouble or the long distance is, such as an international link.",
      },
    ],
    task: {
      uz: "TTL bilan tajriba qiling va ikki savolga javob bering.",
      en: "Experiment with the TTL and answer the two questions.",
    },
    hint: {
      uz: "TTL=3 bilan yuboring va qaysi router javob berganini ko‘ring. Keyin tracert natijasida ms qiymatlari qayerda sakraganini toping.",
      en: "Send with TTL 3 and see which router answers. Then find where the ms values jump in the tracert output.",
    },
    widget: { type: "traceroute" },
  },
  {
    id: 14,
    group: DEEPER,
    title: {
      uz: "Portlar: IP — bino, port — eshik",
      en: "Ports: the IP is the building, the port the door",
    },
    minutes: 10,
    intro: {
      uz: "Bitta serverda bir nechta xizmat ishlaydi: sayt, pochta, ma’lumotlar bazasi. IP serverni topadi, port esa qaysi xizmatga murojaat qilinayotganini aytadi.",
      en: "One server runs several services: a website, mail, a database. The IP finds the server; the port says which service you want.",
    },
    analogy: {
      uz: "IP — ko‘p qavatli uy manzili, port — xonadon raqami. Xat to‘g‘ri uyga yetsa ham, xonadon raqamisiz egasiga bormaydi.",
      en: "The IP is the building’s address and the port the flat number. A letter that reaches the right building still needs the flat number.",
    },
    theory: [
      {
        uz: "Mashhur portlar: 22 — SSH, 53 — DNS, 80 — HTTP, 443 — HTTPS, 3306 — MySQL. Portlar 1 dan 65535 gacha.",
        en: "Well-known ports: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 3306 MySQL. Ports run from 1 to 65535.",
      },
      {
        uz: "TCP ulanish uch qadamda ochiladi: SYN → SYN-ACK → ACK. Yopiq port RST bilan javob beradi, firewall bilan filtrlangan port esa umuman javob bermaydi.",
        en: "A TCP connection opens in three steps: SYN → SYN-ACK → ACK. A closed port answers with RST; a port filtered by a firewall does not answer at all.",
      },
      {
        uz: "Xavfsizlik qoidasi: internetga faqat hamma uchun mo‘ljallangan xizmatlar ochiq bo‘ladi. Ma’lumotlar bazasi yoki boshqaruv (SSH) porti tashqariga ochiq qolsa — bu hujum uchun eshik.",
        en: "Security rule: only services meant for everyone face the internet. A database or admin (SSH) port left open to the outside is a door for attackers.",
      },
    ],
    task: {
      uz: "Har bir portga xizmatni moslang, keyin firewall’ni yoqib, tashqaridan faqat veb-portlar ochiq qolganini tekshiring.",
      en: "Match each port to its service, then turn on the firewall and check that only the web ports stay open from outside.",
    },
    hint: {
      uz: "Portlarni bittadan tekshirib ko‘ring: SYN-ACK — ochiq, RST — yopiq, javob yo‘q — filtrlangan.",
      en: "Probe the ports one by one: SYN-ACK means open, RST closed, no answer filtered.",
    },
    widget: { type: "ports" },
  },
  {
    id: 15,
    group: DEEPER,
    title: {
      uz: "IPv6 asoslari: qisqartirib yozish",
      en: "IPv6 basics: the short form",
    },
    minutes: 10,
    intro: {
      uz: "IPv4 manzillari (4 milliardga yaqin) tugadi. IPv6 manzili 128 bit — har bir qum zarrasiga ham yetadi. Lekin u uzun, shuning uchun qisqartirib yoziladi.",
      en: "IPv4’s roughly 4 billion addresses have run out. An IPv6 address is 128 bits, enough for every grain of sand, but long, so it is written in a short form.",
    },
    analogy: {
      uz: "Uzun telefon raqamidagi ortiqcha nollarni tashlab yozish kabi — ma’nosi o‘zgarmaydi, faqat qisqaradi.",
      en: "Like dropping the needless zeros from a long number: the meaning stays, it just gets shorter.",
    },
    theory: [
      {
        uz: "IPv6 — 8 ta guruh, har biri 4 ta 16 lik raqam (0–9, a–f), ikki nuqta bilan ajratiladi: 2001:0db8:0000:0000:0000:ff00:0042:8329. Odatda birinchi 64 bit — tarmoq, qolgan 64 bit — qurilma.",
        en: "IPv6 is 8 groups of 4 hex digits (0–9, a–f) separated by colons: 2001:0db8:0000:0000:0000:ff00:0042:8329. Usually the first 64 bits are the network and the last 64 the device.",
      },
      {
        uz: "Qoida 1: har guruhdagi bosh nollar tashlanadi (0db8 → db8, 0000 → 0). Qoida 2: nollardan iborat eng uzun ketma-ket guruhlar (kamida 2 ta) “::” bilan almashtiriladi — faqat bir marta. Qoida 3: kichik harflar.",
        en: "Rule 1: drop leading zeros in each group (0db8 → db8, 0000 → 0). Rule 2: replace the longest run of all-zero groups (at least two) with “::”, only once. Rule 3: lowercase.",
      },
      {
        uz: "Natija: 2001:db8::ff00:42:8329. ::1 — IPv6’dagi loopback (IPv4’dagi 127.0.0.1).",
        en: "Result: 2001:db8::ff00:42:8329. ::1 is IPv6 loopback (IPv4’s 127.0.0.1).",
      },
    ],
    task: {
      uz: "Manzilni qoidalar bo‘yicha eng qisqa (kanonik) shaklda yozing.",
      en: "Write the address in its shortest (canonical) form following the rules.",
    },
    hint: {
      uz: "Avval har guruhdagi bosh nollarni o‘chiring, so‘ng eng uzun “0:0:…” qatorini toping va o‘rniga “::” qo‘ying.",
      en: "First drop the leading zeros in every group, then find the longest “0:0:…” stretch and put “::” in its place.",
    },
    widget: {
      type: "ipv6",
      address: "2001:0db8:0000:0000:0000:ff00:0042:8329",
    },
  },
  {
    id: 16,
    group: WEB,
    title: {
      uz: "Sayt ochilganda nima bo‘ladi: DNS → TCP → TLS → HTTP",
      en: "Opening a site: DNS → TCP → TLS → HTTP",
    },
    minutes: 12,
    intro: {
      uz: "Brauzerga kutubxona.example/kitoblar deb yozib Enter bosganingizdan sahifa chiqquncha bir necha o‘nta paket almashinadi. Ularni birma-bir ko‘ramiz.",
      en: "Between typing kutubxona.example/kitoblar and seeing the page, dozens of packets go back and forth. Let’s watch them one by one.",
    },
    analogy: {
      uz: "Do‘konga borish kabi: avval manzilni bilib olasiz (DNS), eshikni ochasiz (TCP), sotuvchi bilan maxfiy til kelishasiz (TLS), keyin buyurtma berasiz (HTTP).",
      en: "Like visiting a shop: find the address (DNS), open the door (TCP), agree on a private language with the clerk (TLS), then place your order (HTTP).",
    },
    theory: [
      {
        uz: "DNS — nomdan IP. TCP — ishonchli ulanish (SYN, SYN-ACK, ACK). TLS — shifrlash va sertifikat tekshiruvi (faqat HTTPS’da). HTTP — so‘rov (GET /kitoblar) va javob (200 OK + HTML).",
        en: "DNS turns the name into an IP. TCP makes a reliable connection (SYN, SYN-ACK, ACK). TLS adds encryption and checks the certificate (HTTPS only). HTTP carries the request (GET /kitoblar) and the answer (200 OK + HTML).",
      },
      {
        uz: "Brauzerdagi DevTools → Network bo‘limi xuddi shu vaqt diagrammasini ko‘rsatadi: DNS, Connect, SSL, Waiting, Download.",
        en: "Your browser’s DevTools → Network panel shows this same timeline: DNS, Connect, SSL, Waiting, Download.",
      },
      {
        uz: "Xavfsizlik: ochiq Wi-Fi’da boshqalar paketlaringizni ko‘ra oladi. HTTPS mazmunni yashiradi, lekin qaysi saytga kirayotganingiz (DNS, SNI, IP) baribir ko‘rinadi.",
        en: "Security: on open Wi-Fi others can see your packets. HTTPS hides the content, but which site you visit (DNS, SNI, IP) still shows.",
      },
    ],
    task: {
      uz: "Kalitlarni almashtirib, paketlarni ko‘rib chiqing va ikki savolga javob bering.",
      en: "Flip the switches, step through the packets and answer the two questions.",
    },
    hint: {
      uz: "“DNS keshda” ni yoqing — qaysi bosqich yo‘qoladi? Keyin HTTPS’da “Wi-Fi’dagi hujumchi ko‘zi” bilan GET paketiga qarang.",
      en: "Turn on “DNS cached”: which phase disappears? Then look at the GET packet through the Wi-Fi eavesdropper’s eyes over HTTPS.",
    },
    widget: {
      type: "pageload",
      questions: [
        {
          ask: {
            uz: "Sayt IP’si keshda bo‘lsa, qaysi bosqich butunlay tushib qoladi?",
            en: "If the site’s IP is cached, which phase disappears entirely?",
          },
          options: [
            { uz: "DNS", en: "DNS" },
            { uz: "TCP", en: "TCP" },
            { uz: "TLS", en: "TLS" },
            { uz: "HTTP", en: "HTTP" },
          ],
          answer: 0,
        },
        {
          ask: {
            uz: "HTTPS’da kafe Wi-Fi’sidagi hujumchi nimani ko‘ra OLMAYDI?",
            en: "Over HTTPS, what can an eavesdropper on café Wi-Fi NOT see?",
          },
          options: [
            {
              uz: "Qaysi saytga kirayotganingizni (nom va IP)",
              en: "Which site you visit (name and IP)",
            },
            {
              uz: "Sahifa yo‘li (/kitoblar) va cookie",
              en: "The page path (/kitoblar) and the cookie",
            },
            {
              uz: "Qachon va qancha ma’lumot almashganingizni",
              en: "When and how much data you exchanged",
            },
          ],
          answer: 1,
        },
      ],
    },
  },
  {
    id: 17,
    group: WEB,
    title: {
      uz: "HTTP so‘rov va javob: o‘zingiz yuboring",
      en: "HTTP requests and responses: send your own",
    },
    minutes: 12,
    intro: {
      uz: "HTTP — oddiy matn. So‘rovning birinchi qatori metod va yo‘l, keyin sarlavhalar, keyin bo‘sh qator va tana. Javob ham shunday, faqat birinchi qatorda status kodi.",
      en: "HTTP is plain text. A request starts with the method and path, then headers, a blank line and a body. A response looks the same with a status code on the first line.",
    },
    analogy: {
      uz: "Status kodlari — svetofor: 2xx — yashil (bo‘ldi), 3xx — “boshqa yo‘ldan yuring”, 4xx — siz xato qildingiz, 5xx — server buzildi.",
      en: "Status codes are traffic lights: 2xx green (done), 3xx “take another road”, 4xx you made a mistake, 5xx the server broke.",
    },
    theory: [
      {
        uz: "Metodlar: GET — olish, POST — yuborish (forma, login), HEAD — faqat sarlavhalar, DELETE — o‘chirish. Server har bir manzil uchun qaysi metodlar mumkinligini o‘zi belgilaydi.",
        en: "Methods: GET fetches, POST sends (forms, sign-in), HEAD returns headers only, DELETE removes. The server decides which methods each address allows.",
      },
      {
        uz: "Muhim kodlar: 200 OK, 301 doimiy ko‘chdi, 302 vaqtincha boshqa joyga, 401 — kimligingiz noma’lum, 403 — taniymiz, lekin ruxsat yo‘q, 404 — topilmadi, 405 — bu metod mumkin emas.",
        en: "Key codes: 200 OK, 301 moved for good, 302 go elsewhere for now, 401 we don’t know who you are, 403 we know you but no, 404 not found, 405 method not allowed.",
      },
      {
        uz: "HTTP o‘zi “xotirasiz”: har so‘rov alohida. Sizni eslab qolish uchun server Set-Cookie bilan sessiya kalitini beradi, brauzer uni har so‘rovga Cookie sarlavhasi bilan qo‘shadi.",
        en: "HTTP itself has no memory: every request stands alone. To remember you the server hands out a session key with Set-Cookie, and the browser sends it back in a Cookie header each time.",
      },
    ],
    task: {
      uz: "So‘rovlar tuzib, serverdan quyidagi barcha status kodlarini oling: 200, 301, 302, 401, 403, 404.",
      en: "Build requests that get every one of these status codes from the server: 200, 301, 302, 401, 403, 404.",
    },
    hint: {
      uz: "302 uchun /kirish ga POST bilan login=talaba&parol=kitob123 yuboring. 401 va 403 — /admin’ga cookie’siz va oddiy foydalanuvchi cookie’si bilan.",
      en: "For 302, POST login=talaba&parol=kitob123 to /kirish. For 401 and 403, request /admin with no cookie and with a regular user’s cookie.",
    },
    widget: { type: "http" },
  },
];

export const PROGRESS_KEY = "cybervalue:network:progress:v1";

// Browser storage is user-controlled: keep only `true` marks for real lessons.
export function restoreProgress(value: unknown): Record<string, true> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    LESSONS.map((lesson) => String(lesson.id))
      .filter(
        (id) =>
          Object.hasOwn(value, id) &&
          (value as Record<string, unknown>)[id] === true,
      )
      .map((id) => [id, true as const]),
  );
}
