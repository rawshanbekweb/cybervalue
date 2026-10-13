// Lessons of the IP addressing lab. Each lesson pairs a short explanation with
// one interactive widget; the widget decides when its task is solved.
import type { Text } from "./ip";
import type { PcConfig } from "./sim";

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
    };

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
      uz: "Bitlarni bosib 192.168.1.10 manzilini yig‘ing.",
      en: "Click the bits to build the address 192.168.1.10.",
    },
    hint: {
      uz: "168 = 128 + 32 + 8; 10 = 8 + 2; 1 — faqat oxirgi bit.",
      en: "168 = 128 + 32 + 8; 10 = 8 + 2; 1 is just the last bit.",
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
      uz: "Sinfda 40 ta kompyuter bor. Hammasi sig‘adigan eng kichik tarmoq maskini tanlang.",
      en: "A classroom has 40 computers. Pick the smallest mask that fits them all.",
    },
    hint: {
      uz: "/27 da atigi 30 ta host bor — yetmaydi. Bitta bit chapga suring.",
      en: "/27 has only 30 hosts, which is not enough. Move one bit to the left.",
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
      uz: "172.16.5.130/25 uchun tarmoq manzilini, broadcast manzilini va hostlar sonini toping.",
      en: "For 172.16.5.130/25, find the network address, the broadcast address and the number of hosts.",
    },
    hint: {
      uz: "/25 da blok 128 talik: 0–127 va 128–255. 130 ikkinchi blokda.",
      en: "With /25 the blocks are 128 wide: 0–127 and 128–255. 130 is in the second.",
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
      uz: "Kompyuter 10.0.0.25/28. Ro‘yxatdan u bilan bir tarmoqdagi qurilmalarni belgilang.",
      en: "The PC is 10.0.0.25/28. Tick the devices on the same network.",
    },
    hint: {
      uz: "/28 da blok 16 talik: 0–15, 16–31, 32–47. 25 qaysi blokda?",
      en: "With /28 the blocks are 16 wide: 0–15, 16–31, 32–47. Which block holds 25?",
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
      uz: "172.32.x.x private emas: private blok 172.31 da tugaydi.",
      en: "172.32.x.x is not private: the private block ends at 172.31.",
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
