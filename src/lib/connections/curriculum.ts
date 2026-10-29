// Academy Intermediate · Network security, module 4: Secure connections.
// The lessons use ./tools.ts: Wi-Fi modes against an offline dictionary
// attack, VPN tunnels on café Wi-Fi, and SSH host key fingerprints.
import type { CommonWidget, Lesson, Text } from "../anim-lab/types";

export type Widget =
  CommonWidget | { type: "wifi" } | { type: "vpn" } | { type: "hostkey" };

export const PROGRESS_KEY = "cybervalue:connections:progress:v1";

const t = (uz: string, en: string): Text => ({ uz, en });

const AIR = t("Havo orqali", "Over the air");
const TUNNELS = t("Tunnellar", "Tunnels");
const SHELL = t("SSH", "SSH");

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: AIR,
    title: t("Qaysi vosita nimani himoya qiladi", "What each tool protects"),
    minutes: 6,
    intro: t(
      "Xavfsiz ulanish vositalari har xil qismni himoya qiladi: WPA3 — noutbuk va Wi-Fi nuqtasi orasidagi havoni, TLS — brauzer va sayt orasini, VPN — butun trafikni ofis yoki VPN serverigacha, SSH — server bilan buyruq qatori seansini.",
      "Secure connection tools protect different stretches: WPA3 the air between laptop and access point, TLS the path from browser to site, a VPN all traffic up to the office or VPN server, SSH a command-line session with a server.",
    ),
    analogy: t(
      "Har xil qulf: uy eshigi, mashina, seyf va pochta qutisi — hammasi qulf, lekin har biri boshqa narsani qo‘riqlaydi.",
      "Different locks: the front door, the car, the safe and the mailbox — all locks, each guarding something else.",
    ),
    theory: [
      t(
        "Wi-Fi shifrlash faqat birinchi “sakrash”ni himoya qiladi: Wi-Fi nuqtasidan keyin trafik yana ochiq bo‘lishi mumkin.",
        "Wi-Fi encryption protects only the first hop: past the access point the traffic may be open again.",
      ),
    ],
    task: t(
      "Har bir vaziyatga mos vositani tanlang.",
      "Match each situation to the tool that protects it.",
    ),
    hint: t(
      "Qayerdan qayergacha himoya kerakligini o‘ylang.",
      "Think about from where to where the protection must reach.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "wpa3", label: t("WPA3", "WPA3") },
        { id: "tls", label: t("TLS (HTTPS)", "TLS (HTTPS)") },
        { id: "vpn", label: t("VPN", "VPN") },
        { id: "ssh", label: t("SSH", "SSH") },
      ],
      items: [
        {
          label: t(
            "Ofis Wi-Fi’sidagi trafikni qo‘shni tinglamasin",
            "The neighbour can’t listen to the office Wi-Fi",
          ),
          bucket: "wpa3",
        },
        {
          label: t(
            "Brauzer va bank.uz orasidagi parol",
            "The password between the browser and bank.uz",
          ),
          bucket: "tls",
        },
        {
          label: t(
            "Uydan ofisning ichki fayl serveriga ulanish",
            "Reaching the office’s internal file server from home",
          ),
          bucket: "vpn",
        },
        {
          label: t(
            "Linux serverda buyruqlarni masofadan bajarish",
            "Running commands on a Linux server remotely",
          ),
          bucket: "ssh",
        },
        {
          label: t(
            "Kafe Wi-Fi’da butun trafikni yashirish",
            "Hiding all your traffic on café Wi-Fi",
          ),
          bucket: "vpn",
        },
        {
          label: t(
            "Serverga fayllarni xavfsiz nusxalash (scp, sftp)",
            "Copying files to a server safely (scp, sftp)",
          ),
          bucket: "ssh",
        },
      ],
    },
  },
  {
    id: 2,
    group: AIR,
    title: t("Wi-Fi: WEP, WPA2, WPA3", "Wi-Fi: WEP, WPA2, WPA3"),
    minutes: 12,
    intro: t(
      "Hujumchi kafe yonida turib, kimdir Wi-Fi’ga ulanayotgandagi “handshake”ni yozib oladi. WEP’da kalit trafikning o‘zidan bir necha daqiqada chiqadi. WPA2-PSK’da handshake’ni uyda, internetsiz, GPU bilan soniyasiga million parol sinab buzish mumkin — oddiy parol bir soniyada topiladi. WPA3 (SAE) esa offline hujumga yo‘l qo‘ymaydi: har bir taxmin — tarmoqqa jonli urinish.",
      "An attacker standing near the café records the handshake when someone joins the Wi-Fi. With WEP the key falls out of the traffic itself in minutes. With WPA2-PSK the handshake can be cracked at home, offline, trying a million passwords a second on a GPU — a common password falls in a second. WPA3 (SAE) allows no offline attack: every guess is a live attempt on the network.",
    ),
    analogy: t(
      "WPA2 — qulfning nusxasini uyga olib ketib, istagancha kalit sinash. WPA3 — har bir kalitni eshik oldida, qorovul ko‘zi oldida sinash.",
      "WPA2 is taking a copy of the lock home and trying keys as long as you like. WPA3 is trying each key at the door, in front of the guard.",
    ),
    theory: [
      t(
        "WPA2’da himoya faqat parol uzunligi va tasodifiyligiga bog‘liq. 12+ tasodifiy belgi yoki 4–5 tasodifiy so‘z yaxshi.",
        "On WPA2 the only defence is the passphrase’s length and randomness. 12+ random characters, or 4–5 random words, hold up.",
      ),
      t(
        "Ofislarda WPA2/WPA3-Enterprise (802.1X) — har bir xodim o‘z login-paroli bilan; umumiy parol umuman yo‘q.",
        "Offices use WPA2/WPA3-Enterprise (802.1X) — each employee signs in with their own login; there is no shared password at all.",
      ),
    ],
    task: t(
      "Ofis Wi-Fi’sini shunday sozlangki, handshake’ni yozib olgan hujumchi uni 100 yil ichida ham buza olmasin.",
      "Set up the office Wi-Fi so an attacker who records the handshake can’t crack it in a hundred years.",
    ),
    hint: t(
      "WPA3 yoki WPA2 bilan juda uzun tasodifiy parol.",
      "WPA3, or WPA2 with a very long random passphrase.",
    ),
    widget: { type: "wifi" },
  },
  {
    id: 3,
    group: AIR,
    title: t("Soxta Wi-Fi nuqtalari", "Fake access points"),
    minutes: 6,
    intro: t(
      "“Evil twin” — hujumchi kafe tarmog‘i bilan bir xil nomli Wi-Fi nuqtasini yoqadi. Telefon tanish nomni ko‘rib, avtomatik ulanadi va endi butun trafik hujumchi orqali o‘tadi. Soxta “captive portal” sahifasi esa parol yoki karta ma’lumotlarini so‘rashi mumkin.",
      "An “evil twin”: the attacker turns on an access point with the café network’s name. Phones see the familiar name, join automatically, and now all traffic passes through the attacker. A fake “captive portal” page may ask for passwords or card details.",
    ),
    analogy: t(
      "Bankning eshigi oldida bank xodimi kiyimini kiygan begona: forma bir xil, lekin u bankda ishlamaydi.",
      "A stranger in a bank uniform at the bank’s door: the uniform matches, but he doesn’t work there.",
    ),
    theory: [
      t(
        "Ochiq tarmoqlarda HTTPS va VPN ishlating; telefonga “ochiq tarmoqlarga avtomatik ulanish”ni o‘chiring.",
        "On open networks use HTTPS and a VPN; turn off “join open networks automatically” on your phone.",
      ),
      t(
        "WPS PIN (8 raqam) amalda 11 000 urinishda topiladi — routerda WPS’ni o‘chiring.",
        "A WPS PIN (8 digits) falls in about 11 000 tries in practice — turn WPS off on the router.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "Tarmoq nomi (SSID) hech narsani isbotlamaydi.",
      "A network’s name (SSID) proves nothing.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Telefon “Cafe_Free” tarmog‘iga avtomatik ulandi. Bu haqiqiy kafe tarmog‘i ekanini nima kafolatlaydi?",
            "A phone joined “Cafe_Free” automatically. What guarantees it is the café’s real network?",
          ),
          options: [
            t(
              "Hech narsa — nomni har kim qo‘ya oladi",
              "Nothing — anyone can use the name",
            ),
            t("Signalning kuchliligi", "The strong signal"),
            t("Nomdagi “Free” so‘zi", "The word “Free” in the name"),
          ],
          answer: 0,
          explain: t(
            "Ochiq tarmoqda nuqtaning haqiqiyligini tekshirib bo‘lmaydi; trafikni HTTPS va VPN bilan himoya qiling.",
            "On an open network the access point can’t be verified; protect the traffic with HTTPS and a VPN.",
          ),
        },
        {
          ask: t(
            "Router sozlamasida WPS yoqilgan. Nima qilish kerak?",
            "WPS is on in the router settings. What should you do?",
          ),
          options: [
            t(
              "O‘chirish — PIN tez topiladi",
              "Turn it off — the PIN is found quickly",
            ),
            t("Qoldirish — u qulay", "Leave it — it is convenient"),
            t("PIN’ni 12345670 ga almashtirish", "Change the PIN to 12345670"),
          ],
          answer: 0,
          explain: t(
            "PIN ikki yarimga bo‘linib tekshiriladi — 10^4 + 10^3 urinish.",
            "The PIN is checked in two halves — 10^4 + 10^3 tries.",
          ),
        },
        {
          ask: t(
            "Katta ofis uchun eng yaxshi Wi-Fi rejimi?",
            "The best Wi-Fi mode for a big office?",
          ),
          options: [
            t(
              "WPA3-Enterprise (802.1X): har bir xodimning o‘z logini",
              "WPA3-Enterprise (802.1X): each employee’s own login",
            ),
            t("Hamma uchun bitta WPA2 parol", "One WPA2 password for everyone"),
            t(
              "Ochiq tarmoq va yashirin SSID",
              "An open network with a hidden SSID",
            ),
          ],
          answer: 0,
          explain: t(
            "Xodim ketsa, faqat uning hisobi o‘chiriladi — umumiy parolni almashtirish shart emas.",
            "When someone leaves, only their account is disabled — no shared password to change.",
          ),
        },
      ],
    },
  },
  {
    id: 4,
    group: TUNNELS,
    title: t("VPN: split va full tunnel", "VPNs: split and full tunnels"),
    minutes: 10,
    intro: t(
      "VPN qurilma va VPN serveri orasida shifrlangan tunnel quradi. Full tunnel’da butun trafik tunnel orqali ketadi; split tunnel’da esa faqat ofis manzillari, qolgani — to‘g‘ridan-to‘g‘ri. DNS so‘rovlari tunneldan tashqarida qolsa, qaysi saytlarga kirayotganingiz baribir ko‘rinadi (DNS leak).",
      "A VPN builds an encrypted tunnel between the device and the VPN server. In a full tunnel all traffic goes through it; in a split tunnel only the office addresses do and the rest goes direct. If DNS queries stay outside the tunnel, which sites you visit still shows (a DNS leak).",
    ),
    analogy: t(
      "Zirhli mashina: full tunnel — hamma yuk mashinada; split — faqat qimmatbaho qutilar, qolgani ochiq aravada.",
      "An armoured van: a full tunnel puts every parcel in the van; a split tunnel only the valuables, the rest on an open cart.",
    ),
    theory: [
      t(
        "VPN ishonchni ko‘chiradi: kafe tarmog‘i endi hech narsa ko‘rmaydi, lekin VPN provayderi hammasini ko‘radi — ishonchlisini tanlang.",
        "A VPN moves trust: the café network now sees nothing, but the VPN provider sees everything — pick one you trust.",
      ),
      t(
        "Zamonaviy protokollar: WireGuard va IPsec/IKEv2. PPTP eskirgan va buzilgan.",
        "Modern protocols: WireGuard and IPsec/IKEv2. PPTP is obsolete and broken.",
      ),
    ],
    task: t(
      "Kafe Wi-Fi’dagi hujumchi hech narsani ko‘rmasligi uchun VPN’ni sozlang.",
      "Set up the VPN so the attacker on the café Wi-Fi sees nothing.",
    ),
    hint: t(
      "Full tunnel va DNS ham tunnel orqali.",
      "A full tunnel, with DNS through it too.",
    ),
    widget: { type: "vpn" },
  },
  {
    id: 5,
    group: SHELL,
    title: t("SSH host kaliti", "The SSH host key"),
    minutes: 10,
    intro: t(
      "SSH birinchi ulanishda serverning kalit izini (fingerprint) ko‘rsatadi va “ishonasizmi?” deb so‘raydi. Keyin uni known_hosts fayliga yozadi. Keyingi safar kalit o‘zgargan bo‘lsa, “REMOTE HOST IDENTIFICATION HAS CHANGED” ogohlantirishi chiqadi — bu man-in-the-middle bo‘lishi mumkin.",
      "On the first connection SSH shows the server’s key fingerprint and asks whether you trust it. Then it saves it in known_hosts. If the key has changed next time, you get “REMOTE HOST IDENTIFICATION HAS CHANGED” — that may be a man in the middle.",
    ),
    analogy: t(
      "Yangi hamkasbni birinchi marta ko‘rganda guvohnomasini xodimlar bo‘limidagi ro‘yxat bilan solishtirasiz. Ertasi kuni boshqa yuzli odam “men o‘shaman” desa — ishonmaysiz.",
      "Meeting a new colleague, you check their badge against HR’s list. If someone with another face says “it’s me” the next day, you don’t believe them.",
    ),
    theory: [
      t(
        "Fingerprint’ni admin xavfsiz kanal orqali e’lon qilishi kerak (ichki wiki, SSHFP DNS yozuvi). Uni boshidan oxirigacha solishtiring, faqat boshini emas.",
        "The admin should publish the fingerprint over a safe channel (an internal wiki, an SSHFP DNS record). Compare it end to end, not just the start.",
      ),
    ],
    task: t(
      "Har bir ulanishda: davom etasizmi yoki to‘xtaysizmi?",
      "For each connection: go ahead or stop?",
    ),
    hint: t(
      "Ko‘rsatilgan iz e’lon qilingan bilan to‘liq mos bo‘lsagina ulaning.",
      "Connect only when the shown fingerprint matches the published one exactly.",
    ),
    widget: { type: "hostkey" },
  },
  {
    id: 6,
    group: SHELL,
    title: t("sshd sozlamalari", "Hardening sshd"),
    minutes: 6,
    intro: t(
      "Internetga ochiq SSH serveriga har kuni minglab bot parol taxmin qiladi. sshd_config’dagi bir necha qator ularni befoyda qiladi: faqat kalit bilan kirish, root’ga to‘g‘ridan-to‘g‘ri kirishni taqiqlash, faqat kerakli foydalanuvchilar.",
      "A server with SSH open to the internet gets thousands of bot password guesses a day. A few lines in sshd_config make them useless: keys only, no direct root login, and only the users who need it.",
    ),
    analogy: t(
      "Eshikka kod qulf o‘rniga kalitli qulf: kodni taxmin qilish mumkin, kalitni — yo‘q.",
      "A key lock instead of a keypad on the door: a code can be guessed, a key can’t.",
    ),
    theory: [
      t(
        "Shaxsiy kalit (~/.ssh/id_ed25519) parol bilan himoyalanadi va hech kimga berilmaydi; serverga faqat ochiq kalit (.pub) qo‘yiladi.",
        "The private key (~/.ssh/id_ed25519) is protected by a passphrase and given to nobody; only the public key (.pub) goes on the server.",
      ),
    ],
    task: t("Har bir sozlamani ajrating.", "Sort each setting."),
    hint: t(
      "Parol va root — bot’larning sevimli nishoni.",
      "Passwords and root are the bots’ favourite targets.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "good", label: t("Xavfsiz", "Safe") },
        { id: "bad", label: t("Xavfli", "Risky") },
      ],
      items: [
        {
          label: t("PasswordAuthentication no", "PasswordAuthentication no"),
          code: true,
          bucket: "good",
        },
        {
          label: t("PermitRootLogin no", "PermitRootLogin no"),
          code: true,
          bucket: "good",
        },
        {
          label: t("AllowUsers deploy", "AllowUsers deploy"),
          code: true,
          bucket: "good",
        },
        {
          label: t("PermitRootLogin yes", "PermitRootLogin yes"),
          code: true,
          bucket: "bad",
        },
        {
          label: t("PermitEmptyPasswords yes", "PermitEmptyPasswords yes"),
          code: true,
          bucket: "bad",
        },
        {
          label: t(
            "Jamoaga bitta umumiy id_ed25519 kaliti",
            "One shared id_ed25519 key for the whole team",
          ),
          bucket: "bad",
        },
      ],
    },
  },
  {
    id: 7,
    group: SHELL,
    title: t("SSH tunnellari", "SSH tunnels"),
    minutes: 6,
    intro: t(
      "SSH faqat buyruq qatori emas: u portlarni tunnel qila oladi. ssh -L 5432:localhost:5432 server — serverdagi bazani o‘z kompyuteringizda localhost:5432 da ochadi, bazani internetga ochmasdan. Bastion host (jump host) esa ichki serverlarga yagona nazorat qilinadigan kirish nuqtasi.",
      "SSH is more than a shell: it can tunnel ports. ssh -L 5432:localhost:5432 server opens the server’s database on localhost:5432 on your own computer, without exposing the database to the internet. A bastion (jump) host is the single, watched entry point to internal servers.",
    ),
    analogy: t(
      "Yer osti yo‘lagi: ikki bino orasida tashqariga chiqmasdan o‘tasiz.",
      "An underground passage: you go between two buildings without stepping outside.",
    ),
    theory: [
      t(
        "Agent forwarding (ssh -A) ehtiyotkorlik bilan: serverdagi root sizning agentingizdan boshqa serverlarga kirishi mumkin. ProxyJump xavfsizroq.",
        "Use agent forwarding (ssh -A) with care: root on the server can use your agent to reach other servers. ProxyJump is safer.",
      ),
    ],
    task: t("Savollarga javob bering.", "Answer the questions."),
    hint: t(
      "-L — mahalliy port, -J — jump host.",
      "-L is a local port, -J a jump host.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "Serverdagi PostgreSQL faqat localhost’da tinglaydi. Unga noutbukdan qanday xavfsiz ulanasiz?",
            "PostgreSQL on the server listens on localhost only. How do you reach it safely from your laptop?",
          ),
          options: [
            {
              uz: "ssh -L 5432:localhost:5432 server va localhost:5432 ga ulanish",
              en: "ssh -L 5432:localhost:5432 server, then connect to localhost:5432",
            },
            t(
              "5432-portni internetga ochish",
              "Open port 5432 to the internet",
            ),
            t("Bazani DMZ’ga ko‘chirish", "Move the database to the DMZ"),
          ],
          answer: 0,
          explain: t(
            "Baza hech qachon tashqaridan ko‘rinmaydi; trafik SSH ichida shifrlangan.",
            "The database is never visible from outside; the traffic is encrypted inside SSH.",
          ),
        },
        {
          ask: t(
            "Ichki serverlarga kirish uchun bastion host nimaga kerak?",
            "Why use a bastion host to reach internal servers?",
          ),
          options: [
            t(
              "Yagona, kuzatiladigan va mustahkamlangan kirish nuqtasi",
              "One watched, hardened way in",
            ),
            t("Trafikni tezlashtirish uchun", "To speed up traffic"),
            t("Parollarni saqlash uchun", "To store passwords"),
          ],
          answer: 0,
          explain: t(
            "Firewall faqat bastion’dan SSH’ni ruxsat etadi; har bir kirish log qilinadi.",
            "The firewall allows SSH only from the bastion; every login is logged.",
          ),
        },
        {
          ask: t(
            "Nega ssh -A (agent forwarding) xavfli bo‘lishi mumkin?",
            "Why can ssh -A (agent forwarding) be risky?",
          ),
          options: [
            t(
              "Serverdagi root agentingizdan foydalanib, boshqa serverlarga kira oladi",
              "Root on the server can use your agent to log in elsewhere",
            ),
            t("U kalitni o‘chirib yuboradi", "It deletes your key"),
            t(
              "Xavfsiz, hech qanday muammo yo‘q",
              "It is safe, no problem at all",
            ),
          ],
          answer: 0,
          explain: t(
            "ProxyJump (ssh -J) agentni serverga bermaydi.",
            "ProxyJump (ssh -J) doesn’t hand your agent to the server.",
          ),
        },
      ],
    },
  },
  {
    id: 8,
    group: SHELL,
    title: t("Yakuniy savollar", "Final questions"),
    minutes: 6,
    intro: t(
      "Modulni takrorlaymiz: qaysi vosita nimani himoya qiladi, Wi-Fi rejimlari, soxta nuqtalar, VPN tunnellari, SSH host kalitlari va sozlamalari.",
      "A review of the module: which tool protects what, Wi-Fi modes, fake access points, VPN tunnels, SSH host keys and settings.",
    ),
    analogy: t(
      "Xavfsiz ulanish — zanjir: eng zaif halqasi qanchalik kuchli bo‘lsa, shunchalik.",
      "A secure connection is a chain: as strong as its weakest link.",
    ),
    theory: [
      t(
        "Keyingi modul — hujumni aniqlash (IDS): himoyadan o‘tib ketganini qanday ko‘rish.",
        "The next module is intrusion detection: how to see what got past the defences.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Offline hujum — WPA2’ning zaif joyi.",
      "Offline attacks are WPA2’s weak spot.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "WPA3 (SAE) WPA2-PSK’dan nimasi bilan kuchli?",
            "What makes WPA3 (SAE) stronger than WPA2-PSK?",
          ),
          options: [
            t(
              "Yozib olingan handshake’ni offline buzib bo‘lmaydi",
              "A recorded handshake can’t be cracked offline",
            ),
            t("Parol kerak emas", "No password is needed"),
            t("Signal uzoqroqqa yetadi", "The signal reaches further"),
          ],
          answer: 0,
          explain: t(
            "Har bir taxmin tarmoqqa jonli urinish bo‘ladi.",
            "Every guess becomes a live attempt on the network.",
          ),
        },
        {
          ask: t(
            "Split tunnel VPN kafe Wi-Fi’da nimani yashirmaydi?",
            "What does a split-tunnel VPN not hide on café Wi-Fi?",
          ),
          options: [
            t(
              "Ofisdan tashqari saytlarga trafikni",
              "Traffic to sites outside the office",
            ),
            t("Ofis serveriga trafikni", "Traffic to the office server"),
            t("Hech narsani yashirmaydi", "It hides nothing"),
          ],
          answer: 0,
          explain: t(
            "Split tunnel’da faqat ofis manzillari tunneldan o‘tadi.",
            "In a split tunnel only office addresses go through the tunnel.",
          ),
        },
        {
          ask: t(
            "SSH “REMOTE HOST IDENTIFICATION HAS CHANGED” dedi, admin hech narsa e’lon qilmagan. Nima qilasiz?",
            "SSH says “REMOTE HOST IDENTIFICATION HAS CHANGED” and the admin announced nothing. What do you do?",
          ),
          options: [
            t("To‘xtayman va adminga xabar beraman", "Stop and tell the admin"),
            t(
              "known_hosts’dan qatorni o‘chirib, qayta ulanaman",
              "Delete the line from known_hosts and connect again",
            ),
            t("“yes” deb davom etaman", "Type “yes” and go on"),
          ],
          answer: 0,
          explain: t(
            "Bu man-in-the-middle bo‘lishi mumkin — kalitni xavfsiz kanal orqali tekshiring.",
            "It may be a man in the middle — check the key over a safe channel.",
          ),
        },
        {
          ask: t(
            "SSH serverga kirishning eng xavfsiz usuli?",
            "The safest way to log in to an SSH server?",
          ),
          options: [
            t(
              "Parol bilan himoyalangan shaxsiy kalit, parol orqali kirish o‘chirilgan",
              "A passphrase-protected private key, with password login turned off",
            ),
            t("root va kuchli parol", "root with a strong password"),
            t("Jamoa uchun bitta umumiy kalit", "One shared key for the team"),
          ],
          answer: 0,
          explain: t(
            "Kalitni taxmin qilib bo‘lmaydi; har kimning o‘z kaliti — har kimning o‘z izi.",
            "A key can’t be guessed; everyone’s own key leaves everyone’s own trail.",
          ),
        },
      ],
    },
  },
];
