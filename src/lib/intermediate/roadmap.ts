// Academy Intermediate: the plan of the second level, domain by domain. Each
// domain lists its modules with key topics and a learning goal. Modules are
// filled in over time, inside the academy's isolated browser labs.

import type { LabId } from "@/lib/lab-progress";

export type Text = { uz: string; en: string };

export type Module = {
  title: Text;
  /** Key terms, written the way the field writes them. */
  topics: string[];
  /** What the student should be able to do after the module. */
  goal: Text;
  /** The module's lab, once it is open. */
  href?: string;
  /** Its lesson progress key, for the teacher panel. */
  lab?: LabId;
};

export type Domain = {
  id: string;
  short: string;
  title: Text;
  summary: Text;
  /** Academy labs to finish first. */
  needs: string[];
  phase: 1 | 2 | 3;
  modules: Module[];
};

export const BEGINNER_LABS: Record<string, Text> = {
  network: { uz: "IP manzillar labi", en: "IP addressing lab" },
  linux: { uz: "Linux asoslari", en: "Linux foundations" },
  html: { uz: "HTML asoslari", en: "HTML foundations" },
  security: { uz: "Veb-xavfsizlik labi", en: "Web security lab" },
};

export const PHASES: { phase: 1 | 2 | 3; title: Text; about: Text }[] = [
  {
    phase: 1,
    title: { uz: "1-bosqich: yadro", en: "Phase 1: the core" },
    about: {
      uz: "Har bir kiberxavfsizlik mutaxassisiga kerak bo‘lgan yo‘nalishlar. Birinchi bo‘lib to‘ldiriladi.",
      en: "The domains every security specialist needs. They are filled in first.",
    },
  },
  {
    phase: 2,
    title: {
      uz: "2-bosqich: tergov va mudofaa",
      en: "Phase 2: investigation and defence",
    },
    about: {
      uz: "Izlarni o‘rganish, yashirin ma’lumotni topish va hodisalarni aniqlash.",
      en: "Studying traces, finding hidden data and detecting incidents.",
    },
  },
  {
    phase: 3,
    title: { uz: "3-bosqich: chuqurlashish", en: "Phase 3: going deeper" },
    about: {
      uz: "Kod, tizimlar, bulut va inson omili: mutaxassislikka olib boradigan yo‘nalishlar.",
      en: "Code, systems, the cloud and people: the domains that lead to a specialism.",
    },
  },
];

const goal = (uz: string, en: string): Text => ({ uz, en });

export const DOMAINS: Domain[] = [
  {
    id: "webappsec",
    short: "WebAppSec",
    phase: 1,
    title: { uz: "Veb-ilovalar xavfsizligi", en: "Web application security" },
    summary: {
      uz: "OWASP Top 10 zaifliklari qanday paydo bo‘lishi, qanday aniqlanishi va qanday tuzatilishi.",
      en: "How the OWASP Top 10 weaknesses arise, how they are found and how they are fixed.",
    },
    needs: ["html", "security"],
    modules: [
      {
        title: { uz: "HTTP chuqurroq", en: "HTTP in depth" },
        href: "/intermediate/http",
        lab: "http",
        topics: ["cookies", "sessions", "SOP", "CORS", "security headers"],
        goal: goal(
          "So‘rov va javobni o‘qiy olish, sessiya qanday saqlanishini tushuntirish.",
          "Read requests and responses and explain how a session is kept.",
        ),
      },
      {
        title: { uz: "Kiritilgan ma’lumot xavfi", en: "Untrusted input" },
        href: "/intermediate/input",
        lab: "input",
        topics: [
          "injection",
          "parameterized queries",
          "validation",
          "encoding",
        ],
        goal: goal(
          "Nega foydalanuvchi ma’lumotiga ishonib bo‘lmasligini va to‘g‘ri himoyani ko‘rsatish.",
          "Show why user input cannot be trusted and apply the right defence.",
        ),
      },
      {
        title: { uz: "Brauzer tomonidagi xavflar", en: "Browser-side risks" },
        href: "/intermediate/browser",
        lab: "browser",
        topics: ["XSS", "CSP", "output encoding", "CSRF", "SameSite"],
        goal: goal(
          "Sahifaga begona skript tushishining oldini olish usullarini qo‘llash.",
          "Apply the ways to keep foreign scripts out of a page.",
        ),
      },
      {
        title: { uz: "Kirish nazorati", en: "Access control" },
        href: "/intermediate/access",
        lab: "access",
        topics: ["authentication", "authorization", "IDOR", "JWT", "MFA"],
        goal: goal(
          "“Kim?” va “nimaga ruxsat?” savollarini to‘g‘ri tekshiradigan kodni tanib olish.",
          "Recognise code that checks “who?” and “allowed to what?” correctly.",
        ),
      },
      {
        title: { uz: "API xavfsizligi", en: "API security" },
        href: "/intermediate/api",
        lab: "api",
        topics: ["OWASP API Top 10", "rate limiting", "schemas", "tokens"],
        goal: goal(
          "API ni xavfsizlik ro‘yxati bo‘yicha ko‘rib chiqish va kamchiliklarni yozish.",
          "Review an API against a security checklist and write up the gaps.",
        ),
      },
    ],
  },
  {
    id: "crypto",
    short: "Crypto",
    phase: 1,
    title: { uz: "Kriptografiya", en: "Cryptography" },
    summary: {
      uz: "Shifrlash, xesh va imzolar qanday ishlaydi, qayerda ishlatiladi va qanday xatolar uni zaiflashtiradi.",
      en: "How encryption, hashes and signatures work, where they are used and which mistakes weaken them.",
    },
    needs: ["network"],
    modules: [
      {
        title: { uz: "Klassik shifrlar", en: "Classical ciphers" },
        href: "/intermediate/classic",
        lab: "classic",
        topics: ["Caesar", "Vigenère", "frequency analysis"],
        goal: goal(
          "Nega eski shifrlar bugun himoya bermasligini tushuntirish.",
          "Explain why old ciphers protect nothing today.",
        ),
      },
      {
        title: { uz: "Simmetrik shifrlash", en: "Symmetric encryption" },
        href: "/intermediate/symmetric",
        lab: "symmetric",
        topics: ["AES", "block modes", "IV/nonce", "key management"],
        goal: goal(
          "To‘g‘ri rejim va kalit boshqaruvini tanlash.",
          "Choose the right mode and key handling.",
        ),
      },
      {
        title: { uz: "Xesh va parollar", en: "Hashes and passwords" },
        href: "/intermediate/hashes",
        lab: "hashes",
        topics: ["SHA-2", "salt", "bcrypt", "argon2", "HMAC"],
        goal: goal(
          "Parollarni xavfsiz saqlash usulini tanlash va asoslash.",
          "Pick and justify a safe way to store passwords.",
        ),
      },
      {
        title: {
          uz: "Ochiq kalitli kriptografiya",
          en: "Public-key cryptography",
        },
        href: "/intermediate/pubkey",
        lab: "pubkey",
        topics: ["RSA", "Diffie–Hellman", "ECC", "signatures"],
        goal: goal(
          "Kalit almashish va raqamli imzo g‘oyasini tushuntirish.",
          "Explain key exchange and digital signatures.",
        ),
      },
      {
        title: { uz: "TLS va sertifikatlar", en: "TLS and certificates" },
        href: "/intermediate/tls",
        lab: "tls",
        topics: ["PKI", "certificate chain", "HTTPS", "HSTS"],
        goal: goal(
          "Sertifikat zanjirini tekshirish va HTTPS sozlamasini baholash.",
          "Check a certificate chain and assess an HTTPS setup.",
        ),
      },
    ],
  },
  {
    id: "netsec",
    short: "NetSec",
    phase: 1,
    title: { uz: "Tarmoq xavfsizligi", en: "Network security" },
    summary: {
      uz: "Tarmoq trafigini tushunish, segmentlash va himoya vositalarini sozlash.",
      en: "Understanding network traffic, segmenting networks and configuring defences.",
    },
    needs: ["network", "linux"],
    modules: [
      {
        title: { uz: "TCP/IP chuqurroq", en: "TCP/IP in depth" },
        href: "/intermediate/tcpip",
        lab: "tcpip",
        topics: ["handshake", "ports", "UDP", "ICMP", "DNS"],
        goal: goal(
          "Ulanish qanday o‘rnatilishini bosqichma-bosqich tushuntirish.",
          "Explain step by step how a connection is set up.",
        ),
      },
      {
        title: { uz: "Trafik tahlili", en: "Traffic analysis" },
        href: "/intermediate/traffic",
        lab: "traffic",
        topics: ["pcap", "Wireshark filters", "protocol fields"],
        goal: goal(
          "Tayyor yozuvdan g‘ayrioddiy ulanishlarni topish.",
          "Spot unusual connections in a recorded capture.",
        ),
      },
      {
        title: {
          uz: "Firewall va segmentlash",
          en: "Firewalls and segmentation",
        },
        href: "/intermediate/firewall",
        lab: "firewall",
        topics: ["rules", "DMZ", "VLAN", "least privilege"],
        goal: goal(
          "Kichik tarmoq uchun xavfsiz qoidalar to‘plamini loyihalash.",
          "Design a safe rule set for a small network.",
        ),
      },
      {
        title: { uz: "Xavfsiz ulanishlar", en: "Secure connections" },
        href: "/intermediate/connections",
        lab: "connections",
        topics: ["VPN", "SSH", "Wi‑Fi security", "WPA3"],
        goal: goal(
          "Masofaviy ulanish uchun to‘g‘ri himoyani tanlash.",
          "Choose the right protection for remote access.",
        ),
      },
      {
        title: { uz: "Hujumni aniqlash", en: "Intrusion detection" },
        topics: ["IDS/IPS", "Suricata", "signatures", "anomalies"],
        goal: goal(
          "Aniqlash qoidasi nimani ushlashini o‘qib tushunish.",
          "Read a detection rule and say what it catches.",
        ),
      },
    ],
  },
  {
    id: "forensics",
    short: "DFIR",
    phase: 2,
    title: {
      uz: "Raqamli kriminalistika va hodisaga javob",
      en: "Digital forensics and incident response",
    },
    summary: {
      uz: "Dalillarni to‘g‘ri yig‘ish, voqealar xronologiyasini tiklash va hodisaga javob berish jarayoni.",
      en: "Collecting evidence properly, rebuilding a timeline of events and the incident response process.",
    },
    needs: ["linux"],
    modules: [
      {
        title: { uz: "Dalil bilan ishlash", en: "Handling evidence" },
        topics: ["chain of custody", "hashing evidence", "imaging"],
        goal: goal(
          "Dalil o‘zgarmaganini isbotlash usullarini qo‘llash.",
          "Show that evidence has not been changed.",
        ),
      },
      {
        title: { uz: "Fayl tizimlari", en: "File systems" },
        topics: ["timestamps", "deleted files", "timeline"],
        goal: goal(
          "Fayl vaqt belgilaridan voqealar ketma-ketligini tuzish.",
          "Build a sequence of events from file timestamps.",
        ),
      },
      {
        title: { uz: "Loglar va artefaktlar", en: "Logs and artefacts" },
        topics: ["event logs", "auth logs", "browser history"],
        goal: goal(
          "Loglardan kim, qachon va nima qilganini aniqlash.",
          "Tell from logs who did what, and when.",
        ),
      },
      {
        title: { uz: "Hodisaga javob", en: "Incident response" },
        topics: [
          "NIST lifecycle",
          "containment",
          "recovery",
          "lessons learned",
        ],
        goal: goal(
          "Hodisa bo‘yicha javob rejasini bosqichlarga bo‘lib yozish.",
          "Write a response plan for an incident, stage by stage.",
        ),
      },
      {
        title: { uz: "Hisobot yozish", en: "Writing the report" },
        topics: ["findings", "evidence", "recommendations"],
        goal: goal(
          "Texnik bo‘lmagan o‘quvchi ham tushunadigan hisobot tayyorlash.",
          "Write a report a non-technical reader understands.",
        ),
      },
    ],
  },
  {
    id: "stego",
    short: "Stego",
    phase: 2,
    title: { uz: "Steganografiya", en: "Steganography" },
    summary: {
      uz: "Ma’lumotni rasm, ovoz va fayllar ichiga yashirish usullari va ularni aniqlash.",
      en: "How data is hidden inside images, audio and files, and how it is found.",
    },
    needs: ["linux"],
    modules: [
      {
        title: { uz: "Asosiy g‘oya", en: "The idea" },
        topics: ["cover file", "payload", "stego vs crypto"],
        goal: goal(
          "Steganografiya va shifrlash farqini tushuntirish.",
          "Explain the difference between hiding and encrypting.",
        ),
      },
      {
        title: { uz: "Rasm ichida", en: "Inside images" },
        topics: ["pixels", "LSB", "colour channels"],
        goal: goal(
          "Rasm piksellarida yashirilgan xabarni topish.",
          "Find a message hidden in an image's pixels.",
        ),
      },
      {
        title: { uz: "Metama’lumotlar", en: "Metadata" },
        topics: ["EXIF", "GPS tags", "document properties"],
        goal: goal(
          "Fayl metama’lumotlari nimani oshkor qilishini aniqlash va tozalash.",
          "See what file metadata gives away, and remove it.",
        ),
      },
      {
        title: { uz: "Ovoz va fayl formatlari", en: "Audio and file formats" },
        topics: ["spectrogram", "magic bytes", "appended data"],
        goal: goal(
          "Fayl turi va ichidagi qo‘shimcha ma’lumotni aniqlash.",
          "Identify a file's real type and any extra data inside it.",
        ),
      },
      {
        title: { uz: "Steganaliz", en: "Steganalysis" },
        topics: ["statistics", "binwalk", "exiftool"],
        goal: goal(
          "Fayl ichida yashirin narsa borligini belgilardan aniqlash.",
          "Tell from the signs that a file carries something hidden.",
        ),
      },
    ],
  },
  {
    id: "blueteam",
    short: "Blue team",
    phase: 2,
    title: {
      uz: "SOC va mudofaa (Blue team)",
      en: "SOC and defence (blue team)",
    },
    summary: {
      uz: "Xavfsizlik markazida ishlash: loglarni yig‘ish, ogohlantirishlarni saralash va tahdidlarni izlash.",
      en: "Working in a security operations centre: collecting logs, triaging alerts and hunting threats.",
    },
    needs: ["linux", "network"],
    modules: [
      {
        title: { uz: "Loglar va SIEM", en: "Logs and SIEM" },
        topics: ["log sources", "normalisation", "dashboards"],
        goal: goal(
          "Qaysi loglar kerakligini va ular qanday birlashtirilishini tushuntirish.",
          "Explain which logs matter and how they are brought together.",
        ),
      },
      {
        title: { uz: "Aniqlash qoidalari", en: "Detection rules" },
        topics: ["Sigma", "thresholds", "false positives"],
        goal: goal(
          "Oddiy aniqlash qoidasini yozish va sozlash.",
          "Write and tune a simple detection rule.",
        ),
      },
      {
        title: { uz: "Ogohlantirishni saralash", en: "Alert triage" },
        topics: ["severity", "context", "escalation"],
        goal: goal(
          "Ogohlantirish haqiqiy xavfmi yoki yo‘qligini asoslab hal qilish.",
          "Decide, with reasons, whether an alert is a real threat.",
        ),
      },
      {
        title: { uz: "Tahdid izlash", en: "Threat hunting" },
        topics: ["MITRE ATT&CK", "hypotheses", "IOC"],
        goal: goal(
          "ATT&CK xaritasi asosida izlash rejasini tuzish.",
          "Plan a hunt using the ATT&CK map.",
        ),
      },
      {
        title: { uz: "Fishing tahlili", en: "Phishing analysis" },
        topics: ["email headers", "SPF/DKIM/DMARC", "links"],
        goal: goal(
          "Shubhali xatni tekshirib, xulosa yozish.",
          "Examine a suspicious email and write a verdict.",
        ),
      },
    ],
  },
  {
    id: "osint",
    short: "OSINT",
    phase: 2,
    title: { uz: "Ochiq manbalar razvedkasi", en: "Open-source intelligence" },
    summary: {
      uz: "Ochiq ma’lumotlardan qonuniy va axloqiy tarzda xulosa chiqarish, o‘z izingizni himoyalash.",
      en: "Drawing conclusions from public information legally and ethically, and protecting your own footprint.",
    },
    needs: ["network"],
    modules: [
      {
        title: { uz: "Axloq va qonun", en: "Ethics and law" },
        topics: ["consent", "privacy", "scope"],
        goal: goal(
          "Qaysi izlanish ruxsat etilgani va qaysi biri yo‘qligini ajratish.",
          "Tell which research is allowed and which is not.",
        ),
      },
      {
        title: { uz: "Qidiruv texnikasi", en: "Search technique" },
        topics: ["search operators", "archives", "verification"],
        goal: goal(
          "Topilgan ma’lumotni bir nechta manba bilan tasdiqlash.",
          "Confirm a finding with several sources.",
        ),
      },
      {
        title: {
          uz: "Domen va infratuzilma",
          en: "Domains and infrastructure",
        },
        topics: ["WHOIS", "DNS records", "certificate transparency"],
        goal: goal(
          "Tashkilotning ochiq infratuzilmasini xaritaga tushirish.",
          "Map an organisation's public infrastructure.",
        ),
      },
      {
        title: { uz: "Rasm va joylashuv", en: "Images and location" },
        topics: ["reverse image search", "landmarks", "metadata"],
        goal: goal(
          "Rasm qayerda olinganini belgilardan aniqlash.",
          "Work out from clues where a photo was taken.",
        ),
      },
      {
        title: { uz: "Raqamli iz", en: "Digital footprint" },
        topics: ["privacy settings", "data brokers", "self-audit"],
        goal: goal(
          "O‘z raqamli izingizni tekshirib, kamaytirish rejasini tuzish.",
          "Audit your own footprint and plan how to shrink it.",
        ),
      },
    ],
  },
  {
    id: "appsec",
    short: "AppSec",
    phase: 3,
    title: {
      uz: "Ilova xavfsizligi va xavfsiz kod",
      en: "Application security and secure code",
    },
    summary: {
      uz: "Xavfsizlikni dastur loyihalash bosqichidan boshlash: tahdid modeli, xavfsiz kod va avtomatik tekshiruvlar.",
      en: "Building security in from the design: threat models, secure code and automated checks.",
    },
    needs: ["html", "security"],
    modules: [
      {
        title: { uz: "Tahdid modeli", en: "Threat modelling" },
        topics: ["STRIDE", "data flow diagrams", "trust boundaries"],
        goal: goal(
          "Kichik ilova uchun tahdid modelini chizish.",
          "Draw a threat model for a small application.",
        ),
      },
      {
        title: { uz: "Xavfsiz kod yozish", en: "Secure coding" },
        topics: ["validation", "error handling", "secrets", "logging"],
        goal: goal(
          "Kod parchasidagi xavfsizlik kamchiliklarini topib tuzatish.",
          "Find and fix the security flaws in a piece of code.",
        ),
      },
      {
        title: {
          uz: "Kutubxonalar va ta’minot zanjiri",
          en: "Dependencies and supply chain",
        },
        topics: ["SCA", "lockfiles", "SBOM", "updates"],
        goal: goal(
          "Loyiha kutubxonalarini zaifliklarga tekshirish.",
          "Check a project's dependencies for known issues.",
        ),
      },
      {
        title: { uz: "Avtomatik tekshiruvlar", en: "Automated testing" },
        topics: ["SAST", "DAST", "CI checks", "DevSecOps"],
        goal: goal(
          "CI ga xavfsizlik tekshiruvini qo‘shish.",
          "Add a security check to a CI pipeline.",
        ),
      },
      {
        title: { uz: "Kod ko‘rigi", en: "Code review" },
        topics: ["checklists", "review comments", "risk rating"],
        goal: goal(
          "Pull request ni xavfsizlik nuqtai nazaridan ko‘rib chiqish.",
          "Review a pull request from a security point of view.",
        ),
      },
    ],
  },
  {
    id: "syssec",
    short: "SysSec",
    phase: 3,
    title: { uz: "Tizim xavfsizligi", en: "System security" },
    summary: {
      uz: "Linux va Windows tizimlarini mustahkamlash, ruxsatlarni to‘g‘ri sozlash va kirishni boshqarish.",
      en: "Hardening Linux and Windows systems, setting permissions properly and managing access.",
    },
    needs: ["linux"],
    modules: [
      {
        title: { uz: "Linux mustahkamlash", en: "Linux hardening" },
        topics: ["permissions", "SUID", "sudo", "services"],
        goal: goal(
          "Tizimdagi xavfli sozlamalarni topib, tuzatish.",
          "Find risky settings on a system and fix them.",
        ),
      },
      {
        title: { uz: "Windows asoslari", en: "Windows basics" },
        topics: ["accounts", "ACL", "Group Policy", "Active Directory"],
        goal: goal(
          "Windows da foydalanuvchi va ruxsatlar tuzilishini tushuntirish.",
          "Explain how Windows organises users and permissions.",
        ),
      },
      {
        title: {
          uz: "Ruxsatlarni oshirish xavfi",
          en: "Privilege escalation risks",
        },
        topics: ["misconfigurations", "least privilege", "auditing"],
        goal: goal(
          "Ortiqcha ruxsatlar qanday xavf tug‘dirishini va oldini olishni ko‘rsatish.",
          "Show how excess privilege creates risk, and how to prevent it.",
        ),
      },
      {
        title: { uz: "Autentifikatsiya", en: "Authentication" },
        topics: ["password policy", "MFA", "SSH keys"],
        goal: goal("Kirish siyosatini loyihalash.", "Design a sign-in policy."),
      },
      {
        title: {
          uz: "Yangilanish va bazaviy sozlamalar",
          en: "Patching and baselines",
        },
        topics: ["CIS benchmarks", "patch management", "configuration drift"],
        goal: goal(
          "Tizimni bazaviy talablar bilan solishtirish.",
          "Compare a system against a security baseline.",
        ),
      },
    ],
  },
  {
    id: "reverse",
    short: "Reverse",
    phase: 3,
    title: {
      uz: "Reverse engineering asoslari",
      en: "Reverse engineering basics",
    },
    summary: {
      uz: "Dastur ichida nima bo‘layotganini tushunish: kompilyatsiya, assembler asoslari va zararli dasturlarni tahlil qilish tamoyillari.",
      en: "Understanding what happens inside a program: compilation, assembly basics and the principles of malware analysis.",
    },
    needs: ["linux"],
    modules: [
      {
        title: { uz: "Dastur qanday quriladi", en: "How programs are built" },
        topics: ["compiler", "ELF/PE", "sections", "linking"],
        goal: goal(
          "Bajariladigan fayl tuzilishini tushuntirish.",
          "Explain how an executable file is laid out.",
        ),
      },
      {
        title: { uz: "Assembler asoslari", en: "Assembly basics" },
        topics: ["registers", "stack", "calls", "x86-64"],
        goal: goal(
          "Kichik funksiyaning assembler kodini o‘qish.",
          "Read the assembly of a small function.",
        ),
      },
      {
        title: { uz: "Statik tahlil", en: "Static analysis" },
        topics: ["strings", "disassembler", "Ghidra"],
        goal: goal(
          "Dasturni ishga tushirmasdan nima qilishini aniqlash.",
          "Work out what a program does without running it.",
        ),
      },
      {
        title: { uz: "Crackme mashqlari", en: "Crackme exercises" },
        topics: ["debugger", "breakpoints", "logic"],
        goal: goal(
          "O‘quv dasturining tekshiruv mantiqini tushunib, javobni topish.",
          "Understand a training program's check and find the answer.",
        ),
      },
      {
        title: {
          uz: "Zararli dasturlar tamoyillari",
          en: "Malware principles",
        },
        topics: ["behaviour", "sandboxes", "YARA", "IOC"],
        goal: goal(
          "Shubhali fayl belgilarini aniqlash qoidasini yozish.",
          "Write a rule that recognises a suspicious file.",
        ),
      },
    ],
  },
  {
    id: "cloud",
    short: "Cloud",
    phase: 3,
    title: {
      uz: "Bulut va konteyner xavfsizligi",
      en: "Cloud and container security",
    },
    summary: {
      uz: "Bulut xizmatlari va konteynerlarda eng ko‘p uchraydigan sozlash xatolari va ularning oldini olish.",
      en: "The most common configuration mistakes in cloud services and containers, and how to avoid them.",
    },
    needs: ["linux", "network"],
    modules: [
      {
        title: { uz: "Mas’uliyat taqsimoti", en: "Shared responsibility" },
        topics: ["IaaS", "PaaS", "SaaS"],
        goal: goal(
          "Bulutda nima uchun kim javob berishini tushuntirish.",
          "Explain who is responsible for what in the cloud.",
        ),
      },
      {
        title: { uz: "IAM", en: "IAM" },
        topics: ["roles", "policies", "least privilege"],
        goal: goal(
          "Minimal ruxsatli siyosat yozish.",
          "Write a least-privilege policy.",
        ),
      },
      {
        title: { uz: "Saqlash va maxfiy kalitlar", en: "Storage and secrets" },
        topics: ["public buckets", "encryption at rest", "secret managers"],
        goal: goal(
          "Ochiq qolgan ma’lumotlarni topib, yopish.",
          "Find exposed data and lock it down.",
        ),
      },
      {
        title: { uz: "Konteynerlar", en: "Containers" },
        topics: ["Docker", "images", "non-root", "scanning"],
        goal: goal(
          "Xavfsizroq Dockerfile yozish.",
          "Write a safer Dockerfile.",
        ),
      },
      {
        title: { uz: "Kubernetes asoslari", en: "Kubernetes basics" },
        topics: ["pods", "RBAC", "network policies"],
        goal: goal(
          "Klaster sozlamalaridagi xavflarni aniqlash.",
          "Spot risks in a cluster configuration.",
        ),
      },
    ],
  },
  {
    id: "human",
    short: "Human",
    phase: 3,
    title: {
      uz: "Ijtimoiy muhandislik va xavfsizlik madaniyati",
      en: "Social engineering and security culture",
    },
    summary: {
      uz: "Odamlarni aldash usullarini tanib olish va jamoada xavfsizlik odatlarini shakllantirish.",
      en: "Recognising how people are manipulated and building security habits in a team.",
    },
    needs: [],
    modules: [
      {
        title: { uz: "Aldash usullari", en: "Manipulation tactics" },
        topics: ["phishing", "pretexting", "urgency", "authority"],
        goal: goal(
          "Xabardagi aldash belgilarini topish.",
          "Find the signs of manipulation in a message.",
        ),
      },
      {
        title: { uz: "Shaxsiy himoya", en: "Personal protection" },
        topics: ["password managers", "MFA", "updates", "backups"],
        goal: goal(
          "Shaxsiy xavfsizlik rejasini tuzish.",
          "Make a personal security plan.",
        ),
      },
      {
        title: { uz: "Xabardorlik dasturlari", en: "Awareness programmes" },
        topics: ["training", "simulations", "metrics"],
        goal: goal(
          "Kichik jamoa uchun xabardorlik mashg‘ulotini rejalashtirish.",
          "Plan an awareness session for a small team.",
        ),
      },
      {
        title: { uz: "Hodisani xabar qilish", en: "Reporting incidents" },
        topics: ["reporting channels", "blameless culture"],
        goal: goal(
          "Hodisa haqida tez va to‘g‘ri xabar berish tartibini yozish.",
          "Write how to report an incident quickly and correctly.",
        ),
      },
    ],
  },
];

/** Career paths through the domains. */
export const PATHS: { title: Text; domains: string[] }[] = [
  {
    title: { uz: "Pentester", en: "Penetration tester" },
    domains: ["webappsec", "netsec", "syssec", "reverse"],
  },
  {
    title: { uz: "SOC tahlilchisi", en: "SOC analyst" },
    domains: ["blueteam", "netsec", "forensics", "osint"],
  },
  {
    title: { uz: "AppSec muhandisi", en: "AppSec engineer" },
    domains: ["appsec", "webappsec", "crypto", "cloud"],
  },
  {
    title: { uz: "Kriminalist", en: "Forensic investigator" },
    domains: ["forensics", "stego", "osint", "reverse"],
  },
];

/** The modules whose labs are open now. */
export const OPEN_MODULES = DOMAINS.flatMap((d) => d.modules).filter(
  (m): m is Module & { href: string } => Boolean(m.href),
);
