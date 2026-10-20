// Academy · SSH: how remote connection works. Animated lessons on the shared
// widgets (../anim-lab/types) plus a pretend SSH client (./sim) with the host
// key question, passwords, key pairs and a remote shell.
import {
  restoreLessons,
  type CommonWidget,
  type Lesson,
  type Text,
} from "../anim-lab/types";
import type { Sim } from "./sim";

export type SshGoal = { label: Text; check: (sim: Sim) => boolean };

export type Widget = CommonWidget | { type: "ssh"; goals: SshGoal[] };

const t = (uz: string, en: string): Text => ({ uz, en });

const REMOTE = t("Masofaviy ulanish", "Remote access");
const KEYS = t("Kalitlar bilan kirish", "Signing in with keys");
const SAFE = t("Xavfsiz amaliyot", "Safe practice");

const YOU = {
  id: "you",
  label: t("Noutbuk", "Laptop"),
  icon: "laptop",
} as const;
const SERVER = {
  id: "server",
  label: t("server.uz", "server.uz"),
  icon: "server",
} as const;

const did = (sim: Sim, name: string) => sim.events.includes(name);

export const LESSONS: Lesson<Widget>[] = [
  {
    id: 1,
    group: REMOTE,
    title: t("SSH nima", "What SSH is"),
    minutes: 6,
    intro: t(
      "SSH (Secure Shell) — boshqa kompyuterning terminaliga tarmoq orqali xavfsiz ulanish usuli. Serverlar odatda monitor va klaviaturasiz turadi — ular bilan aynan SSH orqali ishlanadi.",
      "SSH (Secure Shell) is a safe way to reach another computer’s terminal over the network. Servers usually have no screen or keyboard — people work on them through SSH.",
    ),
    analogy: t(
      "Uzoq shahardagi kompyuterning klaviaturasi sizning stolingizda turgandek: yozgan har bir buyruq shifrlangan quvur orqali o‘sha yerda bajariladi.",
      "As if the keyboard of a computer in a faraway city were on your desk: every command you type runs over there, through an encrypted pipe.",
    ),
    theory: [
      t(
        "SSH 22-portda ishlaydi. U ham HTTPS kabi avval shifrlangan kanal quradi, keyin foydalanuvchini tekshiradi.",
        "SSH listens on port 22. Like HTTPS, it first builds an encrypted channel, then checks who you are.",
      ),
      t(
        "Eski Telnet protokoli ham shu ishni qilardi, lekin hamma narsani — parolni ham — ochiq yuborardi. SSH uning xavfsiz o‘rnini bosuvchisi.",
        "The old Telnet protocol did the same job but sent everything — passwords too — in the open. SSH is its safe replacement.",
      ),
    ],
    task: t(
      "SSH ulanishini boshidan oxirigacha kuzating.",
      "Follow an SSH connection from start to finish.",
    ),
    hint: t("“Ijro”ni bosing.", "Press Play."),
    widget: {
      type: "sequence",
      actors: [YOU, SERVER],
      steps: [
        {
          from: "you",
          to: "server",
          label: "TCP :22",
          detail: t(
            "Noutbuk serverning 22-portiga ulanadi.",
            "The laptop connects to the server’s port 22.",
          ),
        },
        {
          from: "server",
          to: "you",
          label: "host key",
          detail: t(
            "Server o‘zining kalitini ko‘rsatadi — “men haqiqatan server.uz man”. Mijoz uni avval saqlanganiga solishtiradi.",
            "The server shows its host key — “I really am server.uz”. The client compares it with the one saved before.",
          ),
        },
        {
          from: "you",
          to: "server",
          label: "key exchange",
          tone: "locked",
          detail: t(
            "Ikkala tomon umumiy sessiya kalitini hosil qiladi. Bundan keyin hamma narsa shifrlangan.",
            "Both sides derive a shared session key. From here on everything is encrypted.",
          ),
        },
        {
          from: "you",
          to: "server",
          label: "auth: ali",
          tone: "locked",
          detail: t(
            "Foydalanuvchi tekshiriladi: parol yoki (yaxshirog‘i) kalit bilan.",
            "The user is checked: with a password or (better) with a key.",
          ),
        },
        {
          from: "server",
          to: "you",
          label: "shell ready",
          tone: "ok",
          detail: t(
            "Serverdagi terminal ochildi.",
            "A terminal on the server opens.",
          ),
        },
        {
          from: "you",
          to: "server",
          label: "ls",
          tone: "locked",
          detail: t(
            "Siz yozgan buyruq shifrlangan holda ketadi…",
            "The command you type travels encrypted…",
          ),
        },
        {
          from: "server",
          to: "you",
          label: "backup.sh logs site",
          tone: "locked",
          detail: t(
            "…va server javobi ham shifrlangan qaytadi.",
            "…and the server’s answer comes back encrypted too.",
          ),
        },
      ],
    },
  },
  {
    id: 2,
    group: REMOTE,
    title: t("ssh buyrug‘ini o‘qish", "Reading the ssh command"),
    minutes: 5,
    intro: t(
      "ssh buyrug‘i kim sifatida, qaysi kompyuterga va qanday ulanishni aytadi.",
      "The ssh command says as whom, to which computer and how to connect.",
    ),
    analogy: t(
      "Mehmonxona qo‘ng‘irog‘iga o‘xshaydi: “212-xonadagi Aliga ulang” — xona raqami, ism va qaysi mehmonxona.",
      "Like calling a hotel: “Put me through to Ali in room 212” — the room, the name and which hotel.",
    ),
    theory: [
      t(
        "ssh foydalanuvchi@server — eng oddiy ko‘rinish. Foydalanuvchi berilmasa, kompyuterdagi joriy ismingiz olinadi.",
        "ssh user@server is the simplest form. Leave out the user and your current name on the laptop is used.",
      ),
      t(
        "-p — boshqa port (standart 22), -i — qaysi kalit fayli bilan kirish.",
        "-p picks another port (22 by default), -i picks which key file to sign in with.",
      ),
    ],
    task: t(
      "Buyruqning har bir qismini bosib o‘rganing.",
      "Click and explore every part of the command.",
    ),
    hint: t("Oltita qism bor.", "There are six parts."),
    widget: {
      type: "anatomy",
      lines: [
        [
          { text: "ssh", id: "ssh" },
          { text: " " },
          { text: "-p 2222", id: "port" },
          { text: " " },
          { text: "-i ~/.ssh/id_ed25519", id: "identity" },
          { text: " " },
          { text: "ali", id: "user" },
          { text: "@", id: "at" },
          { text: "203.0.113.10", id: "host" },
        ],
      ],
      parts: [
        {
          id: "ssh",
          title: t("ssh", "ssh"),
          body: t("SSH mijozi dasturi.", "The SSH client program."),
        },
        {
          id: "port",
          title: t("-p 2222 — port", "-p 2222 — port"),
          body: t(
            "Server odatdagi 22 o‘rniga 2222-portda tinglayapti.",
            "The server listens on port 2222 instead of the usual 22.",
          ),
        },
        {
          id: "identity",
          title: t("-i — kalit fayli", "-i — key file"),
          body: t(
            "Qaysi yopiq kalit bilan kirishni ko‘rsatadi. Odatda kerak emas: ssh standart kalitni o‘zi topadi.",
            "Which private key to sign in with. Usually not needed: ssh finds the default key itself.",
          ),
        },
        {
          id: "user",
          title: t("Foydalanuvchi", "User"),
          body: t(
            "Serverdagi akkaunt nomi — noutbukdagi ismingiz bilan bir xil bo‘lishi shart emas.",
            "The account name on the server — it need not match your name on the laptop.",
          ),
        },
        {
          id: "at",
          title: t("@", "@"),
          body: t(
            "“…da” ma’nosida: ali, 203.0.113.10 kompyuterida.",
            "Read it as “at”: ali at 203.0.113.10.",
          ),
        },
        {
          id: "host",
          title: t("Server", "Host"),
          body: t(
            "Server manzili: IP yoki domen nomi (server.uz).",
            "The server’s address: an IP or a domain name (server.uz).",
          ),
        },
      ],
    },
  },
  {
    id: 3,
    group: REMOTE,
    title: t("Birinchi ulanish", "Your first connection"),
    minutes: 8,
    intro: t(
      "Endi o‘zingiz ulaning. Birinchi marta SSH serverning kalit izini (fingerprint) ko‘rsatadi va ishonasizmi deb so‘raydi.",
      "Now connect yourself. The first time, SSH shows the server’s key fingerprint and asks whether you trust it.",
    ),
    analogy: t(
      "Yangi qo‘shni bilan tanishish: birinchi uchrashuvda yuzini eslab qolasiz. Keyingi safar boshqa odam “men qo‘shningizman” desa, darhol sezasiz.",
      "Meeting a new neighbour: the first time you remember their face. If someone else later says “I’m your neighbour”, you notice at once.",
    ),
    theory: [
      t(
        "“yes” desangiz, server kaliti ~/.ssh/known_hosts fayliga yoziladi. Keyingi ulanishlarda SSH uni o‘zi tekshiradi.",
        "Say “yes” and the server key is written to ~/.ssh/known_hosts. On later connections SSH checks it by itself.",
      ),
      t(
        "Parol yozilayotganda ekranda hech narsa ko‘rinmaydi — bu odatiy holat, hatto yulduzchalar ham chiqmaydi.",
        "Nothing shows on screen while you type the password — that is normal, not even stars appear.",
      ),
      t(
        "Bu laboratoriyada: foydalanuvchi ali, server server.uz, parol kalit-2026.",
        "In this lab: user ali, server server.uz, password kalit-2026.",
      ),
    ],
    task: t(
      "ssh ali@server.uz bilan ulaning, server kalitini qabul qiling, parolni kiriting, serverda hostname buyrug‘ini bajaring va exit bilan chiqing.",
      "Connect with ssh ali@server.uz, accept the server key, type the password, run hostname on the server and leave with exit.",
    ),
    hint: t(
      "ssh ali@server.uz → yes → kalit-2026 → hostname → exit",
      "ssh ali@server.uz → yes → kalit-2026 → hostname → exit",
    ),
    widget: {
      type: "ssh",
      goals: [
        {
          label: t(
            "Server kaliti qabul qilindi",
            "The server key was accepted",
          ),
          check: (sim) => did(sim, "accepted-host"),
        },
        {
          label: t("Parol bilan kirildi", "Signed in with the password"),
          check: (sim) => did(sim, "login"),
        },
        {
          label: t("Serverda hostname bajarildi", "Ran hostname on the server"),
          check: (sim) => did(sim, "remote:hostname"),
        },
        {
          label: t("exit bilan chiqildi", "Left with exit"),
          check: (sim) => did(sim, "logout"),
        },
      ],
    },
  },
  {
    id: 4,
    group: KEYS,
    title: t("Parol yoki kalit?", "Password or key?"),
    minutes: 6,
    intro: t(
      "Parol bilan kirish oddiy, lekin xavfli: parolni taxmin qilish, o‘g‘irlash yoki boshqa saytdan topish mumkin. SSH kalitlari ancha xavfsiz.",
      "Signing in with a password is simple but risky: passwords can be guessed, stolen or reused from another site. SSH keys are much safer.",
    ),
    analogy: t(
      "Parol — hamma eshitishi mumkin bo‘lgan maxfiy so‘z. Kalit juftligi — faqat sizda bo‘lgan muhr: server “muhringni bos” deydi, siz bosasiz, muhrning o‘zi esa hech qachon qo‘lingizdan chiqmaydi.",
      "A password is a secret word someone might overhear. A key pair is a seal only you hold: the server says “stamp this”, you stamp it, and the seal itself never leaves your hand.",
    ),
    theory: [
      t(
        "Kalit juftligi: yopiq kalit (id_ed25519) — faqat noutbukda, hech kimga berilmaydi. Ochiq kalit (id_ed25519.pub) — serverga qo‘yiladi, uni ko‘rsatish xavfsiz.",
        "A key pair: the private key (id_ed25519) stays on your laptop and is never shared. The public key (id_ed25519.pub) goes on the server; showing it is safe.",
      ),
      t(
        "Kirishda server tasodifiy savol yuboradi, mijoz uni yopiq kalit bilan imzolaydi, server esa ochiq kalit bilan tekshiradi. Parol tarmoqdan umuman o‘tmaydi.",
        "When you sign in, the server sends a random challenge, the client signs it with the private key and the server checks it with the public key. No password crosses the network.",
      ),
    ],
    task: t(
      "Har bir narsani joylang: noutbukda maxfiy saqlanadi yoki serverga qo‘yish mumkin?",
      "Place each item: kept secret on the laptop, or fine to put on the server?",
    ),
    hint: t(
      ".pub bilan tugagan fayl — ochiq (public).",
      "The file ending in .pub is the public one.",
    ),
    widget: {
      type: "sort",
      buckets: [
        {
          id: "laptop",
          label: t("Faqat noutbukda, sir", "Laptop only, secret"),
        },
        {
          id: "server",
          label: t("Serverga qo‘yish mumkin", "Fine on the server"),
        },
      ],
      items: [
        { label: t("id_ed25519", "id_ed25519"), code: true, bucket: "laptop" },
        {
          label: t("id_ed25519.pub", "id_ed25519.pub"),
          code: true,
          bucket: "server",
        },
        {
          label: t("Kalit uchun parol (passphrase)", "The key’s passphrase"),
          bucket: "laptop",
        },
        {
          label: t(
            "~/.ssh/authorized_keys ga qo‘shiladigan qator",
            "The line added to ~/.ssh/authorized_keys",
          ),
          bucket: "server",
        },
        {
          label: t(
            "“-----BEGIN OPENSSH PRIVATE KEY-----” bilan boshlanuvchi fayl",
            "A file starting “-----BEGIN OPENSSH PRIVATE KEY-----”",
          ),
          bucket: "laptop",
        },
        {
          label: t(
            "“ssh-ed25519 AAAA… student@laptop” qatori",
            "The line “ssh-ed25519 AAAA… student@laptop”",
          ),
          bucket: "server",
        },
      ],
    },
  },
  {
    id: 5,
    group: KEYS,
    title: t("Kalit yaratish va o‘rnatish", "Make and install a key"),
    minutes: 8,
    intro: t(
      "Endi kalit bilan kirishni sozlaysiz: kalit juftligini yaratasiz, ochiq kalitni serverga nusxalaysiz va parolsiz kirasiz.",
      "Now set up key sign-in: create a key pair, copy the public key to the server and sign in without a password.",
    ),
    analogy: t(
      "Eshikka o‘z qulfingizni o‘rnatish: bir marta kalit bilan kelasiz, keyin har safar kod so‘ralmaydi.",
      "Like fitting your own lock on the door: you set it up once, then no code is asked each time.",
    ),
    theory: [
      t(
        "ssh-keygen -t ed25519 — kalit juftligini yaratadi (~/.ssh/id_ed25519 va .pub). Haqiqiy hayotda kalitga ham parol (passphrase) qo‘yish tavsiya etiladi.",
        "ssh-keygen -t ed25519 creates the key pair (~/.ssh/id_ed25519 and .pub). In real life, give the key a passphrase too.",
      ),
      t(
        "ssh-copy-id ali@server.uz — ochiq kalitni serverdagi ~/.ssh/authorized_keys fayliga qo‘shadi. Buning uchun oxirgi marta parol so‘raladi.",
        "ssh-copy-id ali@server.uz adds the public key to ~/.ssh/authorized_keys on the server. It asks for the password one last time.",
      ),
    ],
    task: t(
      "Kalit yarating, uni serverga nusxalang va ssh ali@server.uz bilan parolsiz kiring.",
      "Create a key, copy it to the server and sign in with ssh ali@server.uz without a password.",
    ),
    hint: t(
      "ssh-keygen -t ed25519 → ssh-copy-id ali@server.uz → yes → kalit-2026 → ssh ali@server.uz",
      "ssh-keygen -t ed25519 → ssh-copy-id ali@server.uz → yes → kalit-2026 → ssh ali@server.uz",
    ),
    widget: {
      type: "ssh",
      goals: [
        {
          label: t("Kalit juftligi yaratildi", "A key pair was created"),
          check: (sim) => did(sim, "keygen"),
        },
        {
          label: t(
            "Ochiq kalit serverga nusxalandi",
            "The public key was copied to the server",
          ),
          check: (sim) => did(sim, "copied-key"),
        },
        {
          label: t(
            "Parolsiz, kalit bilan kirildi",
            "Signed in with the key, no password",
          ),
          check: (sim) => did(sim, "key-login"),
        },
      ],
    },
  },
  {
    id: 6,
    group: SAFE,
    title: t(
      "“Host key changed” ogohlantirishi",
      "The “host key changed” warning",
    ),
    minutes: 6,
    intro: t(
      "Bir kuni ulanmoqchi bo‘lsangiz, SSH katta ogohlantirish chiqaradi: “REMOTE HOST IDENTIFICATION HAS CHANGED!” Bu nimani anglatadi?",
      "One day SSH greets you with a big warning: “REMOTE HOST IDENTIFICATION HAS CHANGED!” What does it mean?",
    ),
    analogy: t(
      "Qo‘shningiz eshigini boshqa yuzli odam ochib, “men o‘shaman” desa — avval kimligini aniqlaysiz.",
      "If a stranger opens your neighbour’s door and says “it’s me” — you check who they are first.",
    ),
    theory: [
      t(
        "Server kaliti known_hosts dagisidan farq qiladi. Sababi zararsiz bo‘lishi mumkin (server qayta o‘rnatilgan), yoki kimdir orangizda turib, o‘zini server qilib ko‘rsatmoqda (man-in-the-middle).",
        "The server key no longer matches known_hosts. It may be harmless (the server was reinstalled), or someone between you is posing as the server (man-in-the-middle).",
      ),
      t(
        "To‘g‘ri yo‘l: to‘xtash, server administratoridan yangi kalit izini boshqa kanal orqali so‘rash va faqat mos kelsa, eski yozuvni o‘chirish (ssh-keygen -R server.uz).",
        "The right move: stop, ask the server’s admin for the new fingerprint through another channel, and only if it matches remove the old entry (ssh-keygen -R server.uz).",
      ),
    ],
    task: t(
      "Savollarga to‘g‘ri javob bering.",
      "Answer the questions correctly.",
    ),
    hint: t(
      "Shubha bo‘lsa — avval tekshiring, keyin ulaning.",
      "When in doubt — check first, connect later.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "“REMOTE HOST IDENTIFICATION HAS CHANGED” chiqdi. Birinchi qadam?",
            "“REMOTE HOST IDENTIFICATION HAS CHANGED” appears. First step?",
          ),
          options: [
            t(
              "known_hosts ni o‘chirib, darhol qayta ulanaman",
              "Delete known_hosts and reconnect at once",
            ),
            t(
              "To‘xtab, administratordan yangi kalit izini so‘rayman",
              "Stop and ask the admin for the new fingerprint",
            ),
            t("Parolni tezroq yozaman", "Type the password faster"),
          ],
          answer: 1,
          explain: t(
            "Bu hujum belgisi bo‘lishi mumkin — avval tekshirish kerak.",
            "It may be an attack — check first.",
          ),
        },
        {
          ask: t(
            "Bu ogohlantirish qaysi hujumdan himoya qiladi?",
            "Which attack does this warning protect against?",
          ),
          options: [
            t("O‘rtadagi odam (man-in-the-middle)", "Man-in-the-middle"),
            t("Virus", "A virus"),
            t("Spam", "Spam"),
          ],
          answer: 0,
          explain: t(
            "Soxta server boshqa kalit ko‘rsatadi va SSH buni sezadi.",
            "A fake server shows a different key, and SSH notices.",
          ),
        },
        {
          ask: t(
            "Administrator kalit izi to‘g‘ri ekanini tasdiqladi. Qaysi buyruq eski yozuvni o‘chiradi?",
            "The admin confirmed the new fingerprint. Which command removes the old entry?",
          ),
          options: [
            t("ssh-keygen -R server.uz", "ssh-keygen -R server.uz"),
            t("rm -rf ~", "rm -rf ~"),
            t("ssh-copy-id server.uz", "ssh-copy-id server.uz"),
          ],
          answer: 0,
          explain: t(
            "-R faqat shu serverning eski kalitini olib tashlaydi.",
            "-R removes only that server’s old key.",
          ),
        },
      ],
    },
  },
  {
    id: 7,
    group: SAFE,
    title: t("Serverni himoyalash", "Hardening the server"),
    minutes: 6,
    intro: t(
      "Internetga ochiq har bir SSH serverga har kuni minglab avtomatik parol taxminlari keladi. Bir nechta sozlama xavfni keskin kamaytiradi.",
      "Every SSH server on the internet gets thousands of automated password guesses a day. A few settings cut the risk sharply.",
    ),
    analogy: t(
      "Uyni qo‘riqlash: mustahkam qulf, begonalarga kalit bermaslik, kim kirganini kuzatish.",
      "Guarding a house: a strong lock, no keys for strangers, and watching who comes in.",
    ),
    theory: [
      t(
        "Server sozlamalari /etc/ssh/sshd_config faylida. Asosiylari: PasswordAuthentication no (faqat kalit), PermitRootLogin no (root bilan to‘g‘ridan-to‘g‘ri kirish yo‘q).",
        "Server settings live in /etc/ssh/sshd_config. The key ones: PasswordAuthentication no (keys only), PermitRootLogin no (no direct root sign-in).",
      ),
      t(
        "Qo‘shimcha: fail2ban kabi vositalar ko‘p marta xato qilgan IP manzillarni bloklaydi; kirish jurnalini (auth.log) kuzatib boring — Bash laboratoriyasidagi skript aynan shunga o‘xshaydi.",
        "Also: tools like fail2ban block IPs that fail too often; watch the login log (auth.log) — just like the script in the Bash lab.",
      ),
    ],
    task: t(
      "Har bir amaliyotni joylang: xavfsiz yoki xavfli?",
      "Sort each practice: safe or risky?",
    ),
    hint: t(
      "Parol va root bilan kirishni yopish — yaxshi; yopiq kalitni bo‘lishish — yomon.",
      "Turning off passwords and root sign-in is good; sharing a private key is bad.",
    ),
    widget: {
      type: "sort",
      buckets: [
        { id: "safe", label: t("Xavfsiz", "Safe") },
        { id: "risky", label: t("Xavfli", "Risky") },
      ],
      items: [
        {
          label: t("PasswordAuthentication no", "PasswordAuthentication no"),
          code: true,
          bucket: "safe",
        },
        {
          label: t("PermitRootLogin yes", "PermitRootLogin yes"),
          code: true,
          bucket: "risky",
        },
        {
          label: t(
            "Yopiq kalitni hamkasbga Telegramda yuborish",
            "Sending your private key to a colleague on Telegram",
          ),
          bucket: "risky",
        },
        {
          label: t("Kalitga passphrase qo‘yish", "Giving the key a passphrase"),
          bucket: "safe",
        },
        {
          label: t(
            "Hamma serverlarda “123456” paroli",
            "The password “123456” on every server",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "fail2ban bilan ko‘p xato qilgan IPlarni bloklash",
            "Blocking IPs that fail too often with fail2ban",
          ),
          bucket: "safe",
        },
        {
          label: t(
            "Host key ogohlantirishiga e’tibor bermaslik",
            "Ignoring a host key warning",
          ),
          bucket: "risky",
        },
        {
          label: t(
            "auth.log ni muntazam tekshirish",
            "Checking auth.log regularly",
          ),
          bucket: "safe",
        },
      ],
    },
  },
  {
    id: 8,
    group: SAFE,
    title: t("Yakuniy takrorlash", "Final review"),
    minutes: 6,
    intro: t(
      "SSH bo‘yicha bilimlaringizni tekshiring.",
      "Check what you know about SSH.",
    ),
    analogy: t(
      "SSH — serverlar dunyosiga kirish eshigi. Eshik qanchalik yaxshi qo‘riqlansa, ichkari shunchalik xavfsiz.",
      "SSH is the door into the world of servers. The better the door is guarded, the safer it is inside.",
    ),
    theory: [
      t(
        "Asosiy qoidalar: kalit bilan kiring, yopiq kalitni hech kimga bermang, host key ogohlantirishini e’tiborsiz qoldirmang.",
        "The core rules: sign in with keys, never share the private key, never ignore a host key warning.",
      ),
    ],
    task: t(
      "Barcha savollarga to‘g‘ri javob bering.",
      "Answer every question correctly.",
    ),
    hint: t(
      "Oldingi darslarga qaytishingiz mumkin.",
      "You can go back to earlier lessons.",
    ),
    widget: {
      type: "quiz",
      questions: [
        {
          ask: t(
            "SSH standart bo‘yicha qaysi portda ishlaydi?",
            "Which port does SSH use by default?",
          ),
          options: [t("80", "80"), t("22", "22"), t("443", "443")],
          answer: 1,
          explain: t("22 — SSH.", "22 is SSH."),
        },
        {
          ask: t(
            "Serverga qaysi fayl qo‘yiladi?",
            "Which file goes on the server?",
          ),
          options: [
            t("id_ed25519", "id_ed25519"),
            t("id_ed25519.pub", "id_ed25519.pub"),
            t("Ikkalasi ham", "Both"),
          ],
          answer: 1,
          explain: t(
            "Faqat ochiq (.pub) kalit.",
            "Only the public (.pub) key.",
          ),
        },
        {
          ask: t(
            "Nega SSH Telnetdan xavfsizroq?",
            "Why is SSH safer than Telnet?",
          ),
          options: [
            t("Tezroq ishlaydi", "It is faster"),
            t(
              "Hamma narsani, jumladan parolni shifrlaydi",
              "It encrypts everything, passwords included",
            ),
            t("Port raqami boshqa", "Its port number differs"),
          ],
          answer: 1,
          explain: t(
            "Telnet hammasini ochiq yuboradi.",
            "Telnet sends everything in the open.",
          ),
        },
        {
          ask: t(
            "known_hosts fayli nimani saqlaydi?",
            "What does the known_hosts file store?",
          ),
          options: [
            t("Parollarni", "Passwords"),
            t(
              "Ishonilgan serverlarning kalitlarini",
              "The keys of trusted servers",
            ),
            t("Buyruqlar tarixini", "Command history"),
          ],
          answer: 1,
          explain: t(
            "Shu tufayli SSH soxta serverni sezadi.",
            "That is how SSH spots a fake server.",
          ),
        },
        {
          ask: t(
            "Kalit bilan kirishda server sizni qanday tekshiradi?",
            "With key sign-in, how does the server check you?",
          ),
          options: [
            t("Yopiq kalitingizni so‘raydi", "It asks for your private key"),
            t(
              "Tasodifiy savolni imzolashingizni so‘raydi va ochiq kalit bilan tekshiradi",
              "It asks you to sign a random challenge and checks it with the public key",
            ),
            t("IP manzilingizga qaraydi", "It looks at your IP address"),
          ],
          answer: 1,
          explain: t(
            "Yopiq kalit hech qachon noutbukdan chiqmaydi.",
            "The private key never leaves the laptop.",
          ),
        },
      ],
    },
  },
];

export const PROGRESS_KEY = "cybervalue:ssh:progress:v1";

export const restoreProgress = (raw: unknown) => restoreLessons(raw, LESSONS);
